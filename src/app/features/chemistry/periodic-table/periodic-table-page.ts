import { ChangeDetectionStrategy, Component, OnInit, computed, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { Api } from '../../../core/api/api';
import { getElements } from '../../../core/api/fn/crate-chemistry/get-elements';
import { ElementSeed } from '../../../core/api/models/element-seed';
import { getApiErrorMessage } from '../../../core/api-error';
import { formatNumber } from '../model/format';

interface PeriodicCell {
  element: ElementSeed;
  row: number;
  column: number;
  block: 'main' | 'lanthanide' | 'actinide';
}

@Component({
  selector: 'app-periodic-table-page',
  imports: [RouterLink],
  templateUrl: './periodic-table-page.html',
  styleUrl: './periodic-table-page.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PeriodicTablePage implements OnInit {
  private readonly api = inject(Api);

  protected readonly elements = signal<ElementSeed[]>([]);
  protected readonly loading = signal(true);
  protected readonly error = signal<string | null>(null);
  protected readonly selected = signal<ElementSeed | null>(null);
  protected readonly search = signal('');
  protected readonly category = signal('');

  protected readonly categories = computed(() =>
    [...new Set(this.elements().map((element) => element.category))].sort((a, b) =>
      a.localeCompare(b, 'pt-BR'),
    ),
  );
  protected readonly cells = computed<PeriodicCell[]>(() =>
    this.elements().map((element) => this.cellFor(element)),
  );
  protected readonly visibleCells = computed(() => {
    const query = this.search().trim().toLocaleLowerCase('pt-BR');
    const category = this.category();
    return this.cells().filter((cell) => {
      const categoryMatches = !category || cell.element.category === category;
      if (!categoryMatches) {
        return false;
      }
      if (!query) {
        return true;
      }
      return (
        cell.element.symbol.toLocaleLowerCase('pt-BR').includes(query) ||
        cell.element.namePt.toLocaleLowerCase('pt-BR').includes(query) ||
        String(cell.element.atomicNumber) === query
      );
    });
  });
  protected readonly resultCount = computed(() => this.visibleCells().length);

  ngOnInit(): void {
    void this.load();
  }

  protected select(element: ElementSeed): void {
    this.selected.set(element);
  }

  protected setSearch(value: string): void {
    this.search.set(value);
  }

  protected setCategory(value: string): void {
    this.category.set(value);
  }

  protected clearFilters(): void {
    this.search.set('');
    this.category.set('');
  }

  protected categoryColor(category: string): string {
    const value = category.toLocaleLowerCase('pt-BR');
    if (value.includes('nobre')) {
      return '#d8e8f7';
    }
    if (value.includes('alcalino-terroso')) {
      return '#f5dfbd';
    }
    if (value.includes('alcalino')) {
      return '#f6d4c7';
    }
    if (value.includes('pós-transição')) {
      return '#d6e4ed';
    }
    if (value.includes('transição')) {
      return '#e6d9f2';
    }
    if (value.includes('lantan')) {
      return '#f3d9e9';
    }
    if (value.includes('actin')) {
      return '#f0dec8';
    }
    if (value.includes('semimetal')) {
      return '#f5ebbf';
    }
    if (value.includes('não metal')) {
      return '#d9eddf';
    }
    if (value.includes('prevista')) {
      return '#e8eaed';
    }
    return '#e9ecef';
  }

  protected mass(element: ElementSeed): string {
    return formatNumber(element.atomicMass, 3);
  }

  protected electronegativity(element: ElementSeed): string {
    return element.electronegativity === null || element.electronegativity === undefined
      ? '—'
      : formatNumber(element.electronegativity, 2);
  }

  protected radius(element: ElementSeed): string {
    return element.atomicRadiusPm === null || element.atomicRadiusPm === undefined
      ? '—'
      : `${formatNumber(element.atomicRadiusPm, 0)} pm`;
  }

  protected fBlockLabel(row: number): string {
    return row === 8 ? 'Lantanídeos' : 'Actinídeos';
  }

  private cellFor(element: ElementSeed): PeriodicCell {
    if (element.atomicNumber >= 58 && element.atomicNumber <= 71) {
      return { element, row: 8, column: element.atomicNumber - 54, block: 'lanthanide' };
    }
    if (element.atomicNumber >= 90 && element.atomicNumber <= 103) {
      return { element, row: 9, column: element.atomicNumber - 86, block: 'actinide' };
    }
    if (element.atomicNumber === 57 || element.atomicNumber === 89) {
      return { element, row: element.period, column: 3, block: 'main' };
    }
    return {
      element,
      row: element.period,
      column: element.groupNumber ?? 3,
      block: 'main',
    };
  }

  private async load(): Promise<void> {
    this.loading.set(true);
    this.error.set(null);
    try {
      const response = await this.api.invoke(getElements);
      this.elements.set(response.elements);
      this.selected.set(response.elements[0] ?? null);
    } catch (error) {
      this.error.set(getApiErrorMessage(error, 'Não foi possível carregar a tabela periódica.'));
    } finally {
      this.loading.set(false);
    }
  }
}
