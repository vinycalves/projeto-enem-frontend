import {
  ChangeDetectionStrategy,
  Component,
  computed,
  effect,
  inject,
  input,
  signal,
} from '@angular/core';
import { Api } from '../../../core/api/api';
import { getDataset } from '../../../core/api/fn/crate-chemistry/get-dataset';
import { getApiErrorMessage } from '../../../core/api-error';
import { VisualizationParamsBridge } from '../../visualizations/visualization-params';
import { formatNumber, formatPh } from '../model/format';
import { AnalyteStrength, Indicator, TitrationModel } from '../model/titration';
import { ChartAnnotation, ChartPanel, ChartSeries } from '../shared/chart-panel';
import { ChemEquation, EquationTerm } from '../shared/chem-equation';
import { LabGlassware } from '../shared/lab-glassware';

interface AcidData {
  id: string;
  formula: string;
  name: string;
  strength: AnalyteStrength;
  ka: number | null;
  pka: number | null;
  equation: {
    reactants: EquationTerm[];
    products: EquationTerm[];
  };
}

interface AcidBaseData {
  kw: number;
  temperatureK: number;
  acids: AcidData[];
  indicators: Indicator[];
}

interface TitrationParams {
  analyte: string;
  concentration: number;
  volume: number;
  titrantConcentration: number;
  addedVolume: number;
  indicator: string;
}

const INDICATOR_COLORS: Record<string, string> = {
  incolor: '#d7e8df',
  rosa: '#f472b6',
  vermelho: '#ef4444',
  amarelo: '#facc15',
  azul: '#3b82f6',
};

@Component({
  selector: 'app-titration-visualization',
  imports: [ChartPanel, ChemEquation, LabGlassware],
  templateUrl: './titration-visualization.html',
  styleUrl: './titration-visualization.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TitrationVisualization {
  private readonly api = inject(Api);
  private readonly paramsBridge = inject(VisualizationParamsBridge);

  readonly params = input<Record<string, unknown>>({});

  protected readonly data = signal<AcidBaseData | null>(null);
  protected readonly loading = signal(true);
  protected readonly error = signal<string | null>(null);
  protected readonly model = signal<TitrationModel | null>(null);
  protected readonly addedVolume = signal(0);
  protected readonly selectedIndicator = signal<Indicator | null>(null);

  protected readonly acid = computed<AcidData | undefined>(() => {
    const data = this.data();
    const params = this.readParams();
    return data?.acids.find((item) => item.id === params.analyte) ?? data?.acids[0];
  });
  protected readonly equivalence = computed(() => this.model()?.equivalenceVolumeMl() ?? 0);
  protected readonly currentPH = computed(() => this.model()?.pHAt(this.addedVolume()) ?? 7);
  protected readonly curve = computed(() => this.model()?.curve() ?? []);
  protected readonly series = computed<ChartSeries[]>(() => [
    {
      id: 'titration',
      label: 'pH da solução',
      color: '#9fe3c2',
      points: this.curve().map((point) => ({ x: point.volumeMl, y: point.pH })),
    },
  ]);
  protected readonly annotations = computed<ChartAnnotation[]>(() => {
    const model = this.model();
    if (!model) {
      return [];
    }
    const equivalence = model.equivalenceVolumeMl();
    return [
      {
        x: equivalence,
        y: model.pHAt(equivalence),
        label: 'Equivalência',
        color: '#f4b183',
      },
    ];
  });
  protected readonly xDomain = computed<[number, number]>(() => [
    0,
    Math.max(this.equivalence() * 2, 10, this.addedVolume() + 5),
  ]);
  protected readonly indicatorState = computed(() => {
    const indicator = this.selectedIndicator();
    return indicator ? this.model()?.indicatorState(indicator, this.currentPH()) ?? 'transition' : 'transition';
  });
  protected readonly liquidColor = computed(() => {
    const indicator = this.selectedIndicator();
    if (!indicator) {
      return '#7dd3fc';
    }
    const state = this.indicatorState();
    const color = state === 'acid' ? indicator.acidColor : state === 'base' ? indicator.baseColor : indicator.baseColor;
    return INDICATOR_COLORS[color] ?? '#7dd3fc';
  });
  protected readonly indicatorLabel = computed(() => {
    const indicator = this.selectedIndicator();
    if (!indicator) {
      return 'Sem indicador';
    }
    const color =
      this.indicatorState() === 'acid'
        ? indicator.acidColor
        : this.indicatorState() === 'base'
          ? indicator.baseColor
          : 'transição';
    return `${indicator.name}: ${color}`;
  });

  constructor() {
    effect(() => {
      this.params();
      if (this.data()) {
        this.rebuild();
      }
    });
    void this.load();
  }

  protected goToEquivalence(): void {
    this.setAddedVolume(this.equivalence());
  }

  protected addVolume(amount: number): void {
    this.setAddedVolume(this.addedVolume() + amount);
  }

  protected formatPH(value: number): string {
    return formatPh(value);
  }

  protected formatVolume(value: number): string {
    return formatNumber(value, 1);
  }

  protected formatRangeValue(value: number): string {
    return formatNumber(value, 1);
  }

  private setAddedVolume(value: number): void {
    const clamped = Math.max(0, Math.min(value, this.xDomain()[1]));
    this.addedVolume.set(clamped);
    this.paramsBridge.update({ volumeAdicionado: clamped });
  }

  protected equationReactants(): EquationTerm[] {
    return this.acid()?.equation.reactants ?? [];
  }

  protected equationProducts(): EquationTerm[] {
    return this.acid()?.equation.products ?? [];
  }

  private readParams(): TitrationParams {
    const params = this.params();
    const analyte = params['analito'] === 'CH₃COOH (fraco)' ? 'acetic' : 'hcl';
    const concentration = Number(params['concentracaoAnalito']);
    const volume = Number(params['volumeAnalito']);
    const titrant = Number(params['concentracaoTitulante']);
    const added = Number(params['volumeAdicionado']);
    const indicator = typeof params['indicador'] === 'string' ? params['indicador'] : 'Fenolftaleína';
    return {
      analyte,
      concentration: Number.isFinite(concentration) ? Math.min(Math.max(concentration, 0.01), 0.2) : 0.1,
      volume: Number.isFinite(volume) ? Math.min(Math.max(volume, 10), 50) : 25,
      titrantConcentration: Number.isFinite(titrant) ? Math.min(Math.max(titrant, 0.01), 0.2) : 0.1,
      addedVolume: Number.isFinite(added) ? Math.max(added, 0) : 0,
      indicator,
    };
  }

  private rebuild(): void {
    const data = this.data();
    if (!data) {
      return;
    }
    const params = this.readParams();
    const acid = data.acids.find((item) => item.id === params.analyte) ?? data.acids[0];
    const model = new TitrationModel({
      analyte: acid.strength,
      analyteConcentration: params.concentration,
      analyteVolumeMl: params.volume,
      titrantConcentration: params.titrantConcentration,
      ka: acid.ka ?? 1e-14,
      kw: data.kw,
    });
    this.model.set(model);
    this.addedVolume.set(params.addedVolume);
    this.selectedIndicator.set(
      data.indicators.find((indicator) => indicator.name === params.indicator) ?? data.indicators[0],
    );
  }

  private async load(): Promise<void> {
    this.loading.set(true);
    this.error.set(null);
    try {
      const response = await this.api.invoke(getDataset, { name: 'acid-base-constants' });
      this.data.set(response.dataset.data as unknown as AcidBaseData);
      this.rebuild();
    } catch (error) {
      this.error.set(getApiErrorMessage(error, 'Não foi possível carregar os dados de titulação.'));
    } finally {
      this.loading.set(false);
    }
  }
}
