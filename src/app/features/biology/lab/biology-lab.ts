import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  signal,
} from '@angular/core';
import { RouterLink } from '@angular/router';
import { NgIcon, provideIcons } from '@ng-icons/core';
import {
  lucideChartLine,
  lucideDna,
  lucideGitBranch,
  lucideHeartPulse,
  lucideInfo,
  lucideMicroscope,
  lucideTrees,
} from '@ng-icons/lucide';
import { BioChart, BioChartPoint } from './bio-chart';
import { michaelisMenten, enzymeCurve } from './enzyme';
import { hardyWeinberg, hardyWeinbergCounts } from './hardy-weinberg';
import { simulateLogistic } from './population';
import { cross, Genotype } from './punnett';
import { trophicPyramid } from './trophic';

type BiologyTab = 'genetics' | 'evolution' | 'ecology' | 'physiology';

@Component({
  selector: 'app-biology-lab',
  imports: [RouterLink, NgIcon, BioChart],
  providers: [
    provideIcons({
      lucideChartLine,
      lucideDna,
      lucideGitBranch,
      lucideHeartPulse,
      lucideInfo,
      lucideMicroscope,
      lucideTrees,
    }),
  ],
  templateUrl: './biology-lab.html',
  styleUrl: './biology-lab.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class BiologyLab {
  protected readonly activeTab = signal<BiologyTab>('genetics');

  protected readonly parentA = signal<Genotype>('Aa');
  protected readonly parentB = signal<Genotype>('Aa');
  protected readonly punnett = computed(() => cross(this.parentA(), this.parentB()));
  protected readonly punnettRows = computed(() => {
    const result = this.punnett();
    return result.gametesA.map((gameteA, row) => ({
      gameteA,
      cells: result.gametesB.map((_, column) => result.cells[row * 2 + column]),
    }));
  });
  protected readonly genotypeRows = computed(() => {
    const result = this.punnett();
    return (['AA', 'Aa', 'aa'] as Genotype[]).map((genotype) => ({
      genotype,
      count: result.genotypes[genotype],
      percent: result.genotypePercent[genotype],
    }));
  });

  protected readonly alleleP = signal(0.6);
  protected readonly populationSize = signal(1000);
  protected readonly hwe = computed(() => hardyWeinberg(this.alleleP(), this.populationSize()));
  protected readonly hweCounts = computed(() => {
    const result = this.hwe();
    return result ? hardyWeinbergCounts(result) : null;
  });

  protected readonly initialPopulation = signal(10);
  protected readonly growthRate = signal(0.5);
  protected readonly capacity = signal(500);
  protected readonly simulationTime = signal(40);
  protected readonly logistic = computed(() =>
    simulateLogistic({
      initialPopulation: this.initialPopulation(),
      growthRate: this.growthRate(),
      carryingCapacity: this.capacity(),
      time: this.simulationTime(),
      step: 0.05,
    }),
  );
  protected readonly populationPoints = computed<BioChartPoint[]>(
    () => this.logistic()?.points.map((point) => ({ x: point.t, y: point.n })) ?? [],
  );
  protected readonly finalPopulation = computed(
    () => this.logistic()?.points.at(-1)?.n ?? null,
  );

  protected readonly initialEnergy = signal(1000);
  protected readonly transferEfficiency = signal(10);
  protected readonly trophicLevels = signal(4);
  protected readonly trophic = computed(() =>
    trophicPyramid(this.initialEnergy(), this.transferEfficiency(), this.trophicLevels()),
  );

  protected readonly vmax = signal(100);
  protected readonly km = signal(2);
  protected readonly substrate = signal(2);
  protected readonly enzymeRate = computed(() =>
    michaelisMenten({ vmax: this.vmax(), km: this.km(), substrate: this.substrate() }),
  );
  protected readonly enzymePoints = computed<BioChartPoint[]>(() =>
    enzymeCurve({ vmax: this.vmax(), km: this.km(), substrate: 0 }, 10, 120).map((point) => ({
      x: point.s,
      y: point.v,
    })),
  );

  protected readonly tabs: Array<{ id: BiologyTab; label: string; icon: string }> = [
    { id: 'genetics', label: 'Genética', icon: 'lucideDna' },
    { id: 'evolution', label: 'Evolução', icon: 'lucideGitBranch' },
    { id: 'ecology', label: 'Ecologia', icon: 'lucideTrees' },
    { id: 'physiology', label: 'Fisiologia', icon: 'lucideHeartPulse' },
  ];

  protected setTab(tab: BiologyTab): void {
    this.activeTab.set(tab);
  }

  protected setParent(which: 'a' | 'b', value: string): void {
    const genotype: Genotype = value === 'AA' || value === 'aa' ? value : 'Aa';
    if (which === 'a') {
      this.parentA.set(genotype);
    } else {
      this.parentB.set(genotype);
    }
  }

  protected setAlleleP(event: Event): void {
    const value = Number((event.target as HTMLInputElement).value);
    if (Number.isFinite(value)) {
      this.alleleP.set(Math.min(Math.max(value, 0), 1));
    }
  }

  protected setPopulation(event: Event): void {
    const value = Number((event.target as HTMLInputElement).value);
    if (Number.isFinite(value)) {
      this.populationSize.set(Math.max(1, value));
    }
  }

  protected setNumber(name: string, event: Event): void {
    const value = Number((event.target as HTMLInputElement).value);
    if (!Number.isFinite(value)) {
      return;
    }
    switch (name) {
      case 'initialPopulation':
        this.initialPopulation.set(Math.max(0, value));
        break;
      case 'growthRate':
        this.growthRate.set(value);
        break;
      case 'capacity':
        this.capacity.set(Math.max(1, value));
        break;
      case 'simulationTime':
        this.simulationTime.set(Math.max(0, value));
        break;
      case 'initialEnergy':
        this.initialEnergy.set(Math.max(1, value));
        break;
      case 'transferEfficiency':
        this.transferEfficiency.set(Math.min(Math.max(value, 1), 100));
        break;
      case 'trophicLevels':
        this.trophicLevels.set(Math.min(Math.max(Math.round(value), 2), 5));
        break;
      case 'vmax':
        this.vmax.set(Math.max(0.01, value));
        break;
      case 'km':
        this.km.set(Math.max(0.01, value));
        break;
      case 'substrate':
        this.substrate.set(Math.max(0, value));
        break;
      default:
        break;
    }
  }

  protected format(value: number | null | undefined, digits = 2): string {
    return new Intl.NumberFormat('pt-BR', {
      minimumFractionDigits: digits,
      maximumFractionDigits: digits,
    }).format(value ?? 0);
  }

  protected formatInt(value: number | null | undefined): string {
    return new Intl.NumberFormat('pt-BR', { maximumFractionDigits: 0 }).format(value ?? 0);
  }

  protected barWidth(value: number, max: number): number {
    return max <= 0 ? 0 : Math.min(100, Math.max(0, (value / max) * 100));
  }
}
