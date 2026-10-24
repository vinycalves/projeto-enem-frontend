import {
  AfterViewInit,
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  OnDestroy,
  ViewChild,
  effect,
  input,
  signal,
} from '@angular/core';
import { DnaParams, DnaScene } from './dna-scene';

@Component({
  selector: 'app-dna-visualization',
  templateUrl: './dna-visualization.html',
  styleUrl: './dna-visualization.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DnaVisualization implements AfterViewInit, OnDestroy {
  @ViewChild('canvasHost', { static: true })
  private canvasHost!: ElementRef<HTMLDivElement>;

  readonly params = input<Record<string, unknown>>({});
  protected readonly webglError = signal(false);
  private scene?: DnaScene;

  constructor() {
    effect(() => {
      const params = this.readParams();
      if (this.scene) {
        this.scene.setParams(params);
      }
    });
  }

  ngAfterViewInit(): void {
    this.scene = new DnaScene();
    const started = this.scene.start(this.canvasHost.nativeElement);
    if (!started) {
      this.webglError.set(true);
      return;
    }
    this.scene.setParams(this.readParams());
  }

  ngOnDestroy(): void {
    this.scene?.dispose();
    this.scene = undefined;
  }

  private readParams(): DnaParams {
    const value = this.params();
    const rotation = Number(value['rotacao']);
    const opening = Number(value['abrirHelice']);
    return {
      rotacao: Number.isFinite(rotation) ? Math.min(Math.max(rotation, 0), 2) : 0.6,
      mostrarPares: value['mostrarPares'] !== false,
      destacarPar: value['destacarPar'] === 'C-G' ? 'C-G' : 'A-T',
      abrirHelice: Number.isFinite(opening) ? Math.min(Math.max(opening, 0), 1) : 0.1,
    };
  }
}
