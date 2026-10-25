import {
  AfterViewInit,
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  OnDestroy,
  ViewChild,
  computed,
  effect,
  inject,
  input,
  signal,
} from '@angular/core';
import { VisualizationParamsBridge } from '../../visualizations/visualization-params';
import { BaseHighlight, DnaParams, DnaScene, NucleicAcidKind } from './dna-scene';

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
  protected readonly molecule = signal<NucleicAcidKind>('dna');
  protected readonly isRna = computed(() => this.molecule() === 'rna');
  protected readonly canvasLabel = computed(() =>
    this.isRna()
      ? 'Modelo tridimensional de uma fita simples de RNA, com as bases adenina, uracila, citosina e guanina.'
      : 'Modelo tridimensional da dupla hélice do DNA, com as duas fitas antiparalelas e os pares de bases adenina–timina e citosina–guanina.',
  );

  private readonly paramsBridge = inject(VisualizationParamsBridge);
  private scene?: DnaScene;

  constructor() {
    effect(() => {
      const params = this.params();
      const molecule = this.moleculeFromParams(params);
      this.molecule.set(molecule);
      if (this.scene) {
        this.scene.setParams(this.readParams(params, molecule));
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
    this.scene.setParams(this.readParams(this.params(), this.molecule()));
  }

  ngOnDestroy(): void {
    this.scene?.dispose();
    this.scene = undefined;
  }

  protected setMolecule(molecule: NucleicAcidKind): void {
    if (this.molecule() === molecule) {
      return;
    }
    this.molecule.set(molecule);
    this.paramsBridge.update({ molecule: molecule === 'rna' ? 'RNA' : 'DNA' });
    if (this.scene) {
      this.scene.setParams(this.readParams(this.params(), molecule));
    }
  }

  protected resetView(): void {
    this.scene?.resetView();
  }

  protected onCanvasKeydown(event: KeyboardEvent): void {
    switch (event.key) {
      case 'ArrowLeft':
        this.scene?.rotateBy(0.12);
        break;
      case 'ArrowRight':
        this.scene?.rotateBy(-0.12);
        break;
      case 'ArrowUp':
      case '+':
      case '=':
        this.scene?.zoomBy(0.92);
        break;
      case 'ArrowDown':
      case '-':
      case '_':
        this.scene?.zoomBy(1.08);
        break;
      case 'Home':
        this.resetView();
        break;
      default:
        return;
    }
    event.preventDefault();
  }

  private moleculeFromParams(value: Record<string, unknown>): NucleicAcidKind {
    const raw = String(value['molecule'] ?? value['molecula'] ?? 'DNA').toUpperCase();
    return raw === 'RNA' ? 'rna' : 'dna';
  }

  private readParams(
    value: Record<string, unknown> = this.params(),
    molecule: NucleicAcidKind = this.molecule(),
  ): DnaParams {
    const showBases = value['showBases'] ?? value['mostrarBases'] ?? value['mostrarPares'];
    const highlightValue = String(
      value['highlight'] ?? value['destacarBases'] ?? value['destacarPar'] ?? 'A',
    ).toUpperCase();
    const opening = Number(value['opening'] ?? value['abrirHelice']);
    const highlight: BaseHighlight = highlightValue.startsWith('A') ? 'A' : 'CG';
    return {
      molecule,
      showBases: showBases !== false,
      highlight,
      opening: Number.isFinite(opening) ? Math.min(Math.max(opening, 0), 1) : 0.1,
    };
  }
}
