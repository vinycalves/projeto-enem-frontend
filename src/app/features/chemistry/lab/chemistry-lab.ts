import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  OnInit,
  computed,
  inject,
  signal,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { Api } from '../../../core/api/api';
import { getElements } from '../../../core/api/fn/crate-chemistry/get-elements';
import { ElementSeed } from '../../../core/api/models/element-seed';
import { getApiErrorMessage } from '../../../core/api-error';
import { formatNumber, formatScientific } from '../model/format';
import { balanceReaction, BalanceError } from './balance';
import {
  ElementTable,
  FormulaParseError,
  ParsedFormula,
  formulaNotation,
  parseChemicalFormula,
} from './formula';
import { calculateCalorimetry } from './calorimetry';
import { calculateHalfLife } from './half-life';
import { calculatePh } from './ph';
import { calculateStoichiometry, StoichiometryResult } from './stoichiometry';
import { ChemEquation, EquationTerm } from '../shared/chem-equation';
import { ChemFormula } from '../shared/chem-formula';

interface SpeciesInput {
  id: string;
  formula: string;
}

interface BalanceState {
  reactants: ParsedFormula[];
  products: ParsedFormula[];
  reactantCoefficients: number[];
  productCoefficients: number[];
}

interface AtomRow {
  element: string;
  left: number;
  right: number;
  balanced: boolean;
}

interface MolarRow {
  side: 'reagente' | 'produto';
  formula: string;
  coefficient: number;
  molarMass: number;
}

type LabProcess = 'reaction' | 'solution' | 'gas' | 'ph' | 'calorimetry' | 'half-life';

@Component({
  selector: 'app-chemistry-lab',
  imports: [RouterLink, ChemEquation, ChemFormula],
  templateUrl: './chemistry-lab.html',
  styleUrl: './chemistry-lab.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ChemistryLab implements OnInit {
  private readonly api = inject(Api);
  private readonly route = inject(ActivatedRoute);
  private readonly destroyRef = inject(DestroyRef);
  private nextId = 1;

  protected readonly elements = signal<ElementSeed[]>([]);
  protected readonly elementsLoading = signal(true);
  protected readonly elementsError = signal<string | null>(null);
  protected readonly activeProcess = signal<LabProcess>('reaction');

  protected readonly reactants = signal<SpeciesInput[]>([
    { id: this.id(), formula: '' },
    { id: this.id(), formula: '' },
  ]);
  protected readonly products = signal<SpeciesInput[]>([
    { id: this.id(), formula: '' },
  ]);
  protected readonly balanceState = signal<BalanceState | null>(null);
  protected readonly balanceError = signal<string | null>(null);
  protected readonly masses = signal<Record<string, number | null>>({});
  protected readonly targetProductId = signal<string | null>(null);
  protected readonly yieldPercent = signal(100);

  protected readonly solutionFormula = signal('');
  protected readonly solutionMass = signal<number | null>(null);
  protected readonly solutionVolumeMl = signal<number | null>(null);
  protected readonly stockConcentration = signal<number | null>(null);
  protected readonly stockVolumeMl = signal<number | null>(null);
  protected readonly dilutedVolumeMl = signal<number | null>(null);

  protected readonly gasUnknown = signal<'P' | 'V' | 'n' | 'T'>('P');
  protected readonly gasPressure = signal<number | null>(1);
  protected readonly gasVolume = signal<number | null>(22.4);
  protected readonly gasMoles = signal<number | null>(1);
  protected readonly gasTemperature = signal<number | null>(273.15);

  protected readonly phConcentration = signal<number | null>(0.1);
  protected readonly phNature = signal<'acid' | 'base'>('acid');
  protected readonly phStrength = signal<'strong' | 'weak'>('strong');
  protected readonly phConstant = signal<number | null>(1.75e-5);
  protected readonly phResult = computed(() => {
    const concentration = this.phConcentration();
    const constant = this.phConstant();
    if (
      concentration === null ||
      (this.phStrength() === 'weak' && (constant === null || constant <= 0))
    ) {
      return null;
    }
    return calculatePh({
      concentration,
      nature: this.phNature(),
      strength: this.phStrength(),
      ionizationConstant: this.phStrength() === 'weak' ? constant ?? 0 : 0,
      kw: 1e-14,
    });
  });

  protected readonly calorimetryMass = signal<number | null>(100);
  protected readonly calorimetryHeat = signal<number | null>(4.18);
  protected readonly calorimetryDeltaT = signal<number | null>(10);
  protected readonly calorimetryResult = computed(() => {
    const mass = this.calorimetryMass();
    const heat = this.calorimetryHeat();
    const deltaT = this.calorimetryDeltaT();
    if (mass === null || heat === null || deltaT === null) {
      return null;
    }
    return calculateCalorimetry({
      massGrams: mass,
      specificHeatJPerGramCelsius: heat,
      temperatureChangeCelsius: deltaT,
    });
  });

  protected readonly halfLifeInitial = signal<number | null>(80);
  protected readonly halfLifeValue = signal<number | null>(5);
  protected readonly halfLifeElapsed = signal<number | null>(10);
  protected readonly halfLifeResult = computed(() => {
    const initial = this.halfLifeInitial();
    const halfLife = this.halfLifeValue();
    const elapsed = this.halfLifeElapsed();
    if (initial === null || halfLife === null || elapsed === null) {
      return null;
    }
    return calculateHalfLife(initial, halfLife, elapsed);
  });

  protected readonly elementMap = computed<ElementTable>(() => {
    return new Map(this.elements().map((element) => [element.symbol, element]));
  });
  protected readonly elementRows = computed<AtomRow[]>(() => {
    const state = this.balanceState();
    if (!state) {
      return [];
    }
    const symbols = [
      ...new Set(
        [...state.reactants, ...state.products].flatMap((item) => Object.keys(item.counts)),
      ),
    ].sort();
    return symbols.map((element) => {
      const left = state.reactants.reduce(
        (total, item, index) => total + (item.counts[element] ?? 0) * state.reactantCoefficients[index],
        0,
      );
      const right = state.products.reduce(
        (total, item, index) => total + (item.counts[element] ?? 0) * state.productCoefficients[index],
        0,
      );
      return { element, left, right, balanced: left === right };
    });
  });
  protected readonly chargeBalance = computed(() => {
    const state = this.balanceState();
    if (!state) {
      return { left: 0, right: 0, balanced: true };
    }
    const left = state.reactants.reduce(
      (total, item, index) => total + item.charge * state.reactantCoefficients[index],
      0,
    );
    const right = state.products.reduce(
      (total, item, index) => total + item.charge * state.productCoefficients[index],
      0,
    );
    return { left, right, balanced: left === right };
  });
  protected readonly molarRows = computed<MolarRow[]>(() => {
    const state = this.balanceState();
    if (!state) {
      return [];
    }
    return [
      ...state.reactants.map((item, index) => ({
        side: 'reagente' as const,
        formula: formulaNotation(item),
        coefficient: state.reactantCoefficients[index],
        molarMass: item.molarMass,
      })),
      ...state.products.map((item, index) => ({
        side: 'produto' as const,
        formula: formulaNotation(item),
        coefficient: state.productCoefficients[index],
        molarMass: item.molarMass,
      })),
    ];
  });
  protected readonly reactantTerms = computed<EquationTerm[]>(() => {
    const state = this.balanceState();
    if (!state) {
      return [];
    }
    return state.reactants.map((item, index) => ({
      formula: item.formula,
      coefficient: state.reactantCoefficients[index],
      charge: item.charge,
    }));
  });
  protected readonly productTerms = computed<EquationTerm[]>(() => {
    const state = this.balanceState();
    if (!state) {
      return [];
    }
    return state.products.map((item, index) => ({
      formula: item.formula,
      coefficient: state.productCoefficients[index],
      charge: item.charge,
    }));
  });
  protected readonly targetProducts = computed(() => {
    const state = this.balanceState();
    if (!state) {
      return [];
    }
    return this.products()
      .map((item, index) => ({
        id: item.id,
        label: `${state.productCoefficients[index]} ${formulaNotation(state.products[index])}`,
        index,
      }))
      .filter((item) => item.index >= 0);
  });
  protected readonly stoichiometry = computed<StoichiometryResult | null>(() => {
    const state = this.balanceState();
    const targetId = this.targetProductId();
    if (!state || !targetId) {
      return null;
    }
    const targetIndex = this.products().findIndex((item) => item.id === targetId);
    if (targetIndex < 0) {
      return null;
    }
    const amounts = state.reactants.map((parsed, index) => ({
      id: this.reactants()[index].id,
      parsed,
      coefficient: state.reactantCoefficients[index],
      massGrams: this.masses()[this.reactants()[index].id] ?? null,
    }));
    return calculateStoichiometry(
      amounts,
      state.products[targetIndex],
      state.productCoefficients[targetIndex],
      this.yieldPercent(),
    );
  });

  protected readonly solutionParsed = computed<ParsedFormula | null>(() => {
    const formula = this.solutionFormula().trim();
    if (!formula) {
      return null;
    }
    try {
      return parseChemicalFormula(formula, this.elementMap());
    } catch {
      return null;
    }
  });
  protected readonly solutionError = computed(() => {
    if (!this.solutionFormula().trim()) {
      return null;
    }
    try {
      parseChemicalFormula(this.solutionFormula(), this.elementMap());
      return null;
    } catch (error) {
      return error instanceof FormulaParseError ? error.message : 'Fórmula inválida.';
    }
  });
  protected readonly solutionResult = computed(() => {
    const parsed = this.solutionParsed();
    const mass = this.solutionMass();
    const volume = this.solutionVolumeMl();
    if (!parsed || mass === null || mass <= 0 || volume === null || volume <= 0) {
      return null;
    }
    const moles = mass / parsed.molarMass;
    const liters = volume / 1000;
    return {
      molarMass: parsed.molarMass,
      moles,
      molarity: moles / liters,
      gramsPerLiter: mass / liters,
    };
  });
  protected readonly dilutionResult = computed(() => {
    const c1 = this.stockConcentration();
    const v1 = this.stockVolumeMl();
    const v2 = this.dilutedVolumeMl();
    if (
      c1 === null ||
      c1 <= 0 ||
      v1 === null ||
      v1 <= 0 ||
      v2 === null ||
      v2 <= 0 ||
      v2 < v1
    ) {
      return null;
    }
    return { concentration: (c1 * v1) / v2, factor: v2 / v1 };
  });
  protected readonly gasResult = computed(() => {
    const pressure = this.gasPressure();
    const volume = this.gasVolume();
    const moles = this.gasMoles();
    const temperature = this.gasTemperature();
    const unknown = this.gasUnknown();
    const r = 0.082057366;
    const positive = (value: number | null): value is number => value !== null && value > 0;
    if (unknown === 'P') {
      if (!positive(volume) || !positive(moles) || !positive(temperature)) {
        return null;
      }
      return { label: 'Pressão', value: (moles * r * temperature) / volume, unit: 'atm' };
    }
    if (unknown === 'V') {
      if (!positive(pressure) || !positive(moles) || !positive(temperature)) {
        return null;
      }
      return { label: 'Volume', value: (moles * r * temperature) / pressure, unit: 'L' };
    }
    if (unknown === 'n') {
      if (!positive(pressure) || !positive(volume) || !positive(temperature)) {
        return null;
      }
      return {
        label: 'Quantidade de matéria',
        value: (pressure * volume) / (r * temperature),
        unit: 'mol',
      };
    }
    if (!positive(pressure) || !positive(volume) || !positive(moles)) {
      return null;
    }
    return { label: 'Temperatura', value: (pressure * volume) / (moles * r), unit: 'K' };
  });

  ngOnInit(): void {
    this.route.queryParamMap.pipe(takeUntilDestroyed(this.destroyRef)).subscribe((params) => {
      const process = params.get('process');
      if (
        process === 'reaction' ||
        process === 'solution' ||
        process === 'gas' ||
        process === 'ph' ||
        process === 'calorimetry' ||
        process === 'half-life'
      ) {
        this.activeProcess.set(process);
      }
    });
    void this.loadElements();
  }

  protected setProcess(process: LabProcess): void {
    this.activeProcess.set(process);
  }

  protected updateFormula(group: 'reactants' | 'products', id: string, value: string): void {
    const signal = group === 'reactants' ? this.reactants : this.products;
    signal.update((items) => items.map((item) => (item.id === id ? { ...item, formula: value } : item)));
    this.balanceState.set(null);
    this.balanceError.set(null);
  }

  protected addSpecies(group: 'reactants' | 'products'): void {
    const signal = group === 'reactants' ? this.reactants : this.products;
    signal.update((items) => [...items, { id: this.id(), formula: '' }]);
    this.balanceState.set(null);
  }

  protected removeSpecies(group: 'reactants' | 'products', id: string): void {
    const signal = group === 'reactants' ? this.reactants : this.products;
    if (signal().length <= 1) {
      return;
    }
    signal.update((items) => items.filter((item) => item.id !== id));
    this.balanceState.set(null);
  }

  protected balance(): void {
    this.balanceError.set(null);
    try {
      const reactants = this.parseGroup(this.reactants(), 'reagente');
      const products = this.parseGroup(this.products(), 'produto');
      const result = balanceReaction(reactants, products);
      this.balanceState.set({
        reactants,
        products,
        reactantCoefficients: result.reactants,
        productCoefficients: result.products,
      });
      if (!this.targetProductId() || !this.products().some((item) => item.id === this.targetProductId())) {
        this.targetProductId.set(this.products()[0]?.id ?? null);
      }
    } catch (error) {
      if (error instanceof FormulaParseError || error instanceof BalanceError) {
        this.balanceError.set(error.message);
      } else {
        this.balanceError.set('Não foi possível balancear a reação.');
      }
    }
  }

  protected loadExample(): void {
    this.reactants.set([
      { id: this.id(), formula: 'CH4' },
      { id: this.id(), formula: 'O2' },
    ]);
    this.products.set([{ id: this.id(), formula: 'CO2' }, { id: this.id(), formula: 'H2O' }]);
    this.masses.set({});
    this.targetProductId.set(null);
    this.balance();
  }

  protected clearReaction(): void {
    this.reactants.set([{ id: this.id(), formula: '' }, { id: this.id(), formula: '' }]);
    this.products.set([{ id: this.id(), formula: '' }]);
    this.balanceState.set(null);
    this.balanceError.set(null);
    this.masses.set({});
    this.targetProductId.set(null);
  }

  protected updateMass(id: string, event: Event): void {
    const raw = (event.target as HTMLInputElement).value;
    const value = raw.trim() === '' ? null : Number(raw);
    this.masses.update((current) => ({
      ...current,
      [id]: value !== null && Number.isFinite(value) ? value : null,
    }));
  }

  protected setTarget(id: string): void {
    this.targetProductId.set(id);
  }

  protected setYield(event: Event): void {
    const value = Number((event.target as HTMLInputElement).value);
    this.yieldPercent.set(Number.isFinite(value) ? Math.min(Math.max(value, 0), 100) : 100);
  }

  protected setSolutionFormula(value: string): void {
    this.solutionFormula.set(value);
  }

  protected setNumber(signalName: string, event: Event): void {
    const raw = (event.target as HTMLInputElement).value;
    const value = raw.trim() === '' ? null : Number(raw);
    const safe = value !== null && Number.isFinite(value) ? value : null;
    switch (signalName) {
      case 'solutionMass':
        this.solutionMass.set(safe);
        break;
      case 'solutionVolumeMl':
        this.solutionVolumeMl.set(safe);
        break;
      case 'stockConcentration':
        this.stockConcentration.set(safe);
        break;
      case 'stockVolumeMl':
        this.stockVolumeMl.set(safe);
        break;
      case 'dilutedVolumeMl':
        this.dilutedVolumeMl.set(safe);
        break;
      case 'gasPressure':
        this.gasPressure.set(safe);
        break;
      case 'gasVolume':
        this.gasVolume.set(safe);
        break;
      case 'gasMoles':
        this.gasMoles.set(safe);
        break;
      case 'gasTemperature':
        this.gasTemperature.set(safe);
        break;
      case 'phConcentration':
        this.phConcentration.set(safe);
        break;
      case 'phConstant':
        this.phConstant.set(safe);
        break;
      case 'calorimetryMass':
        this.calorimetryMass.set(safe);
        break;
      case 'calorimetryHeat':
        this.calorimetryHeat.set(safe);
        break;
      case 'calorimetryDeltaT':
        this.calorimetryDeltaT.set(safe);
        break;
      case 'halfLifeInitial':
        this.halfLifeInitial.set(safe);
        break;
      case 'halfLifeValue':
        this.halfLifeValue.set(safe);
        break;
      case 'halfLifeElapsed':
        this.halfLifeElapsed.set(safe);
        break;
      default:
        break;
    }
  }

  protected setPhNature(value: string): void {
    this.phNature.set(value === 'base' ? 'base' : 'acid');
  }

  protected setPhStrength(value: string): void {
    this.phStrength.set(value === 'weak' ? 'weak' : 'strong');
  }

  protected setGasUnknown(value: string): void {
    this.gasUnknown.set(value === 'V' || value === 'n' || value === 'T' ? value : 'P');
  }

  protected format(value: number | null | undefined, digits = 2): string {
    return formatNumber(value ?? 0, digits);
  }

  protected formatSmall(value: number | null | undefined): string {
    if (value === null || value === undefined) {
      return '—';
    }
    return Math.abs(value) < 1e-4 ? formatScientific(value, 2) : formatNumber(value, 6);
  }

  protected atomSymbol(row: AtomRow): string {
    return row.element;
  }

  protected elementName(symbol: string): string {
    return this.elements().find((item) => item.symbol === symbol)?.namePt ?? symbol;
  }

  protected limitingFormula(result: StoichiometryResult): string {
    return result.rows.find((row) => row.id === result.limitingId)?.formula ?? '';
  }

  protected chargeLabel(value: number): string {
    if (value === 0) {
      return '0';
    }
    return `${value > 0 ? '+' : '−'}${Math.abs(value)}`;
  }

  private parseGroup(group: SpeciesInput[], label: string): ParsedFormula[] {
    const parsed: ParsedFormula[] = [];
    for (const item of group) {
      if (!item.formula.trim()) {
        throw new FormulaParseError(`Preencha todos os ${label}s ou remova os campos vazios.`);
      }
      try {
        parsed.push(parseChemicalFormula(item.formula, this.elementMap()));
      } catch (error) {
        const message = error instanceof FormulaParseError ? error.message : 'Fórmula inválida.';
        throw new FormulaParseError(`${label[0].toUpperCase() + label.slice(1)} “${item.formula}”: ${message}`);
      }
    }
    return parsed;
  }

  private async loadElements(): Promise<void> {
    this.elementsLoading.set(true);
    this.elementsError.set(null);
    try {
      const response = await this.api.invoke(getElements);
      this.elements.set(response.elements);
    } catch (error) {
      this.elementsError.set(
        getApiErrorMessage(error, 'Não foi possível carregar a base de elementos.'),
      );
    } finally {
      this.elementsLoading.set(false);
    }
  }

  private id(): string {
    const value = `species-${this.nextId}`;
    this.nextId += 1;
    return value;
  }
}
