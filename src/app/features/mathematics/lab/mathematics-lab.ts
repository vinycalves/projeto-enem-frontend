import { ChangeDetectionStrategy, Component, DestroyRef, OnInit, computed, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { formatNumber } from '../../chemistry/model/format';
import { readDesmosSettings } from './desmos';
import { DesmosPlot } from './desmos-plot';
import {
  applySuccessiveChanges,
  compoundInterest,
  percentChange,
  percentageOf,
  simpleInterest,
} from './finance';
import { FunctionKind, sampleFunction } from './function-plot';
import {
  calculateGeometry,
  GeometryShape,
  GeometryValues,
  isGeometryShape,
  isPlanarShape,
  PLANAR_SHAPES,
  SOLID_SHAPES,
} from './geometry';
import { GeometrySolidView } from './geometry-solid-view';
import { buildGeometryDiagram, buildSolidRenderParams } from './geometry-visual';
import { combination, classicalProbability, permutation } from './probability';
import { solveRuleOfThree } from './proportion';
import { calculateStatistics, parseNumberList } from './statistics';

type MathProcess = 'finance' | 'proportion' | 'geometry' | 'statistics' | 'probability' | 'function';
type Relation = 'direct' | 'inverse';
type GeometryView = '2d' | '3d';

@Component({
  selector: 'app-mathematics-lab',
  imports: [RouterLink, GeometrySolidView, DesmosPlot],
  templateUrl: './mathematics-lab.html',
  styleUrl: './mathematics-lab.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MathematicsLab implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly destroyRef = inject(DestroyRef);

  protected readonly activeProcess = signal<MathProcess>('finance');
  protected readonly relation = signal<Relation>('direct');
  protected readonly shape = signal<GeometryShape>('rectangle');
  protected readonly geometryView = signal<GeometryView>('2d');
  protected readonly functionKind = signal<FunctionKind>('affine');
  protected readonly statisticsInput = signal('10; 12; 12; 14; 20');
  protected readonly desmosFailed = signal(false);
  protected readonly desmosConfigured = readDesmosSettings() !== null;

  protected readonly percentageValue = signal<number | null>(200);
  protected readonly percentageRate = signal<number | null>(15);
  protected readonly initialValue = signal<number | null>(200);
  protected readonly finalValue = signal<number | null>(250);
  protected readonly successiveValue = signal<number | null>(100);
  protected readonly successiveRates = signal('20; -20');
  protected readonly capital = signal<number | null>(1000);
  protected readonly interestRate = signal<number | null>(10);
  protected readonly periods = signal<number | null>(2);

  protected readonly proportionA = signal<number | null>(2);
  protected readonly proportionB = signal<number | null>(4);
  protected readonly proportionC = signal<number | null>(3);

  protected readonly geometryBase = signal<number | null>(4);
  protected readonly geometryTop = signal<number | null>(2);
  protected readonly geometryHeight = signal<number | null>(3);
  protected readonly geometryRadius = signal<number | null>(2);
  protected readonly geometryDepth = signal<number | null>(2);

  protected readonly favorable = signal<number | null>(3);
  protected readonly totalOutcomes = signal<number | null>(8);
  protected readonly countN = signal<number | null>(5);
  protected readonly countP = signal<number | null>(2);

  protected readonly functionA = signal<number | null>(1);
  protected readonly functionB = signal<number | null>(0);
  protected readonly functionC = signal<number | null>(0);

  protected readonly percentageResult = computed(() => {
    const value = this.percentageValue();
    const rate = this.percentageRate();
    return value === null || rate === null ? null : percentageOf(value, rate);
  });
  protected readonly changeResult = computed(() => {
    const initial = this.initialValue();
    const final = this.finalValue();
    return initial === null || final === null ? null : percentChange(initial, final);
  });
  protected readonly successiveResult = computed(() => {
    const value = this.successiveValue();
    if (value === null) return null;
    const rates = this.successiveRates()
      .split(/[;,]/)
      .map((item) => Number(item.trim()))
      .filter((item) => Number.isFinite(item));
    return applySuccessiveChanges(value, rates);
  });
  protected readonly simpleResult = computed(() => {
    const c = this.capital();
    const i = this.interestRate();
    const t = this.periods();
    return c === null || i === null || t === null ? null : simpleInterest(c, i, t);
  });
  protected readonly compoundResult = computed(() => {
    const c = this.capital();
    const i = this.interestRate();
    const t = this.periods();
    return c === null || i === null || t === null ? null : compoundInterest(c, i, t);
  });
  protected readonly proportionResult = computed(() => {
    const a = this.proportionA();
    const b = this.proportionB();
    const c = this.proportionC();
    return a === null || b === null || c === null
      ? null
      : solveRuleOfThree(a, b, c, this.relation());
  });
  protected readonly geometryValues = computed<GeometryValues>(() => ({
    base: this.geometryBase() ?? undefined,
    top: this.geometryTop() ?? undefined,
    height: this.geometryHeight() ?? undefined,
    radius: this.geometryRadius() ?? undefined,
    depth: this.geometryDepth() ?? undefined,
  }));
  protected readonly geometryResult = computed(() =>
    calculateGeometry(this.shape(), this.geometryValues()),
  );
  protected readonly geometryDiagram = computed(() => {
    const shape = this.shape();
    return isPlanarShape(shape)
      ? buildGeometryDiagram(shape, this.geometryValues())
      : null;
  });
  protected readonly solidRenderParams = computed(() => {
    const shape = this.shape();
    return isPlanarShape(shape) ? null : buildSolidRenderParams(shape, this.geometryValues());
  });
  protected readonly geometryShapes = computed<readonly GeometryShape[]>(() =>
    this.geometryView() === '2d' ? PLANAR_SHAPES : SOLID_SHAPES,
  );
  protected readonly geometryLegend = computed(() => {
    const shape = this.shape();
    if (shape === 'circle') return 'r = raio · o ponto central é o centro da circunferência';
    if (shape === 'trapezoid') return 'B = base maior · b = base menor · h = altura';
    return 'b = base · h = altura';
  });
  protected readonly statisticsResult = computed(() =>
    calculateStatistics(parseNumberList(this.statisticsInput())),
  );
  protected readonly probabilityResult = computed(() => {
    const favorable = this.favorable();
    const total = this.totalOutcomes();
    return favorable === null || total === null ? null : classicalProbability(favorable, total);
  });
  protected readonly permutationResult = computed(() => {
    const n = this.countN();
    const p = this.countP();
    return n === null || p === null ? null : permutation(n, p);
  });
  protected readonly combinationResult = computed(() => {
    const n = this.countN();
    const p = this.countP();
    return n === null || p === null ? null : combination(n, p);
  });
  protected readonly functionSample = computed(() =>
    sampleFunction(
      this.functionKind(),
      this.functionA() ?? 0,
      this.functionB() ?? 0,
      this.functionC() ?? 0,
    ),
  );
  protected readonly functionPath = computed(() => {
    const sample = this.functionSample();
    if (!sample) return '';
    const minY = Math.min(sample.minY, 0);
    const maxY = Math.max(sample.maxY, 0);
    const yRange = Math.max(maxY - minY, 1);
    return sample.points
      .map((point, index) => {
        const x = 60 + ((point.x + 10) / 20) * 520;
        const y = 280 - ((point.y - minY) / yRange) * 240;
        return `${index === 0 ? 'M' : 'L'} ${x.toFixed(1)} ${y.toFixed(1)}`;
      })
      .join(' ');
  });
  protected readonly functionDescription = computed(
    () => this.functionSample()?.description ?? 'Função inválida',
  );

  protected readonly geometryFields = computed(() => {
    const shape = this.shape();
    return {
      base: ['rectangle', 'triangle', 'trapezoid', 'rectangularPrism'].includes(shape),
      top: shape === 'trapezoid',
      height: ['rectangle', 'triangle', 'trapezoid', 'cylinder', 'cone', 'rectangularPrism'].includes(shape),
      radius: ['circle', 'cylinder', 'cone', 'sphere'].includes(shape),
      depth: shape === 'rectangularPrism',
    };
  });
  protected readonly geometryFieldLabels = computed(() => {
    const shape = this.shape();
    return {
      base: shape === 'rectangularPrism' ? 'Comprimento' : shape === 'trapezoid' ? 'Base maior' : 'Base',
      top: 'Base menor',
      height: 'Altura',
      radius: 'Raio',
      depth: 'Profundidade',
    };
  });

  ngOnInit(): void {
    this.route.queryParamMap.pipe(takeUntilDestroyed(this.destroyRef)).subscribe((params) => {
      const process = params.get('process');
      if (
        process === 'finance' ||
        process === 'proportion' ||
        process === 'geometry' ||
        process === 'statistics' ||
        process === 'probability' ||
        process === 'function'
      ) {
        this.activeProcess.set(process);
      }
    });
  }

  protected setProcess(process: MathProcess): void {
    this.activeProcess.set(process);
  }

  protected setRelation(value: string): void {
    this.relation.set(value === 'inverse' ? 'inverse' : 'direct');
  }

  protected setShape(value: string): void {
    if (!isGeometryShape(value)) return;
    this.shape.set(value);
    this.geometryView.set(isPlanarShape(value) ? '2d' : '3d');
  }

  protected setGeometryView(view: GeometryView): void {
    if (view === this.geometryView()) return;
    this.geometryView.set(view);
    const allowed = view === '2d' ? PLANAR_SHAPES : SOLID_SHAPES;
    if (!(allowed as readonly string[]).includes(this.shape())) {
      this.shape.set(view === '2d' ? 'rectangle' : 'cylinder');
    }
  }

  protected markDesmosFailed(): void {
    this.desmosFailed.set(true);
  }

  protected setFunctionKind(value: string): void {
    this.functionKind.set(
      value === 'quadratic' || value === 'exponential' ? value : 'affine',
    );
  }

  protected setNumber(name: string, event: Event): void {
    const raw = (event.target as HTMLInputElement).value;
    const value = raw.trim() === '' ? null : Number(raw);
    const safe = value !== null && Number.isFinite(value) ? value : null;
    const map: Record<string, (value: number | null) => void> = {
      percentageValue: (v) => this.percentageValue.set(v),
      percentageRate: (v) => this.percentageRate.set(v),
      initialValue: (v) => this.initialValue.set(v),
      finalValue: (v) => this.finalValue.set(v),
      successiveValue: (v) => this.successiveValue.set(v),
      capital: (v) => this.capital.set(v),
      interestRate: (v) => this.interestRate.set(v),
      periods: (v) => this.periods.set(v),
      proportionA: (v) => this.proportionA.set(v),
      proportionB: (v) => this.proportionB.set(v),
      proportionC: (v) => this.proportionC.set(v),
      geometryBase: (v) => this.geometryBase.set(v),
      geometryTop: (v) => this.geometryTop.set(v),
      geometryHeight: (v) => this.geometryHeight.set(v),
      geometryRadius: (v) => this.geometryRadius.set(v),
      geometryDepth: (v) => this.geometryDepth.set(v),
      favorable: (v) => this.favorable.set(v),
      totalOutcomes: (v) => this.totalOutcomes.set(v),
      countN: (v) => this.countN.set(v),
      countP: (v) => this.countP.set(v),
      functionA: (v) => this.functionA.set(v),
      functionB: (v) => this.functionB.set(v),
      functionC: (v) => this.functionC.set(v),
    };
    map[name]?.(safe);
  }

  protected setSuccessiveRates(value: string): void {
    this.successiveRates.set(value);
  }

  protected setStatisticsInput(value: string): void {
    this.statisticsInput.set(value);
  }

  protected format(value: number | null | undefined, digits = 2): string {
    return formatNumber(value ?? 0, digits);
  }

  protected shapeLabel(shape: GeometryShape): string {
    return (
      {
        rectangle: 'Retângulo',
        triangle: 'Triângulo',
        circle: 'Círculo',
        trapezoid: 'Trapézio',
        cylinder: 'Cilindro',
        cone: 'Cone',
        sphere: 'Esfera',
        rectangularPrism: 'Bloco retangular',
      }[shape] ?? shape
    );
  }
}
