import { NgComponentOutlet } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  OnInit,
  Type,
  computed,
  inject,
  signal,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { Api } from '../../core/api/api';
import { getVisualization } from '../../core/api/fn/crate-visualizations/get-visualization';
import { VisualizationDetail } from '../../core/api/models/visualization-detail';
import { getApiErrorMessage } from '../../core/api-error';
import { dnaVisualizationParams } from '../biology/dna-3d/dna-parameters';
import { MiniQuiz } from '../chemistry/shared/mini-quiz';
import {
  ParamDefinition,
  ParameterPanel,
} from '../../shared/ui/parameter-panel/parameter-panel';
import { VisualizationParamsBridge } from './visualization-params';

const VISUALIZATIONS: Record<string, () => Promise<Type<unknown>>> = {
  'projectile-2d': () =>
    import('../physics/lancamento-obliquo/projectile-visualization').then(
      (module) => module.ProjectileVisualization,
    ),
  'dna-3d': () =>
    import('../biology/dna-3d/dna-visualization').then((module) => module.DnaVisualization),
  'combustion-2d': () =>
    import('../chemistry/combustion/combustion-visualization').then(
      (module) => module.CombustionVisualization,
    ),
  'equilibrium-2d': () =>
    import('../chemistry/equilibrium/equilibrium-visualization').then(
      (module) => module.EquilibriumVisualization,
    ),
  'titration-2d': () =>
    import('../chemistry/titration/titration-visualization').then(
      (module) => module.TitrationVisualization,
    ),
};

@Component({
  selector: 'app-visualization-host',
  imports: [NgComponentOutlet, ParameterPanel, MiniQuiz, RouterLink],
  templateUrl: './visualization-host.html',
  styleUrl: './visualization-host.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class VisualizationHost implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly api = inject(Api);
  private readonly destroyRef = inject(DestroyRef);
  private readonly paramsBridge = inject(VisualizationParamsBridge);

  protected readonly visualization = signal<VisualizationDetail | null>(null);
  protected readonly params = signal<ParamDefinition[]>([]);
  protected readonly values = signal<Record<string, unknown>>({});
  protected readonly component = signal<Type<unknown> | null>(null);
  protected readonly loading = signal(true);
  protected readonly error = signal<string | null>(null);
  protected readonly dimensionLabel = computed(() =>
    this.visualization()?.dimension === '3d' ? '3D' : '2D',
  );

  constructor() {
    this.paramsBridge.connect((patch) => {
      this.values.update((current) => ({ ...current, ...patch }));
    });
  }

  ngOnInit(): void {
    this.route.paramMap.pipe(takeUntilDestroyed(this.destroyRef)).subscribe((params) => {
      const slug = params.get('slug');
      if (!slug) {
        this.loading.set(false);
        this.error.set('Visualização não identificada.');
        return;
      }
      void this.load(slug);
    });
  }

  protected onParamsChange(values: Record<string, unknown>): void {
    this.values.set(values);
  }

  protected resetParams(): void {
    const defaults: Record<string, unknown> = {};
    for (const param of this.params()) {
      defaults[param.id] = param.default;
    }
    this.values.set(defaults);
  }

  protected difficultyLabel(value: string): string {
    return (
      {
        basico: 'Básico',
        intermediario: 'Intermediário',
        avancado: 'Avançado',
      }[value] ?? value
    );
  }

  protected modelKindLabel(value: string): string {
    return (
      {
        simulacao: 'Simulação',
        animacao_didatica: 'Animação didática',
        diagrama: 'Diagrama',
      }[value] ?? value
    );
  }

  protected tierLabel(value: string): string {
    return (
      {
        T1: 'Alta recorrência',
        T2: 'Média recorrência',
        T3: 'Baixa recorrência',
      }[value] ?? value
    );
  }

  private async load(slug: string): Promise<void> {
    this.loading.set(true);
    this.error.set(null);
    this.visualization.set(null);
    this.component.set(null);

    try {
      const response = await this.api.invoke(getVisualization, { slug });
      const visualization = response.visualization;
      const seedParams: ParamDefinition[] = visualization.params.map((param) => ({
        id: param.id,
        label: param.label,
        kind: param.kind,
        min: param.min,
        max: param.max,
        step: param.step,
        default: param.default,
        unit: param.unit,
        options: param.options,
      }));
      const params =
        visualization.component_key === 'dna-3d' ? dnaVisualizationParams(seedParams) : seedParams;
      const defaults: Record<string, unknown> = {};
      for (const param of params) {
        defaults[param.id] = param.default;
      }

      this.visualization.set(visualization);
      this.params.set(params);
      this.values.set(defaults);

      const loader = VISUALIZATIONS[visualization.component_key];
      if (!loader) {
        this.error.set(
          `A visualização “${visualization.title}” ainda não tem componente registrado no frontend.`,
        );
        return;
      }
      this.component.set(await loader());
    } catch (error) {
      this.error.set(getApiErrorMessage(error, 'Não foi possível abrir esta visualização.'));
    } finally {
      this.loading.set(false);
    }
  }
}
