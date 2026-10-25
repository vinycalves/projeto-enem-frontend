import {
  AfterViewInit,
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  OnDestroy,
  computed,
  effect,
  input,
  signal,
  viewChild,
} from '@angular/core';
import { formatMeasure, SolidRenderParams } from './geometry-visual';
import { GeometrySolidScene } from './geometry-scene';

@Component({
  selector: 'app-geometry-solid-view',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="solid-view">
      <div
        #canvasHost
        class="solid-canvas"
        role="img"
        [attr.aria-label]="ariaLabel()"
        [class.is-hidden]="webglError()"
      ></div>

      @if (webglError()) {
        <div class="solid-fallback" role="img" [attr.aria-label]="ariaLabel()">
          <svg viewBox="0 0 120 120" aria-hidden="true">
            <path d="M24 38 60 18l36 20v44L60 102 24 82Z" />
            <path d="M24 38l36 20 36-20M60 58v44" />
            <path d="M42 28 78 48v44" />
          </svg>
          <div>
            <strong>Visualização 3D indisponível</strong>
            <p>
              Este navegador não conseguiu iniciar o WebGL. As medidas e os resultados continuam
              disponíveis abaixo.
            </p>
          </div>
        </div>
      }

      <div class="solid-measures" aria-label="Medidas do sólido">
        @for (measure of measurements(); track measure.label) {
          <span
            ><strong>{{ measure.label }}</strong> {{ measure.value }}</span
          >
        }
      </div>

      @if (!webglError()) {
        <p class="solid-hint">
          Arraste para girar · use a roda para ampliar · sem rotação automática
        </p>
      }
    </div>
  `,
  styles: [
    `
      :host {
        display: block;
      }

      .solid-view {
        display: grid;
        gap: 0.55rem;
        min-height: 22rem;
        padding: 0.7rem;
        background:
          radial-gradient(circle at 50% 40%, rgba(127, 183, 201, 0.18), transparent 44%), #10251f;
        color: #edf6f0;
      }

      .solid-canvas {
        min-height: 18rem;
        cursor: grab;
      }

      .solid-canvas:active {
        cursor: grabbing;
      }

      .solid-canvas.is-hidden {
        display: none;
      }

      .solid-fallback {
        display: grid;
        grid-template-columns: minmax(5rem, 0.4fr) minmax(0, 1fr);
        gap: 0.9rem;
        align-items: center;
        min-height: 18rem;
        padding: 0.8rem;
      }

      .solid-fallback svg {
        width: 100%;
        max-width: 8rem;
        fill: rgba(159, 227, 194, 0.08);
        stroke: #9fe3c2;
        stroke-width: 2;
        stroke-linejoin: round;
      }

      .solid-fallback strong {
        display: block;
        margin-bottom: 0.25rem;
        font-size: 0.85rem;
      }

      .solid-fallback p {
        margin: 0;
        color: #b9d1c2;
        font-size: 0.78rem;
        line-height: 1.55;
      }

      .solid-measures {
        display: flex;
        flex-wrap: wrap;
        gap: 0.35rem;
      }

      .solid-measures span {
        padding: 0.25rem 0.4rem;
        border: 1px solid rgba(237, 246, 240, 0.18);
        color: #d7e8df;
        font-size: 0.66rem;
      }

      .solid-measures strong {
        color: #9fe3c2;
        font-weight: 700;
      }

      .solid-hint {
        margin: 0;
        color: #9eb9aa;
        font-size: 0.64rem;
      }

      @media (max-width: 620px) {
        .solid-fallback {
          grid-template-columns: 1fr;
        }
      }
    `,
  ],
})
export class GeometrySolidView implements AfterViewInit, OnDestroy {
  private readonly canvasHost = viewChild.required<ElementRef<HTMLDivElement>>('canvasHost');

  readonly params = input.required<SolidRenderParams>();

  protected readonly webglError = signal(false);
  protected readonly measurements = computed(() => {
    const params = this.params();
    if (params.shape === 'rectangularPrism') {
      return [
        { label: 'Comprimento', value: formatMeasure(params.width) },
        { label: 'Profundidade', value: formatMeasure(params.depth) },
        { label: 'Altura', value: formatMeasure(params.height) },
      ];
    }
    if (params.shape === 'sphere') {
      return [{ label: 'Raio', value: formatMeasure(params.radius) }];
    }
    return [
      { label: 'Raio', value: formatMeasure(params.radius) },
      { label: 'Altura', value: formatMeasure(params.height) },
    ];
  });
  protected readonly ariaLabel = computed(() => {
    const shape = {
      cylinder: 'cilindro',
      cone: 'cone',
      sphere: 'esfera',
      rectangularPrism: 'bloco retangular',
    }[this.params().shape];
    const measures = this.measurements()
      .map((measure) => `${measure.label.toLowerCase()} ${measure.value}`)
      .join(', ');
    return `Visualização tridimensional de ${shape} com ${measures}. Arraste para girar e use a roda para ampliar.`;
  });

  private scene?: GeometrySolidScene;

  constructor() {
    effect(() => {
      const params = this.params();
      if (this.scene) {
        this.scene.setParams(params);
      }
    });
  }

  ngAfterViewInit(): void {
    if (!supportsWebGl()) {
      this.webglError.set(true);
      return;
    }

    const scene = new GeometrySolidScene();
    if (!scene.start(this.canvasHost().nativeElement)) {
      scene.dispose();
      this.webglError.set(true);
      return;
    }
    scene.setParams(this.params());
    this.scene = scene;
  }

  ngOnDestroy(): void {
    this.scene?.dispose();
    this.scene = undefined;
  }
}

/**
 * Testa o WebGL em um canvas descartável e libera o contexto imediatamente,
 * evitando acumular contextos a cada montagem do componente.
 */
function supportsWebGl(): boolean {
  if (typeof document === 'undefined') {
    return false;
  }
  try {
    const canvas = document.createElement('canvas');
    const context = canvas.getContext('webgl2') ?? canvas.getContext('webgl');
    if (!context) {
      return false;
    }
    context.getExtension('WEBGL_lose_context')?.loseContext();
    return true;
  } catch {
    return false;
  }
}
