import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';

export type GlasswareVariant = 'burette' | 'flask' | 'beaker';

@Component({
  selector: 'app-lab-glassware',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <figure class="glassware" [attr.aria-label]="ariaLabel()">
      <svg viewBox="0 0 160 270" role="img">
        <title>{{ ariaLabel() }}</title>
        @switch (variant()) {
          @case ('burette') {
            <rect class="glass" x="66" y="12" width="28" height="196" rx="5" />
            <rect
              class="liquid"
              x="70"
              [attr.y]="buretteLiquidY()"
              width="20"
              [attr.height]="196 - (buretteLiquidY() - 12)"
              rx="2"
              [attr.fill]="liquidColor()"
            />
            <line class="glass" x1="80" y1="208" x2="80" y2="226" />
            <path class="glass" d="M72 226 L88 226 L84 240 L76 240 Z" />
            <text class="caption" x="80" y="258" text-anchor="middle">Bureta</text>
          }
          @case ('flask') {
            <path class="glass" d="M56 22 L104 22 L104 92 L132 222 Q134 240 116 240 L44 240 Q26 240 28 222 L56 92 Z" />
            <path
              class="liquid"
              [attr.d]="flaskLiquidPath()"
              [attr.fill]="liquidColor()"
            />
            <line class="glass" x1="49" y1="30" x2="111" y2="30" />
            <text class="caption" x="80" y="262" text-anchor="middle">Erlenmeyer</text>
          }
          @case ('beaker') {
            <path class="glass" d="M30 44 L130 44 L126 226 Q125 240 112 240 L48 240 Q35 240 34 226 Z" />
            <rect
              class="liquid"
              x="36"
              [attr.y]="beakerLiquidY()"
              width="88"
              [attr.height]="236 - beakerLiquidY()"
              [attr.fill]="liquidColor()"
            />
            <line class="glass" x1="30" y1="44" x2="130" y2="44" />
            <text class="caption" x="80" y="262" text-anchor="middle">Béquer</text>
          }
        }
      </svg>
    </figure>
  `,
  styles: `
    .glassware {
      margin: 0;
    }

    svg {
      display: block;
      width: 100%;
      max-height: 280px;
    }

    .glass {
      fill: rgba(210, 245, 235, 0.08);
      stroke: #c7efe0;
      stroke-width: 2.5;
      stroke-linejoin: round;
    }

    .liquid {
      opacity: 0.7;
    }

    .caption {
      fill: #a7c5b5;
      font-size: 12px;
      font-weight: 700;
    }
  `,
})
export class LabGlassware {
  readonly variant = input<GlasswareVariant>('flask');
  readonly liquidColor = input('#7dd3fc');
  readonly fillPercent = input(35);
  readonly label = input('');

  protected readonly ariaLabel = computed(
    () =>
      `${this.label() || this.variant()} de laboratório com ${this.fillPercent().toFixed(
        0,
      )}% de líquido.`,
  );

  protected buretteLiquidY(): number {
    const fraction = Math.min(Math.max(this.fillPercent(), 0), 100) / 100;
    return 208 - fraction * 196;
  }

  protected beakerLiquidY(): number {
    const fraction = Math.min(Math.max(this.fillPercent(), 0), 100) / 100;
    return 236 - fraction * 192;
  }

  protected flaskLiquidPath(): string {
    const fraction = Math.min(Math.max(this.fillPercent(), 0), 100) / 100;
    const top = 240 - fraction * 148;
    const width = 20 + (240 - top) * 0.35;
    return `M ${80 - width / 2} ${top} L ${80 + width / 2} ${top} L 116 240 L 44 240 Z`;
  }
}
