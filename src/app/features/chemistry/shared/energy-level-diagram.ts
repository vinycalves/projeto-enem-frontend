import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { formatNumber } from '../model/format';

@Component({
  selector: 'app-energy-level-diagram',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <figure class="energy" [attr.aria-label]="ariaLabel()">
      <svg viewBox="0 0 620 270" role="img">
        <title>{{ ariaLabel() }}</title>
        <line class="level" x1="70" [attr.y1]="reactantY()" x2="400" [attr.y2]="reactantY()" />
        <line class="level" x1="220" [attr.y1]="productY()" x2="550" [attr.y2]="productY()" />
        <line
          class="energy-arrow"
          [attr.x1]="470"
          [attr.y1]="reactantY()"
          [attr.x2]="470"
          [attr.y2]="productY()"
          marker-end="url(#arrowhead)"
        />
        <defs>
          <marker id="arrowhead" markerWidth="8" markerHeight="8" refX="4" refY="4" orient="auto">
            <path d="M0,0 L8,4 L0,8 z" fill="#f4b183" />
          </marker>
        </defs>
        <text class="level-label" x="70" [attr.y]="reactantY() - 12">{{ reactantsLabel() }}</text>
        <text class="level-label" x="550" [attr.y]="productY() - 12" text-anchor="end">
          {{ productsLabel() }}
        </text>
        <text class="delta" x="482" [attr.y]="(reactantY() + productY()) / 2">
          ΔH = {{ formattedDeltaH() }}
        </text>
        <text class="hint" x="70" y="245">
          Ea não representada: este recorte usa apenas dados de entalpia.
        </text>
      </svg>
    </figure>
  `,
  styles: `
    .energy {
      margin: 0;
      padding: 0.4rem;
      border: 1px solid rgba(159, 227, 194, 0.16);
      background: #0b211d;
      color: #dceee4;
    }

    svg {
      display: block;
      width: 100%;
      height: auto;
    }

    .level {
      stroke: #9fe3c2;
      stroke-width: 3;
      stroke-linecap: round;
    }

    .level-label {
      fill: #dceee4;
      font-size: 12px;
      font-weight: 700;
    }

    .energy-arrow {
      stroke: #f4b183;
      stroke-width: 2;
    }

    .delta {
      fill: #f4b183;
      font-size: 12px;
      font-weight: 700;
    }

    .hint {
      fill: #8fb7a4;
      font-size: 10px;
    }
  `,
})
export class EnergyLevelDiagram {
  readonly reactantsLabel = input('Reagentes');
  readonly productsLabel = input('Produtos');
  readonly deltaHKjMol = input(0);

  protected readonly reactantY = computed(() => (this.deltaHKjMol() < 0 ? 90 : 210));
  protected readonly productY = computed(() => (this.deltaHKjMol() < 0 ? 210 : 90));
  protected readonly formattedDeltaH = computed(
    () => `${formatNumber(this.deltaHKjMol(), 1)} kJ/mol`,
  );
  protected readonly ariaLabel = computed(
    () =>
      `Diagrama de entalpia: ${this.reactantsLabel()} em nível mais ${
        this.deltaHKjMol() < 0 ? 'alto' : 'baixo'
      } que ${this.productsLabel()}; variação de entalpia ${formatNumber(
        this.deltaHKjMol(),
        1,
      )} quilojoules por mol.`,
  );
}
