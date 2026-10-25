import {
  AfterViewInit,
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  OnDestroy,
  effect,
  input,
  output,
  signal,
  viewChild,
} from '@angular/core';
import {
  DesmosCalculator,
  buildDesmosBounds,
  buildDesmosLatex,
  loadDesmosApi,
  readDesmosSettings,
} from './desmos';
import { FunctionKind, FunctionSample } from './function-plot';

@Component({
  selector: 'app-desmos-plot',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="desmos-plot">
      <div #calculatorHost class="desmos-host" aria-label="Gráfico interativo da função"></div>
      @if (!ready()) {
        <p class="desmos-status" role="status">Carregando gráfico interativo…</p>
      }
    </div>
  `,
  styles: [
    `
      .desmos-plot {
        position: relative;
        min-height: 22rem;
        padding: 0.3rem;
        border: 1px solid var(--line);
        background: var(--card);
      }

      .desmos-host {
        min-height: 21.4rem;
      }

      .desmos-status {
        position: absolute;
        inset: 0;
        display: grid;
        place-items: center;
        margin: 0;
        background: var(--paper-deep);
        color: var(--ink-soft);
        font-size: 0.75rem;
      }
    `,
  ],
})
export class DesmosPlot implements AfterViewInit, OnDestroy {
  private readonly calculatorHost = viewChild<ElementRef<HTMLDivElement>>('calculatorHost');

  readonly kind = input.required<FunctionKind>();
  readonly a = input.required<number>();
  readonly b = input.required<number>();
  readonly c = input.required<number>();
  readonly sample = input.required<FunctionSample>();

  readonly failed = output<void>();

  protected readonly ready = signal(false);

  private calculator?: DesmosCalculator;
  private destroyed = false;

  constructor() {
    effect(() => {
      const kind = this.kind();
      const a = this.a();
      const b = this.b();
      const c = this.c();
      const sample = this.sample();
      if (this.calculator) {
        this.applyExpression(kind, a, b, c, sample);
      }
    });
  }

  ngAfterViewInit(): void {
    const settings = readDesmosSettings();
    if (!settings) {
      this.failed.emit();
      return;
    }

    loadDesmosApi(settings)
      .then((api) => {
        if (this.destroyed) return;
        const host = this.calculatorHost()?.nativeElement;
        if (!host) return;
        const calculator = api.GraphingCalculator(host, {
          expressions: false,
          keypad: false,
          settingsMenu: false,
          zoomButtons: false,
          border: false,
          pointsOfInterest: false,
          trace: false,
          autosize: true,
          language: 'pt-BR',
        });
        this.calculator = calculator;
        this.ready.set(true);
        this.applyExpression(this.kind(), this.a(), this.b(), this.c(), this.sample());
      })
      .catch(() => {
        if (!this.destroyed) {
          this.failed.emit();
        }
      });
  }

  ngOnDestroy(): void {
    this.destroyed = true;
    this.calculator?.destroy();
    this.calculator = undefined;
    this.calculatorHost()?.nativeElement.replaceChildren();
  }

  private applyExpression(
    kind: FunctionKind,
    a: number,
    b: number,
    c: number,
    sample: FunctionSample,
  ): void {
    const latex = buildDesmosLatex(kind, a, b, c);
    if (!latex || !this.calculator) {
      return;
    }
    this.calculator.setExpression({
      id: 'math-lab-function',
      latex,
      color: '#9f4f2e',
      lineWidth: 3,
    });
    this.calculator.setMathBounds(buildDesmosBounds(sample));
  }
}
