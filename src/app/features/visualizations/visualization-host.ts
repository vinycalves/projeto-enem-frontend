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
import {
  ParamDefinition,
  ParameterPanel,
} from '../../shared/ui/parameter-panel/parameter-panel';

const VISUALIZATIONS: Record<string, () => Promise<Type<unknown>>> = {
  'projectile-2d': () =>
    import('../physics/lancamento-obliquo/projectile-visualization').then(
      (module) => module.ProjectileVisualization,
    ),
  'dna-3d': () =>
    import('../biology/dna-3d/dna-visualization').then((module) => module.DnaVisualization),
};

@Component({
  selector: 'app-visualization-host',
  imports: [NgComponentOutlet, ParameterPanel, RouterLink],
  templateUrl: './visualization-host.html',
  styleUrl: './visualization-host.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class VisualizationHost implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly api = inject(Api);
  private readonly destroyRef = inject(DestroyRef);

  protected readonly visualization = signal<VisualizationDetail | null>(null);
  protected readonly params = signal<ParamDefinition[]>([]);
  protected readonly values = signal<Record<string, unknown>>({});
  protected readonly component = signal<Type<unknown> | null>(null);
  protected readonly loading = signal(true);
  protected readonly error = signal<string | null>(null);
  protected readonly dimensionLabel = computed(() =>
    this.visualization()?.dimension === '3d' ? '3D' : '2D',
  );

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

  private async load(slug: string): Promise<void> {
    this.loading.set(true);
    this.error.set(null);
    this.visualization.set(null);
    this.component.set(null);

    try {
      const response = await this.api.invoke(getVisualization, { slug });
      const visualization = response.visualization;
      const params: ParamDefinition[] = visualization.params.map((param) => ({
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
