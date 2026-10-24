import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';

interface FormulaPart {
  text: string;
  script?: 'sub' | 'sup';
}

export function parseFormulaParts(formula: string): FormulaPart[] {
  const parts: FormulaPart[] = [];
  let index = 0;

  while (index < formula.length) {
    const character = formula[index];

    if (character === '·' || character === '*') {
      parts.push({ text: character === '*' ? '·' : character });
      index += 1;
      let coefficient = '';
      while (index < formula.length && /\d/.test(formula[index])) {
        coefficient += formula[index];
        index += 1;
      }
      if (coefficient) {
        parts.push({ text: coefficient });
      }
      continue;
    }

    if (character === '^') {
      index += 1;
      let charge = '';
      if (formula[index] === '{') {
        index += 1;
        while (index < formula.length && formula[index] !== '}') {
          charge += formula[index];
          index += 1;
        }
        index += 1;
      } else {
        while (index < formula.length && /[0-9+\-−]/.test(formula[index])) {
          charge += formula[index];
          index += 1;
        }
      }
      if (charge) {
        parts.push({ text: charge.replace(/-/g, '−'), script: 'sup' });
      }
      continue;
    }

    if (/\d/.test(character)) {
      let digits = '';
      while (index < formula.length && /\d/.test(formula[index])) {
        digits += formula[index];
        index += 1;
      }
      parts.push({ text: digits, script: 'sub' });
      continue;
    }

    if (/[A-Z]/.test(character)) {
      let symbol = character;
      index += 1;
      while (index < formula.length && /[a-z]/.test(formula[index])) {
        symbol += formula[index];
        index += 1;
      }
      parts.push({ text: symbol });
      continue;
    }

    parts.push({ text: character });
    index += 1;
  }

  return parts;
}

@Component({
  selector: 'app-chem-formula',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `<span class="chem-formula" [attr.aria-label]="formula()">@for (part of parts(); track $index) {@if (part.script === 'sub') {<sub>{{ part.text }}</sub>} @else if (part.script === 'sup') {<sup>{{ part.text }}</sup>} @else {<span>{{ part.text }}</span>}}</span>`,
  styles: `
    .chem-formula {
      white-space: nowrap;
      font-variant-numeric: tabular-nums;
    }

    sub,
    sup {
      font-size: 0.7em;
      line-height: 0;
    }
  `,
})
export class ChemFormula {
  readonly formula = input.required<string>();
  protected readonly parts = computed(() => parseFormulaParts(this.formula()));
}
