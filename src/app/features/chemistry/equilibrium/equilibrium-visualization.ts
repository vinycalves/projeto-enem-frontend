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
import { getApiErrorMessage } from '../../../core/api-error';
import { FixedStepLoop } from '../../../shared/sim/fixed-step-loop';
import { EquilibriumModel, EquilibriumState } from '../model/equilibrium';
import { formatNumber, formatScientific } from '../model/format';
import { ChartPanel, ChartSeries } from '../shared/chart-panel';
import { ChemEquation, EquationTerm } from '../shared/chem-equation';

interface EquilibriumData {
  n2o4No2: {
    kc: number;
    temperatureK: number;
    deltaHKjMol: number;
    note: string;
  };
}

interface EquilibriumParams {
  n2o4Inicial: number;
  no2Inicial: number;
}

@Component({
  selector: 'app-equilibrium-visualization',
  imports: [ChartPanel, ChemEquation],
  templateUrl: './equilibrium-visualization.html',
  styleUrl: './equilibrium-visualization.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class EquilibriumVisualization implements OnDestroy {
  private readonly api = inject(Api);
  private model?: EquilibriumModel;
  private loop?: FixedStepLoop;
  private lastPublish = 0;

  readonly params = input<Record<string, unknown>>({});

  protected readonly reaction = signal<ReactionSeed | null>(null);
  protected readonly data = signal<EquilibriumData | null>(null);
  protected readonly loading = signal(true);
  protected readonly error = signal<string | null>(null);
  protected readonly state = signal<EquilibriumState | null>(null);
  protected readonly playing = signal(false);
  protected readonly n2o4History = signal<Array<{ x: number; y: number }>>([]);
  protected readonly no2History = signal<Array<{ x: number; y: number }>>([]);
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
      })),
  );
  protected readonly products = computed<EquationTerm[]>(() =>
    (this.reaction()?.species ?? [])
      .filter((species) => species.side === 'product')
      .map((species) => ({
        formula: species.formula,
        coefficient: species.coefficient,
        state: species.state,
      })),
  );
  protected readonly series = computed<ChartSeries[]>(() => [
    {
      id: 'n2o4',
      label: '[N₂O₄] (mol/L)',
      color: '#f4b183',
      points: this.n2o4History(),
    },
    {
      id: 'no2',
      label: '[NO₂] (mol/L)',
      color: '#7dd3fc',
      points: this.no2History(),
    },
  ]);
  protected readonly xDomain = computed<[number, number]>(() => [
    0,
    Math.max(20, Math.ceil(this.state()?.timeSeconds ?? 20)),
  ]);
  protected readonly yDomain = computed<[number, number]>(() => {
    const current = this.state();
    const maximum = Math.max(
      0.12,
      current?.n2o4 ?? 0,
      current?.no2 ?? 0,
      ...this.n2o4History().map((point) => point.y),
      ...this.no2History().map((point) => point.y),
    );
    return [0, maximum * 1.1];
  });
  protected readonly particleCounts = computed(() => {
    const current = this.state();
    if (!current) {
      return { n2o4: 0, no2: 0 };
    }
    return {
      n2o4: Math.min(12, Math.round(current.n2o4 * 120)),
      no2: Math.min(24, Math.round(current.no2 * 120)),
    };
  });
  protected readonly directionLabel = computed(() => {
    const direction = this.state()?.direction;
    if (direction === 'forward') {
      return 'Avança para os produtos';
    }
    if (direction === 'reverse') {
      return 'Avança para os reagentes';
    }
    return 'Em equilíbrio';
  });

  constructor() {
    effect(() => {
      this.params();
      if (this.data()) {
        this.reset();
      }
    });
    void this.load();
  }

  ngOnDestroy(): void {
    this.loop?.stop();
  }

  protected togglePlay(): void {
    if (this.playing()) {
      this.loop?.stop();
      this.playing.set(false);
      return;
    }
    if (!this.loop) {
      this.createLoop().start();
    } else {
      this.loop.start();
    }
    this.playing.set(true);
  }

  protected reset(): void {
    const data = this.data();
    if (!data) {
      return;
    }
    const params = this.readParams();
    this.model = new EquilibriumModel({
      initialN2O4: params.n2o4Inicial,
      initialNO2: params.no2Inicial,
      kc: data.n2o4No2.kc,
    });
    this.n2o4History.set([{ x: 0, y: this.model.n2o4 }]);
    this.no2History.set([{ x: 0, y: this.model.no2 }]);
    this.state.set(this.model.state());
    this.loop?.stop();
    this.loop = undefined;
    this.playing.set(false);
    if (!this.reducedMotion) {
      this.createLoop().start();
      this.playing.set(true);
    }
  }

  protected addN2O4(): void {
    this.model?.addN2O4(0.01);
    this.publish(true);
  }

  protected addNO2(): void {
    this.model?.addNO2(0.01);
    this.publish(true);
  }

  protected compress(): void {
    this.model?.compress(0.5);
    this.publish(true);
  }

  protected formatConcentration(value: number | undefined): string {
    return formatNumber(value ?? 0, 4);
  }

  protected formatQ(value: number | undefined): string {
    return formatScientific(value ?? 0, 2);
  }

  protected formatTime(value: number | undefined): string {
    return formatNumber(value ?? 0, 1);
  }

  protected particleIndexes(count: number): number[] {
    return Array.from({ length: count }, (_, index) => index);
  }

  private readParams(): EquilibriumParams {
    const params = this.params();
    const n2o4 = Number(params['n2o4Inicial']);
    const no2 = Number(params['no2Inicial']);
    return {
      n2o4Inicial: Number.isFinite(n2o4) ? Math.min(Math.max(n2o4, 0.01), 0.1) : 0.05,
      no2Inicial: Number.isFinite(no2) ? Math.min(Math.max(no2, 0), 0.05) : 0,
    };
  }

  private createLoop(): FixedStepLoop {
    const loop = new FixedStepLoop(
      0.02,
      (dt) => this.model?.step(dt),
      () => this.publish(false),
      0.2,
    );
    this.loop = loop;
    return loop;
  }

  private publish(force: boolean): void {
    if (!this.model) {
      return;
    }
    const now = performance.now();
    if (!force && now - this.lastPublish < 70) {
      return;
    }
    this.lastPublish = now;
    this.state.set(this.model.state());
    const time = this.model.timeSeconds;
    const n2o4 = this.n2o4History();
    const no2 = this.no2History();
    this.n2o4History.set([...n2o4.slice(-279), { x: time, y: this.model.n2o4 }]);
    this.no2History.set([...no2.slice(-279), { x: time, y: this.model.no2 }]);
  }

  private async load(): Promise<void> {
    this.loading.set(true);
    this.error.set(null);
    try {
      const [reaction, dataset] = await Promise.all([
        this.api.invoke(getReaction, { id: 'n2o4-no2-equilibrium' }),
        this.api.invoke(getDataset, { name: 'equilibrium-constants' }),
      ]);
      this.reaction.set(reaction.reaction);
      this.data.set(dataset.dataset.data as unknown as EquilibriumData);
      this.reset();
    } catch (error) {
      this.error.set(getApiErrorMessage(error, 'Não foi possível carregar o equilíbrio.'));
    } finally {
      this.loading.set(false);
    }
  }
}
