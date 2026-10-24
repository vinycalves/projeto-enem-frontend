import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { ChemFormula } from './chem-formula';

export interface EquationTerm {
  formula: string;
  coefficient?: number;
  state?: string;
  charge?: number;
}

@Component({
  selector: 'app-chem-equation',
  imports: [ChemFormula],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <span class="chem-equation" [attr.aria-label]="ariaLabel()">
      @for (term of reactants(); track $index; let index = $index) {
        @if (index > 0) {
          <span class="operator">+</span>
        }
        @if (coefficient(term) > 1) {
          <span class="coefficient">{{ coefficient(term) }}</span>
        }
        <app-chem-formula [formula]="termFormula(term)" />
        @if (term.state) {
          <span class="state">({{ term.state }})</span>
        }
      }
      <span class="arrow" aria-hidden="true">{{ arrow() }}</span>
      @for (term of products(); track $index; let index = $index) {
        @if (index > 0) {
          <span class="operator">+</span>
        }
        @if (coefficient(term) > 1) {
          <span class="coefficient">{{ coefficient(term) }}</span>
        }
        <app-chem-formula [formula]="termFormula(term)" />
        @if (term.state) {
          <span class="state">({{ term.state }})</span>
        }
      }
    </span>
  `,
  styles: `
    .chem-equation {
      display: inline-flex;
      flex-wrap: wrap;
      align-items: baseline;
      gap: 0.22rem;
      font-size: 1.02rem;
      line-height: 1.8;
    }

    .coefficient {
      color: inherit;
      font-variant-numeric: tabular-nums;
      font-weight: 800;
    }

    .operator,
    .arrow {
      color: currentColor;
      font-weight: 500;
    }

    .arrow {
      margin: 0 0.28rem;
      font-size: 1.2em;
    }

    .state {
      color: inherit;
      font-size: 0.72em;
      opacity: 0.78;
    }
  `,
})
export class ChemEquation {
  readonly reactants = input<EquationTerm[]>([]);
  readonly products = input<EquationTerm[]>([]);
  readonly arrow = input<'→' | '⇌'>('→');

  protected readonly ariaLabel = computed(() => {
    const format = (terms: EquationTerm[]): string =>
      terms
        .map((term) => {
          const coefficient = this.coefficient(term) > 1 ? `${this.coefficient(term)} ` : '';
          const charge =
            term.charge && term.charge !== 0
              ? ` ${term.charge > 0 ? '+' : '−'}${Math.abs(term.charge)}`
              : '';
          return `${coefficient}${term.formula}${charge}${term.state ? ` (${term.state})` : ''}`;
        })
        .join(' + ');
    return `${format(this.reactants())} ${this.arrow()} ${format(this.products())}`;
  });

  protected coefficient(term: EquationTerm): number {
    return term.coefficient ?? 1;
  }

  protected termFormula(term: EquationTerm): string {
    if (!term.charge) {
      return term.formula;
    }
    const magnitude = Math.abs(term.charge) === 1 ? '' : String(Math.abs(term.charge));
    return `${term.formula}^${magnitude}${term.charge > 0 ? '+' : '−'}`;
  }
}
