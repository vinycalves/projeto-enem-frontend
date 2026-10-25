import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';

export interface BioChartPoint {
  x: number;
  y: number;
}

@Component({
  selector: 'app-bio-chart',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <figure class="bio-chart" [attr.aria-label]="ariaLabel()">
      <svg viewBox="0 0 620 300" role="img">
        <title>{{ ariaLabel() }}</title>
        @for (tick of yTicks(); track tick) {
          <line class="bio-grid" x1="54" x2="596" [attr.y1]="y(tick)" [attr.y2]="y(tick)" />
          <text class="bio-tick" x="46" [attr.y]="y(tick) + 4" text-anchor="end">{{ format(tick) }}</text>
        }
        <line class="bio-axis" x1="54" y1="260" x2="596" y2="260" />
        <line class="bio-axis" x1="54" y1="18" x2="54" y2="260" />
        <path class="bio-line" [attr.stroke]="color()" [attr.d]="path()" />
        <text class="bio-label" x="325" y="292" text-anchor="middle">{{ xLabel() }}</text>
        <text class="bio-label" x="16" y="140" text-anchor="middle" transform="rotate(-90 16 140)">
          {{ yLabel() }}
        </text>
      </svg>
    </figure>
  `,
  styles: `
    .bio-chart {
      margin: 0;
      padding: 0.35rem;
      border: 1px solid var(--line);
      background: var(--paper-deep);
    }

    svg {
      display: block;
      width: 100%;
      height: auto;
    }

    .bio-grid {
      stroke: rgba(31, 42, 36, 0.1);
      stroke-width: 1;
    }

    .bio-axis {
      stroke: rgba(31, 42, 36, 0.5);
      stroke-width: 1.2;
    }

    .bio-line {
      fill: none;
      stroke-width: 2.6;
      stroke-linecap: round;
      stroke-linejoin: round;
    }

    .bio-tick,
    .bio-label {
      fill: var(--ink-soft);
      font-size: 10px;
    }

    .bio-label {
      font-size: 11px;
      font-weight: 700;
    }
  `,
})
export class BioChart {
  readonly points = input<BioChartPoint[]>([]);
  readonly xLabel = input('tempo');
  readonly yLabel = input('população');
  readonly color = input('var(--forest)');
  readonly title = input('Gráfico');

  protected readonly xMax = computed(() =>
    Math.max(this.points().at(-1)?.x ?? 1, 1),
  );
  protected readonly yMax = computed(() =>
    Math.max(...this.points().map((point) => point.y), 1),
  );
  protected readonly yTicks = computed(() =>
    [0, 0.25, 0.5, 0.75, 1].map((ratio) => ratio * this.yMax()),
  );
  protected readonly path = computed(() =>
    this.points()
      .map((point, index) => {
        const x = 54 + (point.x / this.xMax()) * 542;
        const y = 260 - (point.y / this.yMax()) * 242;
        return `${index === 0 ? 'M' : 'L'} ${x.toFixed(2)} ${y.toFixed(2)}`;
      })
      .join(' '),
  );
  protected readonly ariaLabel = computed(
    () => `${this.title()}: gráfico de ${this.yLabel()} por ${this.xLabel()}.`,
  );

  protected y(value: number): number {
    return 260 - (value / this.yMax()) * 242;
  }

  protected format(value: number): string {
    return new Intl.NumberFormat('pt-BR', { maximumFractionDigits: 0 }).format(value);
  }
}
