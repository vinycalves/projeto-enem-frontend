import { ChangeDetectionStrategy, Component, computed, input, output } from '@angular/core';
import { formatNumber } from '../model/format';

export interface ChartPoint {
  x: number;
  y: number;
}

export interface ChartSeries {
  id: string;
  label: string;
  color: string;
  points: ChartPoint[];
}

export interface ChartAnnotation {
  x: number;
  y: number;
  label: string;
  color?: string;
}

const VIEW_WIDTH = 680;
const VIEW_HEIGHT = 380;
const MARGIN = { top: 18, right: 18, bottom: 46, left: 64 };

@Component({
  selector: 'app-chart-panel',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <figure class="chart" [attr.aria-label]="ariaLabel()">
      <svg
        viewBox="0 0 680 380"
        role="img"
        (pointermove)="onPointerMove($event)"
        (pointerleave)="onPointerLeave()"
      >
        <title>{{ ariaLabel() }}</title>
        <desc>{{ description() }}</desc>

        @for (tick of yTicks(); track tick) {
          <line
            class="grid"
            [attr.x1]="left"
            [attr.x2]="right"
            [attr.y1]="yScale(tick)"
            [attr.y2]="yScale(tick)"
          />
          <text class="axis-label" [attr.x]="left - 8" [attr.y]="yScale(tick) + 4" text-anchor="end">
            {{ formatTick(tick, yDomain()) }}
          </text>
        }
        @for (tick of xTicks(); track tick) {
          <line
            class="grid"
            [attr.x1]="xScale(tick)"
            [attr.x2]="xScale(tick)"
            [attr.y1]="top"
            [attr.y2]="bottom"
          />
          <text class="axis-label" [attr.x]="xScale(tick)" [attr.y]="bottom + 19" text-anchor="middle">
            {{ formatTick(tick, xDomain()) }}
          </text>
        }

        <line class="axis" [attr.x1]="left" [attr.x2]="right" [attr.y1]="bottom" [attr.y2]="bottom" />
        <line class="axis" [attr.x1]="left" [attr.x2]="left" [attr.y1]="top" [attr.y2]="bottom" />
        <text class="axis-title" [attr.x]="(left + right) / 2" [attr.y]="VIEW_HEIGHT - 6" text-anchor="middle">
          {{ xLabel() }}
        </text>
        <text
          class="axis-title"
          [attr.x]="18"
          [attr.y]="(top + bottom) / 2"
          text-anchor="middle"
          [attr.transform]="'rotate(-90 18 ' + (top + bottom) / 2 + ')'"
        >
          {{ yLabel() }}
        </text>

        @for (series of series(); track series.id) {
          <path
            class="series"
            [attr.d]="pathFor(series)"
            [attr.stroke]="series.color"
            fill="none"
          />
        }

        @for (annotation of annotations(); track $index) {
          <circle
            [attr.cx]="xScale(annotation.x)"
            [attr.cy]="yScale(annotation.y)"
            r="5"
            [attr.fill]="annotation.color ?? '#9fe3c2'"
            stroke="#071b18"
            stroke-width="2"
          />
          <text
            class="annotation"
            [attr.x]="xScale(annotation.x) + 9"
            [attr.y]="yScale(annotation.y) - 9"
            [attr.fill]="annotation.color ?? '#9fe3c2'"
          >
            {{ annotation.label }}
          </text>
        }

        @if (cursorX() !== null) {
          <line
            class="cursor"
            [attr.x1]="xScale(cursorX() ?? 0)"
            [attr.x2]="xScale(cursorX() ?? 0)"
            [attr.y1]="top"
            [attr.y2]="bottom"
          />
        }
      </svg>

      <figcaption class="legend">
        @for (series of series(); track series.id) {
          <span class="legend-item">
            <span class="swatch" [style.background]="series.color"></span>
            {{ series.label }}
          </span>
        }
      </figcaption>
    </figure>
  `,
  styles: `
    .chart {
      margin: 0;
      color: #dceee4;
      background: #0b211d;
      border: 1px solid rgba(159, 227, 194, 0.16);
    }

    svg {
      display: block;
      width: 100%;
      height: auto;
      touch-action: none;
    }

    .grid {
      stroke: rgba(220, 238, 228, 0.11);
      stroke-width: 1;
    }

    .axis {
      stroke: rgba(220, 238, 228, 0.45);
      stroke-width: 1.2;
    }

    .axis-label {
      fill: #a7c5b5;
      font-size: 11px;
      font-variant-numeric: tabular-nums;
    }

    .axis-title {
      fill: #dceee4;
      font-size: 12px;
      font-weight: 700;
    }

    .series {
      stroke-width: 2.6;
      stroke-linecap: round;
      stroke-linejoin: round;
    }

    .annotation {
      font-size: 11px;
      font-weight: 700;
    }

    .cursor {
      stroke: rgba(255, 255, 255, 0.5);
      stroke-width: 1;
      stroke-dasharray: 4 4;
      pointer-events: none;
    }

    .legend {
      display: flex;
      flex-wrap: wrap;
      gap: 0.7rem;
      padding: 0.55rem 0.8rem 0.65rem;
      border-top: 1px solid rgba(159, 227, 194, 0.12);
      font-size: 0.68rem;
    }

    .legend-item {
      display: inline-flex;
      gap: 0.35rem;
      align-items: center;
    }

    .swatch {
      width: 0.55rem;
      height: 0.55rem;
      border-radius: 50%;
    }
  `,
})
export class ChartPanel {
  readonly series = input<ChartSeries[]>([]);
  readonly xDomain = input<[number, number]>([0, 1]);
  readonly yDomain = input<[number, number]>([0, 1]);
  readonly xLabel = input('');
  readonly yLabel = input('');
  readonly annotations = input<ChartAnnotation[]>([]);
  readonly cursorX = input<number | null>(null);
  readonly hover = output<number | null>();

  protected readonly VIEW_HEIGHT = VIEW_HEIGHT;
  protected readonly left = MARGIN.left;
  protected readonly right = VIEW_WIDTH - MARGIN.right;
  protected readonly top = MARGIN.top;
  protected readonly bottom = VIEW_HEIGHT - MARGIN.bottom;
  protected readonly xTicks = computed(() => this.ticks(this.xDomain()));
  protected readonly yTicks = computed(() => this.ticks(this.yDomain()));
  protected readonly ariaLabel = computed(
    () => `Gráfico: ${this.series().map((item) => item.label).join(', ')}`,
  );
  protected readonly description = computed(
    () => `Eixo horizontal: ${this.xLabel()}. Eixo vertical: ${this.yLabel()}.`,
  );

  protected xScale(value: number): number {
    const [min, max] = this.xDomain();
    const ratio = (value - min) / Math.max(max - min, 1e-12);
    return MARGIN.left + Math.min(Math.max(ratio, 0), 1) * (this.right - this.left);
  }

  protected yScale(value: number): number {
    const [min, max] = this.yDomain();
    const ratio = (value - min) / Math.max(max - min, 1e-12);
    return this.bottom - Math.min(Math.max(ratio, 0), 1) * (this.bottom - this.top);
  }

  protected pathFor(series: ChartSeries): string {
    return series.points
      .map((point, index) => `${index === 0 ? 'M' : 'L'} ${this.xScale(point.x).toFixed(2)} ${this.yScale(point.y).toFixed(2)}`)
      .join(' ');
  }

  protected formatTick(value: number, domain: [number, number]): string {
    const range = Math.abs(domain[1] - domain[0]);
    const digits = range >= 10 ? 0 : range >= 1 ? 1 : 2;
    return formatNumber(value, digits);
  }

  protected onPointerMove(event: PointerEvent): void {
    const element = event.currentTarget as SVGSVGElement;
    const rect = element.getBoundingClientRect();
    const viewX = ((event.clientX - rect.left) / Math.max(rect.width, 1)) * VIEW_WIDTH;
    const limited = Math.min(Math.max(viewX, this.left), this.right);
    const ratio = (limited - this.left) / (this.right - this.left);
    const [min, max] = this.xDomain();
    this.hover.emit(min + ratio * (max - min));
  }

  protected onPointerLeave(): void {
    this.hover.emit(null);
  }

  private ticks(domain: [number, number]): number[] {
    const [min, max] = domain;
    return [0, 0.25, 0.5, 0.75, 1].map((ratio) => min + (max - min) * ratio);
  }
}
