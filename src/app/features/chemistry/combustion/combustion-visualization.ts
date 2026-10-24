import {
  ChangeDetectionStrategy,
  Component,
  OnDestroy,
  computed,
  effect,
  inject,
  input,
  signal,
} from '@angular/core';
import { Api } from '../../../core/api/api';
import { getDataset } from '../../../core/api/fn/crate-chemistry/get-dataset';
import { getReaction } from '../../../core/api/fn/crate-chemistry/get-reaction';
import { ReactionSeed } from '../../../core/api/models/reaction-seed';
import { ReactionStageSeed } from '../../../core/api/models/reaction-stage-seed';
import { getApiErrorMessage } from '../../../core/api-error';
import { VisualizationParamsBridge } from '../../visualizations/visualization-params';
import { formatNumber } from '../model/format';
import { atomConservation, countElements, deltaHFromFormation } from '../model/thermochemistry';
import { ChemEquation, EquationTerm } from '../shared/chem-equation';
import { ChemFormula } from '../shared/chem-formula';
import { EnergyLevelDiagram } from '../shared/energy-level-diagram';

interface ThermochemistryData {
  formationEnthalpiesKjMol: Record<string, number>;
  methaneCombustion: {
    deltaHKjMol: number;
    referenceState: string;
    note: string;
  };
}

@Component({
  selector: 'app-combustion-visualization',
  imports: [ChemEquation, ChemFormula, EnergyLevelDiagram],
  templateUrl: './combustion-visualization.html',
  styleUrl: './combustion-visualization.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CombustionVisualization implements OnDestroy {
  private readonly api = inject(Api);
  private readonly paramsBridge = inject(VisualizationParamsBridge);
  private timer?: ReturnType<typeof setInterval>;

  readonly params = input<Record<string, unknown>>({});

  protected readonly reaction = signal<ReactionSeed | null>(null);
  protected readonly dataset = signal<ThermochemistryData | null>(null);
  protected readonly loading = signal(true);
  protected readonly error = signal<string | null>(null);
  protected readonly progress = signal(0);
  protected readonly playing = signal(false);
  protected readonly reducedMotion =
    typeof window !== 'undefined' &&
    typeof window.matchMedia === 'function' &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  protected readonly reactants = computed<EquationTerm[]>(() =>
    (this.reaction()?.species ?? [])
      .filter((species) => species.side === 'reactant')
      .map((species) => ({
        formula: species.formula,
        coefficient: species.coefficient,
        state: species.state,
        charge: species.charge,
      })),
  );
  protected readonly products = computed<EquationTerm[]>(() =>
    (this.reaction()?.species ?? [])
      .filter((species) => species.side === 'product')
      .map((species) => ({
        formula: species.formula,
        coefficient: species.coefficient,
        state: species.state,
        charge: species.charge,
      })),
  );
  protected readonly reactantSpecies = computed(() =>
    (this.reaction()?.species ?? []).filter((species) => species.side === 'reactant'),
  );
  protected readonly productSpecies = computed(() =>
    (this.reaction()?.species ?? []).filter((species) => species.side === 'product'),
  );
  protected readonly reactantElements = computed(() =>
    this.reaction() ? countElements(this.reaction()!, 'reactant') : [],
  );
  protected readonly productElements = computed(() =>
    this.reaction() ? countElements(this.reaction()!, 'product') : [],
  );
  protected readonly conserved = computed(() =>
    this.reaction() ? atomConservation(this.reaction()!) : false,
  );
  protected readonly stage = computed<ReactionStageSeed | undefined>(() => {
    const stages = this.reaction()?.stages ?? [];
    const value = this.progress();
    return stages.find((item) => value >= item.from && value < item.to) ?? stages[stages.length - 1];
  });
  protected readonly deltaH = computed(() => {
    const dataset = this.dataset();
    return (
      dataset?.methaneCombustion.deltaHKjMol ??
      this.reaction()?.thermodynamics?.deltaHKjMol ??
      0
    );
  });
  protected readonly formationDeltaH = computed(() => {
    const dataset = this.dataset();
    const reaction = this.reaction();
    if (!dataset || !reaction) {
      return null;
    }
    try {
      return deltaHFromFormation(
        dataset.formationEnthalpiesKjMol,
        reaction.species.map((species) => ({
          key: `${species.formula}(${species.state})`,
          coefficient: species.coefficient,
          side: species.side as 'reactant' | 'product',
        })),
      );
    } catch {
      return null;
    }
  });
  protected readonly showEnergy = computed(() => this.params()['mostrarEnergia'] !== false);

  constructor() {
    effect(() => {
      const etapa = Number(this.params()['etapa']);
      if (Number.isFinite(etapa) && !this.playing()) {
        this.progress.set(Math.min(Math.max(etapa, 0), 1));
      }
    });
    void this.load();
  }

  ngOnDestroy(): void {
    this.stop();
  }

  protected togglePlay(): void {
    if (this.playing()) {
      this.stop();
      return;
    }
    if (this.progress() >= 1) {
      this.progress.set(0);
    }
    this.playing.set(true);
    this.paramsBridge.update({ etapa: this.progress() });
    this.timer = setInterval(() => {
      const next = this.progress() + 0.012;
      if (next >= 1) {
        this.progress.set(1);
        this.paramsBridge.update({ etapa: 1 });
        this.stop();
        return;
      }
      this.progress.set(next);
      this.paramsBridge.update({ etapa: next });
    }, 40);
  }

  protected setProgress(event: Event): void {
    const value = Number((event.target as HTMLInputElement).value);
    this.progress.set(Math.min(Math.max(value, 0), 1));
    this.paramsBridge.update({ etapa: this.progress() });
    this.stop();
  }

  protected reset(): void {
    this.stop();
    this.progress.set(0);
    this.paramsBridge.update({ etapa: 0 });
  }

  protected formattedDeltaH(): string {
    return formatNumber(this.deltaH(), 1);
  }

  protected formattedFormationDeltaH(): string {
    return formatNumber(this.formationDeltaH() ?? 0, 1);
  }

  protected atomColor(element: string): string {
    return (
      {
        C: '#94a3b8',
        H: '#e2e8f0',
        O: '#f87171',
        N: '#60a5fa',
        S: '#facc15',
      }[element] ?? '#a7c5b5'
    );
  }

  private stop(): void {
    this.playing.set(false);
    if (this.timer) {
      clearInterval(this.timer);
      this.timer = undefined;
    }
  }

  private async load(): Promise<void> {
    this.loading.set(true);
    this.error.set(null);
    try {
      const [reaction, dataset] = await Promise.all([
        this.api.invoke(getReaction, { id: 'methane-combustion' }),
        this.api.invoke(getDataset, { name: 'thermochemistry' }),
      ]);
      this.reaction.set(reaction.reaction);
      this.dataset.set(dataset.dataset.data as unknown as ThermochemistryData);
    } catch (error) {
      this.error.set(getApiErrorMessage(error, 'Não foi possível carregar a reação.'));
    } finally {
      this.loading.set(false);
    }
  }
}
