import {
  AfterViewInit,
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  NgZone,
  OnDestroy,
  ViewChild,
  computed,
  inject,
  signal,
} from '@angular/core';
import { RouterLink } from '@angular/router';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js';
import { RoundedBoxGeometry } from 'three/examples/jsm/geometries/RoundedBoxGeometry.js';
import { OutputPass } from 'three/examples/jsm/postprocessing/OutputPass.js';
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/examples/jsm/postprocessing/UnrealBloomPass.js';
import {
  CellKind,
  Organelle,
  organelleById,
  organellesFor,
} from '../../../core/biology-data';

interface Floater {
  object: THREE.Object3D;
  baseY: number;
  phase: number;
  amplitude: number;
  spin: number;
}

interface Callout {
  id: string;
  button: HTMLButtonElement;
  line: SVGLineElement;
  dot: SVGCircleElement;
  localCenter: THREE.Vector3;
  side: 'left' | 'right';
  anchorX: number;
  anchorY: number;
}

const LABEL_IDS: Record<CellKind, string[]> = {
  animal: ['membrane', 'nucleus', 'nucleolus', 'mitochondrion', 'rer', 'golgi', 'lysosome', 'centrosome'],
  vegetal: ['cellwall', 'nucleus', 'chloroplast', 'vacuole', 'mitochondrion', 'golgi', 'peroxisome', 'rer'],
};

@Component({
  selector: 'app-cell-lab',
  imports: [RouterLink],
  templateUrl: './cell-lab.html',
  styleUrl: './cell-lab.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CellLab implements AfterViewInit, OnDestroy {
  @ViewChild('canvasHost', { static: true })
  private canvasHost!: ElementRef<HTMLDivElement>;

  private readonly ngZone = inject(NgZone);
  protected readonly kind = signal<CellKind>('animal');
  protected readonly selectedId = signal('nucleus');
  protected readonly isolate = signal(false);
  protected readonly showLabels = signal(true);
  protected readonly webglError = signal(false);

  protected readonly organelles = computed(() => organellesFor(this.kind()));
  protected readonly selected = computed<Organelle | undefined>(() => {
    return organelleById(this.selectedId()) ?? this.organelles()[0];
  });
  protected readonly selectedColor = computed(() => {
    const organelle = this.selected();
    return organelle ? this.organelleColor(organelle) : '';
  });

  private renderer?: THREE.WebGLRenderer;
  private scene?: THREE.Scene;
  private camera?: THREE.PerspectiveCamera;
  private controls?: OrbitControls;
  private composer?: EffectComposer;
  private bloomPass?: UnrealBloomPass;
  private calloutLayer?: HTMLDivElement;
  private calloutSvg?: SVGSVGElement;
  private readonly callouts: Callout[] = [];
  private cellGroup?: THREE.Group;
  private membrane?: THREE.Object3D;
  private bubbles?: THREE.Points;
  private bubblePositions?: Float32Array;
  private bubbleSpeeds?: Float32Array;
  private waterLightA?: THREE.PointLight;
  private waterLightB?: THREE.PointLight;
  private readonly floaters: Floater[] = [];
  private readonly meshes = new Map<string, THREE.Object3D>();
  private readonly raycaster = new THREE.Raycaster();
  private readonly pointer = new THREE.Vector2();
  private readonly clock = new THREE.Clock();
  private readonly defaultCamera = new THREE.Vector3(4.2, 3.2, 6.4);
  private focusTarget?: THREE.Vector3;
  private focusPosition?: THREE.Vector3;
  private focusUntil = 0;
  private resizeObserver?: ResizeObserver;
  private intersectionObserver?: IntersectionObserver;
  private visible = true;
  private contextLost = false;
  private pointerDown?: { x: number; y: number; time: number };
  private pointerMoved = false;

  ngAfterViewInit(): void {
    this.ngZone.runOutsideAngular(() => this.initScene());
  }

  ngOnDestroy(): void {
    this.renderer?.setAnimationLoop(null);
    this.resizeObserver?.disconnect();
    this.intersectionObserver?.disconnect();
    this.resizeObserver = undefined;
    this.intersectionObserver = undefined;
    window.removeEventListener('resize', this.onWindowResize);
    document.removeEventListener('visibilitychange', this.onVisibilityChange);
    this.controls?.dispose();
    this.disposeObject(this.cellGroup);
    this.bubbles?.geometry.dispose();
    if (this.bubbles?.material instanceof THREE.PointsMaterial) {
      this.bubbles.material.map?.dispose();
      this.bubbles.material.dispose();
    }
    if (this.scene?.background instanceof THREE.Texture) {
      this.scene.background.dispose();
    }
    if (this.scene?.environment instanceof THREE.Texture) {
      this.scene.environment.dispose();
    }
    this.composer?.dispose();
    this.bloomPass?.dispose();
    this.calloutLayer?.remove();
    this.renderer?.domElement.removeEventListener('pointerdown', this.onPointerDown);
    this.renderer?.domElement.removeEventListener('pointermove', this.onPointerMove);
    this.renderer?.domElement.removeEventListener('pointerup', this.onPointerUp);
    this.renderer?.domElement.removeEventListener('pointercancel', this.onPointerCancel);
    this.renderer?.dispose();
    this.renderer?.forceContextLoss();
    this.renderer = undefined;
  }

  protected setCellKind(kind: CellKind): void {
    if (this.kind() === kind) {
      return;
    }
    this.kind.set(kind);
    this.selectedId.set('nucleus');
    this.buildCell();
    this.applySelection();
    this.resetFocus();
  }

  protected selectOrganelle(id: string): void {
    this.selectedId.set(id);
    this.applySelection();
    this.focusOn(id);
  }

  protected toggleIsolate(): void {
    this.isolate.update((value) => !value);
    this.applySelection();
  }

  protected toggleLabels(): void {
    const next = !this.showLabels();
    this.showLabels.set(next);
    if (this.calloutLayer) {
      this.calloutLayer.style.display = next ? 'block' : 'none';
    }
    if (next) {
      this.updateCallouts();
    }
  }

  protected resetView(): void {
    if (!this.camera || !this.controls) {
      return;
    }
    this.focusTarget = undefined;
    this.focusPosition = undefined;
    this.focusUntil = 0;
    this.controls.enabled = true;
    this.camera.position.copy(this.defaultCamera);
    this.controls.target.set(0, 0, 0);
    this.controls.update();
  }

  private initScene(): void {
    const host = this.canvasHost.nativeElement;
    const canvas = document.createElement('canvas');

    try {
      this.renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: false });
    } catch {
      this.webglError.set(true);
      return;
    }

    const renderer = this.renderer;
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    renderer.setSize(Math.max(host.clientWidth, 320), Math.max(host.clientHeight, 420), false);
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 0.9;
    renderer.setClearColor(0x081b19, 1);
    canvas.setAttribute('aria-hidden', 'true');
    canvas.style.position = 'absolute';
    canvas.style.inset = '0';
    canvas.style.display = 'block';
    canvas.style.width = '100%';
    canvas.style.height = '100%';
    canvas.addEventListener('pointerdown', this.onPointerDown);
    canvas.addEventListener('pointermove', this.onPointerMove);
    canvas.addEventListener('pointerup', this.onPointerUp);
    canvas.addEventListener('pointercancel', this.onPointerCancel);
    canvas.addEventListener('webglcontextlost', this.onContextLost);
    canvas.addEventListener('webglcontextrestored', this.onContextRestored);
    host.appendChild(canvas);

    this.calloutLayer = document.createElement('div');
    this.calloutLayer.className = 'cell-callouts';
    this.calloutSvg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    this.calloutSvg.setAttribute('class', 'cell-callout-lines');
    this.calloutLayer.appendChild(this.calloutSvg);
    host.appendChild(this.calloutLayer);

    this.scene = new THREE.Scene();
    this.scene.background = this.createWaterBackground();
    this.scene.fog = new THREE.FogExp2(0x081b19, 0.02);

    const environment = new RoomEnvironment();
    const pmrem = new THREE.PMREMGenerator(renderer);
    this.scene.environment = pmrem.fromScene(environment, 0.04).texture;
    this.scene.environmentIntensity = 0.42;
    pmrem.dispose();

    this.camera = new THREE.PerspectiveCamera(
      40,
      Math.max(host.clientWidth, 1) / Math.max(host.clientHeight, 1),
      0.1,
      100,
    );
    this.camera.position.copy(this.defaultCamera);

    this.controls = new OrbitControls(this.camera, canvas);
    this.controls.enableDamping = true;
    this.controls.dampingFactor = 0.08;
    this.controls.minDistance = 3.2;
    this.controls.maxDistance = 12;
    this.controls.maxPolarAngle = Math.PI * 0.9;
    this.controls.target.set(0, 0, 0);

    this.scene.add(new THREE.HemisphereLight(0xd7fff5, 0x051412, 1.05));
    const keyLight = new THREE.DirectionalLight(0xfff3dc, 1.65);
    keyLight.position.set(5, 8, 6);
    this.scene.add(keyLight);
    const rimLight = new THREE.DirectionalLight(0x75d8ff, 0.9);
    rimLight.position.set(-6, 2, -5);
    this.scene.add(rimLight);
    this.waterLightA = new THREE.PointLight(0x62e8c2, 6, 15, 2);
    this.waterLightA.position.set(-2.5, 2.4, 2.5);
    this.scene.add(this.waterLightA);
    this.waterLightB = new THREE.PointLight(0x4d9fe0, 4, 14, 2);
    this.waterLightB.position.set(2.6, -1.8, -2);
    this.scene.add(this.waterLightB);

    this.buildCell();
    this.createBubbles();
    this.setupComposer(host);
    this.observe(host);
    this.renderer.setAnimationLoop(this.animate);
  }

  private setupComposer(host: HTMLDivElement): void {
    if (!this.renderer || !this.scene || !this.camera) {
      return;
    }
    this.composer = new EffectComposer(this.renderer);
    this.composer.addPass(new RenderPass(this.scene, this.camera));
    this.bloomPass = new UnrealBloomPass(
      new THREE.Vector2(Math.max(host.clientWidth, 1), Math.max(host.clientHeight, 1)),
      0.06,
      0.35,
      0.98,
    );
    this.composer.addPass(this.bloomPass);
    this.composer.addPass(new OutputPass());
    this.composer.setSize(Math.max(host.clientWidth, 1), Math.max(host.clientHeight, 1));
  }

  private createWaterBackground(): THREE.Texture {
    const canvas = document.createElement('canvas');
    canvas.width = 512;
    canvas.height = 512;
    const context = canvas.getContext('2d');
    if (context) {
      const gradient = context.createRadialGradient(256, 190, 20, 256, 256, 400);
      gradient.addColorStop(0, '#1d5b50');
      gradient.addColorStop(0.35, '#103f3a');
      gradient.addColorStop(0.72, '#092b29');
      gradient.addColorStop(1, '#041412');
      context.fillStyle = gradient;
      context.fillRect(0, 0, 512, 512);
      context.globalAlpha = 0.07;
      context.strokeStyle = '#b7fff0';
      context.lineWidth = 1;
      for (let index = 0; index < 16; index += 1) {
        context.beginPath();
        for (let x = 0; x <= 512; x += 8) {
          const y = 100 + index * 26 + Math.sin(x * 0.018 + index) * 11;
          if (x === 0) {
            context.moveTo(x, y);
          } else {
            context.lineTo(x, y);
          }
        }
        context.stroke();
      }
    }
    const texture = new THREE.CanvasTexture(canvas);
    texture.colorSpace = THREE.SRGBColorSpace;
    return texture;
  }

  private buildCell(): void {
    if (!this.scene) {
      return;
    }

    if (this.cellGroup) {
      this.scene.remove(this.cellGroup);
      this.disposeObject(this.cellGroup);
    }

    this.meshes.clear();
    this.floaters.length = 0;
    this.membrane = undefined;

    const group = new THREE.Group();
    this.cellGroup = group;
    this.scene.add(group);

    const standard = (
      color: string,
      options: {
        opacity?: number;
        transparent?: boolean;
        roughness?: number;
        metalness?: number;
        depthWrite?: boolean;
        side?: THREE.Side;
        emissive?: string;
        emissiveIntensity?: number;
      } = {},
    ) =>
      new THREE.MeshStandardMaterial({
        color: new THREE.Color(color),
        transparent: options.transparent ?? false,
        opacity: options.opacity ?? 1,
        roughness: options.roughness ?? 0.42,
        metalness: options.metalness ?? 0.05,
        depthWrite: options.depthWrite ?? true,
        side: options.side ?? THREE.DoubleSide,
        emissive: new THREE.Color(options.emissive ?? '#000000'),
        emissiveIntensity: options.emissiveIntensity ?? 0,
        envMapIntensity: 0.55,
      });

    const physical = (
      color: string,
      options: {
        roughness?: number;
        clearcoat?: number;
        emissive?: string;
        emissiveIntensity?: number;
      } = {},
    ) =>
      new THREE.MeshPhysicalMaterial({
        color: new THREE.Color(color),
        roughness: options.roughness ?? 0.3,
        metalness: 0.04,
        clearcoat: options.clearcoat ?? 0.7,
        clearcoatRoughness: 0.22,
        emissive: new THREE.Color(options.emissive ?? '#000000'),
        emissiveIntensity: options.emissiveIntensity ?? 0,
        side: THREE.DoubleSide,
        envMapIntensity: 0.6,
      });

    const register = (
      id: string,
      object: THREE.Object3D,
      float = true,
      amplitude = 0.035,
      spin = 0.02,
    ) => {
      object.traverse((child) => {
        child.userData['organelleId'] = id;
      });
      this.meshes.set(id, object);
      group.add(object);
      if (float) {
        this.floaters.push({
          object,
          baseY: object.position.y,
          phase: this.floaters.length * 1.73,
          amplitude,
          spin,
        });
      }
    };

    if (this.kind() === 'animal') {
      this.buildAnimalCutaway(standard, register);
    } else {
      this.buildPlantCutaway(standard, register);
    }

    this.buildCommonOrganelles(standard, physical, register);
    this.buildCallouts();
    this.applySelection();
  }

  private buildAnimalCutaway(
    standard: (
      color: string,
      options?: {
        opacity?: number;
        transparent?: boolean;
        roughness?: number;
        metalness?: number;
        depthWrite?: boolean;
        side?: THREE.Side;
        emissive?: string;
        emissiveIntensity?: number;
      },
    ) => THREE.MeshStandardMaterial,
    register: (id: string, object: THREE.Object3D, float?: boolean, amplitude?: number, spin?: number) => void,
  ): void {
    const membrane = new THREE.Group();
    const shellGeometry = new THREE.SphereGeometry(2.35, 72, 40, 0, Math.PI * 2, 0, Math.PI / 2);
    const shell = new THREE.Mesh(
      shellGeometry,
      standard('#8b5cf6', {
        transparent: true,
        opacity: 0.2,
        depthWrite: false,
        side: THREE.DoubleSide,
        roughness: 0.24,
        emissive: '#4c1d95',
        emissiveIntensity: 0.18,
      }),
    );
    shell.rotation.x = -Math.PI / 2;
    membrane.add(shell);

    const rim = new THREE.Mesh(
      new THREE.TorusGeometry(2.35, 0.115, 16, 96),
      standard('#7c3aed', {
        roughness: 0.28,
        metalness: 0.28,
        emissive: '#4c1d95',
        emissiveIntensity: 0.4,
      }),
    );
    membrane.add(rim);
    this.membrane = membrane;
    register('membrane', membrane, false);

    const cytoplasm = new THREE.Mesh(
      new THREE.SphereGeometry(2.26, 64, 36, 0, Math.PI * 2, 0, Math.PI / 2),
      standard('#7dd3fc', {
        transparent: true,
        opacity: 0.2,
        depthWrite: false,
        side: THREE.BackSide,
        roughness: 0.8,
        emissive: '#0c4a6e',
        emissiveIntensity: 0.08,
      }),
    );
    cytoplasm.rotation.x = -Math.PI / 2;
    register('cytoplasm', cytoplasm, false);
  }

  private buildPlantCutaway(
    standard: (
      color: string,
      options?: {
        opacity?: number;
        transparent?: boolean;
        roughness?: number;
        metalness?: number;
        depthWrite?: boolean;
        side?: THREE.Side;
        emissive?: string;
        emissiveIntensity?: number;
      },
    ) => THREE.MeshStandardMaterial,
    register: (id: string, object: THREE.Object3D, float?: boolean, amplitude?: number, spin?: number) => void,
  ): void {
    const wall = new THREE.Group();

    const backShell = new THREE.Mesh(
      new RoundedBoxGeometry(4.6, 3.6, 2.6, 6, 0.34),
      standard('#22c55e', {
        transparent: true,
        opacity: 0.2,
        roughness: 0.38,
        side: THREE.DoubleSide,
        emissive: '#14532d',
        emissiveIntensity: 0.16,
      }),
    );
    backShell.position.z = -0.35;
    wall.add(backShell);

    const frameShape = this.roundedRectShape(4.8, 3.9, 0.38);
    const hole = this.roundedRectPath(4.16, 3.26, 0.3);
    frameShape.holes.push(hole);
    const frame = new THREE.Mesh(
      new THREE.ExtrudeGeometry(frameShape, {
        depth: 0.36,
        bevelEnabled: true,
        bevelSegments: 3,
        steps: 1,
        bevelSize: 0.06,
        bevelThickness: 0.06,
        curveSegments: 12,
      }),
      standard('#16a34a', {
        roughness: 0.28,
        metalness: 0.08,
        emissive: '#14532d',
        emissiveIntensity: 0.25,
      }),
    );
    frame.position.z = 0.95;
    wall.add(frame);
    this.membrane = wall;
    register('cellwall', wall, false);

    const membrane = new THREE.Mesh(
      new RoundedBoxGeometry(4.18, 3.28, 2.35, 6, 0.3),
      standard('#86efac', {
        transparent: true,
        opacity: 0.12,
        roughness: 0.25,
        depthWrite: false,
        side: THREE.FrontSide,
        emissive: '#166534',
        emissiveIntensity: 0.1,
      }),
    );
    membrane.position.z = -0.2;
    register('membrane', membrane, false);

    const cytoplasmShape = this.roundedRectShape(4.15, 3.25, 0.28);
    const cytoplasm = new THREE.Mesh(
      new THREE.ShapeGeometry(cytoplasmShape, 16),
      standard('#4ade80', {
        transparent: true,
        opacity: 0.2,
        roughness: 0.9,
        depthWrite: false,
        side: THREE.DoubleSide,
        emissive: '#14532d',
        emissiveIntensity: 0.08,
      }),
    );
    cytoplasm.position.z = -1.22;
    register('cytoplasm', cytoplasm, false);

    const vacuole = new THREE.Mesh(
      new THREE.SphereGeometry(1.36, 48, 32),
      standard('#38bdf8', {
        transparent: true,
        opacity: 0.3,
        roughness: 0.14,
        depthWrite: false,
        emissive: '#0e7490',
        emissiveIntensity: 0.12,
      }),
    );
    vacuole.scale.set(1.12, 0.9, 0.72);
    vacuole.position.set(0.3, 0.02, -0.15);
    register('vacuole', vacuole, true, 0.016, 0.006);
  }

  private roundedRectShape(width: number, height: number, radius: number): THREE.Shape {
    const shape = new THREE.Shape();
    const x = -width / 2;
    const y = -height / 2;
    shape.moveTo(x + radius, y);
    shape.lineTo(x + width - radius, y);
    shape.quadraticCurveTo(x + width, y, x + width, y + radius);
    shape.lineTo(x + width, y + height - radius);
    shape.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
    shape.lineTo(x + radius, y + height);
    shape.quadraticCurveTo(x, y + height, x, y + height - radius);
    shape.lineTo(x, y + radius);
    shape.quadraticCurveTo(x, y, x + radius, y);
    return shape;
  }

  private roundedRectPath(width: number, height: number, radius: number): THREE.Path {
    const path = new THREE.Path();
    const x = -width / 2;
    const y = -height / 2;
    path.moveTo(x + radius, y);
    path.lineTo(x + width - radius, y);
    path.quadraticCurveTo(x + width, y, x + width, y + radius);
    path.lineTo(x + width, y + height - radius);
    path.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
    path.lineTo(x + radius, y + height);
    path.quadraticCurveTo(x, y + height, x, y + height - radius);
    path.lineTo(x, y + radius);
    path.quadraticCurveTo(x, y, x + radius, y);
    return path;
  }

  private buildCommonOrganelles(
    standard: (
      color: string,
      options?: {
        opacity?: number;
        transparent?: boolean;
        roughness?: number;
        metalness?: number;
        depthWrite?: boolean;
        side?: THREE.Side;
        emissive?: string;
        emissiveIntensity?: number;
      },
    ) => THREE.MeshStandardMaterial,
    physical: (
      color: string,
      options?: { roughness?: number; clearcoat?: number; emissive?: string; emissiveIntensity?: number },
    ) => THREE.MeshPhysicalMaterial,
    register: (id: string, object: THREE.Object3D, float?: boolean, amplitude?: number, spin?: number) => void,
  ): void {
    const nucleusPosition =
      this.kind() === 'animal'
        ? new THREE.Vector3(-0.35, 0.45, 0.05)
        : new THREE.Vector3(-1.2, 0.75, -0.15);
    const plant = this.kind() === 'vegetal';
    const nucleus = new THREE.Mesh(
      new THREE.SphereGeometry(this.kind() === 'animal' ? 0.78 : 0.58, 48, 32),
      physical(plant ? '#fbbf24' : '#d8b4fe', {
        roughness: 0.3,
        clearcoat: 0.8,
        emissive: plant ? '#92400e' : '#6b21a8',
        emissiveIntensity: 0.18,
      }),
    );
    nucleus.position.copy(nucleusPosition);
    register('nucleus', nucleus, true, 0.025, 0.012);

    const nucleolus = new THREE.Mesh(
      new THREE.SphereGeometry(this.kind() === 'animal' ? 0.25 : 0.18, 28, 20),
      physical(plant ? '#2563eb' : '#7e22ce', {
        roughness: 0.28,
        emissive: plant ? '#1e3a8a' : '#3b0764',
        emissiveIntensity: 0.25,
      }),
    );
    nucleolus.position.copy(nucleusPosition).add(new THREE.Vector3(0.2, 0.06, 0.12));
    register('nucleolus', nucleolus, true, 0.032, 0.02);

    const mitochondria = new THREE.Group();
    const mitochondrialPositions =
      this.kind() === 'animal'
        ? [
            new THREE.Vector3(1.15, 0.95, 0.55),
            new THREE.Vector3(1.2, -0.65, -0.25),
            new THREE.Vector3(-1.2, -0.95, 0.45),
          ]
        : [
            new THREE.Vector3(1.45, -0.8, 0.25),
            new THREE.Vector3(-1.5, -0.55, -0.3),
            new THREE.Vector3(0.9, 1.15, -0.25),
          ];
    const mitochondriaGeometry = new THREE.CapsuleGeometry(0.15, 0.52, 10, 20);
    const mitochondriaMaterial = standard('#ef4444', {
      roughness: 0.3,
      emissive: '#7f1d1d',
      emissiveIntensity: 0.18,
    });
    const cristaeGeometry = new THREE.TorusGeometry(0.16, 0.02, 6, 18);
    const cristaeMaterial = standard('#fbbf24', {
      roughness: 0.4,
      emissive: '#92400e',
      emissiveIntensity: 0.1,
    });
    for (const [index, position] of mitochondrialPositions.entries()) {
      const mitochondrion = new THREE.Group();
      const body = new THREE.Mesh(mitochondriaGeometry, mitochondriaMaterial);
      body.rotation.z = index % 2 === 0 ? 0.7 : -0.4;
      body.rotation.x = index * 0.5;
      mitochondrion.add(body);
      for (let ring = 0; ring < 3; ring += 1) {
        const ridge = new THREE.Mesh(cristaeGeometry, cristaeMaterial);
        ridge.position.y = -0.2 + ring * 0.2;
        ridge.rotation.x = Math.PI / 2;
        mitochondrion.add(ridge);
      }
      mitochondrion.position.copy(position);
      mitochondria.add(mitochondrion);
    }
    register('mitochondrion', mitochondria, true, 0.045, 0.028);

    const ribosomeCount = 30;
    const ribosomeGeometry = new THREE.SphereGeometry(0.045, 8, 6);
    const ribosomeMaterial = standard(plant ? '#facc15' : '#a855f7', {
      roughness: 0.45,
      emissive: plant ? '#854d0e' : '#6b21a8',
      emissiveIntensity: 0.22,
    });
    const ribosomes = new THREE.InstancedMesh(
      ribosomeGeometry,
      ribosomeMaterial,
      ribosomeCount,
    );
    const ribosomeMatrix = new THREE.Matrix4();
    for (let index = 0; index < ribosomeCount; index += 1) {
      const angle = index * 2.399;
      const radius = 1.2 + (index % 5) * 0.16;
      const height = Math.sin(index * 1.7) * (this.kind() === 'animal' ? 1.2 : 0.9);
      ribosomeMatrix.makeTranslation(
        Math.cos(angle) * radius * (this.kind() === 'animal' ? 1 : 1.15),
        height,
        Math.sin(angle) * radius * 0.7,
      );
      ribosomes.setMatrixAt(index, ribosomeMatrix);
    }
    ribosomes.instanceMatrix.needsUpdate = true;
    register('ribosome', ribosomes, true, 0.035, 0.012);

    const rer = new THREE.Group();
    const rerGeometry = new THREE.TorusGeometry(
      this.kind() === 'animal' ? 0.98 : 0.72,
      0.065,
      10,
      48,
      Math.PI * 1.15,
    );
    const rerMaterial = standard(plant ? '#4ade80' : '#2dd4bf', {
      roughness: 0.36,
      emissive: plant ? '#166534' : '#115e59',
      emissiveIntensity: 0.18,
    });
    for (let index = 0; index < 3; index += 1) {
      const fold = new THREE.Mesh(rerGeometry, rerMaterial);
      fold.position.copy(nucleusPosition);
      fold.position.y += (index - 1) * 0.18;
      fold.rotation.set(0.5 + index * 0.35, 0.3, index * 0.9);
      rer.add(fold);
    }
    register('rer', rer, true, 0.03, 0.01);

    const golgi = new THREE.Group();
    const golgiPosition =
      this.kind() === 'animal'
        ? new THREE.Vector3(1.2, -0.75, 0.35)
        : new THREE.Vector3(1.45, 0.55, 0.1);
    const golgiGeometry = new THREE.BoxGeometry(0.68, 0.075, 0.38);
    const golgiMaterial = standard('#fb923c', {
      roughness: 0.34,
      emissive: '#7c2d12',
      emissiveIntensity: 0.14,
    });
    for (let index = 0; index < 5; index += 1) {
      const cisterna = new THREE.Mesh(golgiGeometry, golgiMaterial);
      cisterna.position.copy(golgiPosition);
      cisterna.position.y += index * 0.105;
      cisterna.scale.x = 1 - index * 0.08;
      cisterna.rotation.z = index * 0.05;
      cisterna.rotation.y = 0.35;
      golgi.add(cisterna);
    }
    register('golgi', golgi, true, 0.035, 0.022);

    if (this.kind() === 'animal') {
      const lysosomes = new THREE.Group();
      const lysosomeGeometry = new THREE.IcosahedronGeometry(0.14, 2);
      const lysosomeMaterial = standard('#f472b6', {
        roughness: 0.32,
        emissive: '#831843',
        emissiveIntensity: 0.18,
      });
      const lysosomePositions = [
        new THREE.Vector3(-1.25, -0.7, -0.2),
        new THREE.Vector3(0.55, -1.2, 0.45),
        new THREE.Vector3(0.35, 1.25, -0.4),
        new THREE.Vector3(-1.4, 0.8, 0.55),
      ];
      for (const position of lysosomePositions) {
        const lysosome = new THREE.Mesh(lysosomeGeometry, lysosomeMaterial);
        lysosome.position.copy(position);
        lysosomes.add(lysosome);
      }
      register('lysosome', lysosomes, true, 0.05, 0.035);

      const centrosome = new THREE.Group();
      const centrioleGeometry = new THREE.CylinderGeometry(0.075, 0.075, 0.5, 14);
      const centrioleMaterial = standard('#facc15', {
        roughness: 0.28,
        emissive: '#854d0e',
        emissiveIntensity: 0.16,
      });
      for (const rotation of [0, Math.PI / 2]) {
        const centriole = new THREE.Mesh(centrioleGeometry, centrioleMaterial);
        centriole.rotation.z = rotation;
        centrosome.add(centriole);
      }
      centrosome.position.set(0.95, 0.95, -0.35);
      register('centrosome', centrosome, true, 0.022, 0.018);
    }

    if (this.kind() === 'vegetal') {
      const peroxisomes = new THREE.Group();
      const peroxisomeGeometry = new THREE.SphereGeometry(0.13, 20, 14);
      const peroxisomeMaterial = physical('#8b5cf6', {
        roughness: 0.3,
        clearcoat: 0.7,
        emissive: '#4c1d95',
        emissiveIntensity: 0.2,
      });
      for (const position of [
        new THREE.Vector3(0.55, -0.45, 0.35),
        new THREE.Vector3(-0.55, -0.95, 0.15),
      ]) {
        const peroxisome = new THREE.Mesh(peroxisomeGeometry, peroxisomeMaterial);
        peroxisome.position.copy(position);
        peroxisomes.add(peroxisome);
      }
      register('peroxisome', peroxisomes, true, 0.05, 0.03);

      const chloroplasts = new THREE.Group();
      const positions = [
        new THREE.Vector3(1.45, 0.9, 0.1),
        new THREE.Vector3(1.5, -0.5, -0.2),
        new THREE.Vector3(-1.6, 0.35, 0.2),
        new THREE.Vector3(-1.5, -0.8, -0.1),
        new THREE.Vector3(0.35, 1.35, 0.15),
        new THREE.Vector3(0.5, -1.25, -0.2),
      ];
      const chloroplastGeometry = new THREE.SphereGeometry(0.33, 28, 18);
      const chloroplastMaterial = standard('#22c55e', {
        roughness: 0.3,
        emissive: '#166534',
        emissiveIntensity: 0.18,
      });
      const thylakoidGeometry = new THREE.CylinderGeometry(0.075, 0.075, 0.018, 12);
      const thylakoidMaterial = standard('#a3e635', {
        roughness: 0.4,
        emissive: '#4d7c0f',
        emissiveIntensity: 0.14,
      });
      for (const position of positions) {
        const chloroplast = new THREE.Group();
        const body = new THREE.Mesh(chloroplastGeometry, chloroplastMaterial);
        body.scale.set(1.35, 0.68, 0.9);
        chloroplast.add(body);
        for (let stack = 0; stack < 4; stack += 1) {
          const thylakoid = new THREE.Mesh(thylakoidGeometry, thylakoidMaterial);
          thylakoid.position.set(-0.14 + (stack % 2) * 0.28, -0.12 + stack * 0.08, 0.05);
          thylakoid.rotation.z = 0.35;
          chloroplast.add(thylakoid);
        }
        chloroplast.position.copy(position);
        chloroplast.rotation.set(position.x, position.y, position.z);
        chloroplasts.add(chloroplast);
      }
      register('chloroplast', chloroplasts, true, 0.04, 0.018);
    }
  }

  protected organelleColor(organelle: Organelle): string {
    if (this.kind() === 'vegetal') {
      if (organelle.id === 'nucleus') return '#fbbf24';
      if (organelle.id === 'nucleolus') return '#2563eb';
      if (organelle.id === 'ribosome') return '#facc15';
      if (organelle.id === 'rer') return '#4ade80';
    }
    return organelle.color;
  }

  private buildCallouts(): void {
    if (!this.calloutLayer || !this.calloutSvg) {
      return;
    }

    this.callouts.length = 0;
    this.calloutLayer.querySelectorAll('.callout-card').forEach((element) => element.remove());
    this.calloutSvg.replaceChildren();

    const visibleIds = new Set(LABEL_IDS[this.kind()]);
    const organelles = this.organelles();
    const selected = organelles.filter((organelle) => visibleIds.has(organelle.id));

    selected.forEach((organelle, index) => {
      const object = this.meshes.get(organelle.id);
      if (!object) {
        return;
      }
      object.updateWorldMatrix(true, false);
      const box = new THREE.Box3().setFromObject(object);
      const worldCenter = box.getCenter(new THREE.Vector3());
      const localCenter = object.worldToLocal(worldCenter.clone());

      const overallIndex = organelles.findIndex((item) => item.id === organelle.id) + 1;
      const color = this.organelleColor(organelle);
      const button = document.createElement('button');
      button.type = 'button';
      button.className = 'callout-card';
      button.style.setProperty('--callout-color', color);
      button.innerHTML = `<span class="callout-index">${overallIndex}</span><span>${organelle.name}</span>`;
      button.addEventListener('click', () => {
        this.ngZone.run(() => this.selectOrganelle(organelle.id));
      });
      this.calloutLayer?.appendChild(button);

      const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
      line.setAttribute('class', 'callout-line');
      line.setAttribute('stroke', color);
      const dot = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
      dot.setAttribute('class', 'callout-dot');
      dot.setAttribute('fill', color);
      dot.setAttribute('r', '3');
      this.calloutSvg?.append(line, dot);

      this.callouts.push({
        id: organelle.id,
        button,
        line,
        dot,
        localCenter,
        side: index % 2 === 0 ? 'left' : 'right',
        anchorX: 0,
        anchorY: 0,
      });
    });

    this.layoutCallouts();
    this.updateCallouts();
  }

  private layoutCallouts(): void {
    if (!this.calloutLayer || !this.calloutSvg) {
      return;
    }
    const width = Math.max(this.calloutLayer.clientWidth, 1);
    const height = Math.max(this.calloutLayer.clientHeight, 1);
    this.calloutSvg.setAttribute('viewBox', `0 0 ${width} ${height}`);
    this.calloutSvg.setAttribute('width', String(width));
    this.calloutSvg.setAttribute('height', String(height));

    const left = this.callouts.filter((callout) => callout.side === 'left');
    const right = this.callouts.filter((callout) => callout.side === 'right');
    const position = (list: Callout[], side: 'left' | 'right') => {
      list.forEach((callout, index) => {
        const fraction = list.length <= 1 ? 0.5 : 0.08 + (index / (list.length - 1)) * 0.72;
        callout.button.style.top = `${fraction * 100}%`;
        callout.button.style.left = side === 'left' ? '0.35rem' : 'calc(100% - 9.6rem)';
      });
    };
    position(left, 'left');
    position(right, 'right');

    const hostRect = this.calloutLayer.getBoundingClientRect();
    for (const callout of this.callouts) {
      const rect = callout.button.getBoundingClientRect();
      callout.anchorX =
        (callout.side === 'left' ? rect.right : rect.left) - hostRect.left;
      callout.anchorY = rect.top + rect.height / 2 - hostRect.top;
    }
  }

  private updateCallouts(): void {
    if (!this.showLabels() || !this.calloutLayer || !this.camera) {
      return;
    }
    const host = this.canvasHost.nativeElement;
    const width = Math.max(host.clientWidth, 1);
    const height = Math.max(host.clientHeight, 1);
    const selected = this.selectedId();

    for (const callout of this.callouts) {
      const object = this.meshes.get(callout.id);
      if (!object || !object.visible) {
        callout.button.classList.add('is-hidden');
        callout.line.style.display = 'none';
        callout.dot.style.display = 'none';
        continue;
      }
      object.updateWorldMatrix(true, false);
      const world = callout.localCenter.clone().applyMatrix4(object.matrixWorld);
      const projected = world.project(this.camera);
      const visible =
        projected.z > -1 &&
        projected.z < 1 &&
        projected.x > -1.2 &&
        projected.x < 1.2 &&
        projected.y > -1.2 &&
        projected.y < 1.2;

      if (!visible) {
        callout.button.classList.add('is-hidden');
        callout.line.style.display = 'none';
        callout.dot.style.display = 'none';
        continue;
      }

      const x = (projected.x * 0.5 + 0.5) * width;
      const y = (-projected.y * 0.5 + 0.5) * height;
      callout.button.classList.remove('is-hidden');
      callout.button.classList.toggle('is-active', callout.id === selected);
      callout.line.style.display = 'block';
      callout.dot.style.display = 'block';
      callout.line.setAttribute('x1', String(callout.anchorX));
      callout.line.setAttribute('y1', String(callout.anchorY));
      callout.line.setAttribute('x2', String(x));
      callout.line.setAttribute('y2', String(y));
      callout.dot.setAttribute('cx', String(x));
      callout.dot.setAttribute('cy', String(y));
    }
  }

  private createBubbles(): void {
    if (!this.scene) {
      return;
    }
    const count = 95;
    const positions = new Float32Array(count * 3);
    this.bubbleSpeeds = new Float32Array(count);

    for (let index = 0; index < count; index += 1) {
      positions[index * 3] = (Math.random() - 0.5) * 7.2;
      positions[index * 3 + 1] = (Math.random() - 0.5) * 6.4;
      positions[index * 3 + 2] = (Math.random() - 0.5) * 4.4;
      this.bubbleSpeeds[index] = 0.035 + Math.random() * 0.09;
    }
    this.bubblePositions = positions;

    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    const sprite = document.createElement('canvas');
    sprite.width = 64;
    sprite.height = 64;
    const context = sprite.getContext('2d');
    if (context) {
      const gradient = context.createRadialGradient(32, 32, 1, 32, 32, 30);
      gradient.addColorStop(0, 'rgba(255,255,255,0.95)');
      gradient.addColorStop(0.25, 'rgba(190,245,235,0.55)');
      gradient.addColorStop(1, 'rgba(150,230,220,0)');
      context.fillStyle = gradient;
      context.fillRect(0, 0, 64, 64);
    }
    const texture = new THREE.CanvasTexture(sprite);
    texture.colorSpace = THREE.SRGBColorSpace;

    this.bubbles = new THREE.Points(
      geometry,
      new THREE.PointsMaterial({
        color: new THREE.Color('#a9f5e2'),
        size: 0.085,
        map: texture,
        transparent: true,
        opacity: 0.55,
        depthWrite: false,
        blending: THREE.NormalBlending,
        sizeAttenuation: true,
      }),
    );
    this.scene.add(this.bubbles);
  }

  private animate = () => {
    const dt = Math.min(this.clock.getDelta(), 0.05);
    const elapsed = this.clock.elapsedTime;

    if (!this.visible || document.hidden || this.contextLost) {
      return;
    }

    this.updateFocus();
    this.controls?.update();

    for (const floater of this.floaters) {
      floater.object.position.y =
        floater.baseY + Math.sin(elapsed * 0.75 + floater.phase) * floater.amplitude;
      floater.object.rotation.y += floater.spin * dt;
      floater.object.rotation.z =
        Math.sin(elapsed * 0.45 + floater.phase) * floater.amplitude * 0.35;
    }

    if (this.membrane) {
      const pulse = 1 + Math.sin(elapsed * 0.55) * 0.006;
      this.membrane.scale.set(pulse, pulse, pulse);
    }

    if (this.waterLightA) {
      this.waterLightA.position.x = Math.cos(elapsed * 0.18) * 3.1;
      this.waterLightA.position.z = Math.sin(elapsed * 0.18) * 3.1;
      this.waterLightA.intensity = 5.5 + Math.sin(elapsed * 0.7) * 1.1;
    }
    if (this.waterLightB) {
      this.waterLightB.position.x = Math.cos(elapsed * 0.14 + 2.4) * 3.4;
      this.waterLightB.position.z = Math.sin(elapsed * 0.14 + 2.4) * 3.4;
    }

    this.animateBubbles(dt, elapsed);
    this.composer?.render();
    this.updateCallouts();
  };

  private updateFocus(): void {
    if (!this.controls || !this.camera) {
      return;
    }
    if (this.focusTarget && this.focusPosition) {
      this.controls.target.lerp(this.focusTarget, 0.14);
      this.camera.position.lerp(this.focusPosition, 0.12);
      if (
        this.camera.position.distanceTo(this.focusPosition) < 0.05 ||
        performance.now() > this.focusUntil
      ) {
        this.camera.position.copy(this.focusPosition);
        this.controls.target.copy(this.focusTarget);
        this.focusTarget = undefined;
        this.focusPosition = undefined;
        this.focusUntil = 0;
        this.controls.enabled = true;
        this.controls.update();
      }
    }
  }

  private focusOn(id: string): void {
    if (!this.camera || !this.controls) {
      return;
    }
    const object = this.meshes.get(id);
    if (!object) {
      return;
    }
    if (['membrane', 'cellwall', 'cytoplasm'].includes(id)) {
      this.focusTarget = new THREE.Vector3(0, 0, 0);
      this.focusPosition = this.defaultCamera.clone();
      this.focusUntil = performance.now() + 900;
      this.controls.enabled = false;
      return;
    }
    // Groups such as mitochondria/lysosomes contain several instances. Center
    // on the first visible instance instead of the group's overall center,
    // otherwise the camera lands on the nucleus in the middle of the cell.
    const focusObject =
      object instanceof THREE.Group && object.children.length > 0
        ? object.children[0]
        : object;
    focusObject.updateWorldMatrix(true, false);
    const box = new THREE.Box3().setFromObject(focusObject);
    const center = box.getCenter(new THREE.Vector3());
    const size = box.getSize(new THREE.Vector3());
    const radius = Math.max(size.x, size.y, size.z) * 0.5;
    const direction = this.camera.position.clone().sub(this.controls.target);
    if (direction.lengthSq() < 0.0001) {
      direction.set(4.2, 3.2, 6.4);
    }
    direction.normalize();
    // Keep enough context to recognize the cell after the zoom.
    const distance = Math.min(Math.max(radius * 4.2, 6.4), 7.0);
    this.focusTarget = center;
    this.focusPosition = center.clone().add(direction.multiplyScalar(distance));
    this.focusUntil = performance.now() + 900;
    this.controls.enabled = false;
  }

  private resetFocus(): void {
    this.focusTarget = undefined;
    this.focusPosition = undefined;
    this.focusUntil = 0;
    if (this.controls) {
      this.controls.enabled = true;
    }
  }

  private animateBubbles(dt: number, elapsed: number): void {
    if (!this.bubbles || !this.bubblePositions || !this.bubbleSpeeds) {
      return;
    }
    for (let index = 0; index < this.bubbleSpeeds.length; index += 1) {
      const offset = index * 3;
      this.bubblePositions[offset + 1] += this.bubbleSpeeds[index] * dt;
      this.bubblePositions[offset] += Math.sin(elapsed * 0.4 + index) * 0.0009;
      this.bubblePositions[offset + 2] += Math.cos(elapsed * 0.35 + index) * 0.0007;
      if (this.bubblePositions[offset + 1] > 3.4) {
        this.bubblePositions[offset + 1] = -3.4;
      }
    }
    const attribute = this.bubbles.geometry.getAttribute('position');
    attribute.needsUpdate = true;
  }

  private applySelection(): void {
    const selected = this.selectedId();
    const isolated = this.isolate();

    for (const [id, object] of this.meshes) {
      const visible = !isolated || id === selected || id === 'membrane' || id === 'cellwall';
      object.visible = visible;

      object.traverse((child) => {
        if (!(child instanceof THREE.Mesh)) {
          return;
        }
        const materials = Array.isArray(child.material) ? child.material : [child.material];
        for (const material of materials) {
          if (material instanceof THREE.MeshStandardMaterial || material instanceof THREE.MeshPhysicalMaterial) {
            material.emissive.set(id === selected ? material.color : '#000000');
            material.emissiveIntensity = id === selected ? 0.24 : 0;
          }
        }
      });
    }

  }

  private observe(host: HTMLDivElement): void {
    if (typeof ResizeObserver !== 'undefined') {
      this.resizeObserver = new ResizeObserver(() => this.resize(host));
      this.resizeObserver.observe(host);
    } else {
      window.addEventListener('resize', this.onWindowResize);
    }

    if (typeof IntersectionObserver !== 'undefined') {
      this.intersectionObserver = new IntersectionObserver((entries) => {
        this.visible = entries.some((entry) => entry.isIntersecting);
        this.clock.getDelta();
      });
      this.intersectionObserver.observe(host);
    }

    document.addEventListener('visibilitychange', this.onVisibilityChange);
  }

  private readonly onVisibilityChange = () => {
    this.clock.getDelta();
  };

  private readonly onWindowResize = () => {
    if (this.canvasHost) {
      this.resize(this.canvasHost.nativeElement);
    }
  };

  private lastWidth = 0;
  private lastHeight = 0;

  private resize(host: HTMLDivElement): void {
    if (!this.renderer || !this.camera) {
      return;
    }
    const width = Math.max(host.clientWidth, 1);
    const height = Math.max(host.clientHeight, 1);
    if (width === this.lastWidth && height === this.lastHeight) {
      return;
    }
    this.lastWidth = width;
    this.lastHeight = height;
    this.renderer.setSize(width, height, false);
    this.camera.aspect = width / height;
    this.camera.updateProjectionMatrix();
    this.composer?.setSize(width, height);
    this.bloomPass?.setSize(width, height);
    this.layoutCallouts();
    this.updateCallouts();
  }

  private readonly onPointerDown = (event: PointerEvent) => {
    this.pointerDown = { x: event.clientX, y: event.clientY, time: performance.now() };
    this.pointerMoved = false;
  };

  private readonly onPointerMove = (event: PointerEvent) => {
    if (!this.pointerDown) {
      return;
    }
    const dx = event.clientX - this.pointerDown.x;
    const dy = event.clientY - this.pointerDown.y;
    if (dx * dx + dy * dy > 25) {
      this.pointerMoved = true;
      if (this.focusTarget) {
        this.focusTarget = undefined;
        this.focusPosition = undefined;
        this.focusUntil = 0;
        if (this.controls) {
          this.controls.enabled = true;
        }
      }
    }
  };

  private readonly onPointerUp = (event: PointerEvent) => {
    const down = this.pointerDown;
    this.pointerDown = undefined;
    if (!down || this.pointerMoved || performance.now() - down.time > 600) {
      return;
    }
    if (!this.renderer || !this.camera || !this.cellGroup) {
      return;
    }

    const rect = this.renderer.domElement.getBoundingClientRect();
    this.pointer.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
    this.pointer.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;
    this.raycaster.setFromCamera(this.pointer, this.camera);

    const intersections = this.raycaster.intersectObjects(this.cellGroup.children, true);
    const hit = intersections.find((intersection) => {
      const id = intersection.object.userData['organelleId'] as string | undefined;
      return id !== undefined && !['membrane', 'cytoplasm', 'cellwall'].includes(id);
    });

    const id = hit?.object.userData['organelleId'] as string | undefined;
    if (id) {
      this.selectOrganelle(id);
    }
  };

  private readonly onPointerCancel = () => {
    this.pointerDown = undefined;
    this.pointerMoved = false;
  };

  private readonly onContextLost = (event: Event) => {
    event.preventDefault();
    this.contextLost = true;
    this.renderer?.setAnimationLoop(null);
    this.webglError.set(true);
  };

  private readonly onContextRestored = () => {
    this.contextLost = false;
    this.webglError.set(false);
    this.clock.getDelta();
    this.renderer?.setAnimationLoop(this.animate);
  };

  private disposeObject(object: THREE.Object3D | undefined): void {
    object?.traverse((child) => {
      if (
        !(child instanceof THREE.Mesh) &&
        !(child instanceof THREE.LineSegments) &&
        !(child instanceof THREE.Points)
      ) {
        return;
      }
      if (child instanceof THREE.Mesh || child instanceof THREE.Points) {
        child.geometry?.dispose();
        const materials = Array.isArray(child.material) ? child.material : [child.material];
        for (const material of materials) {
          if (!material) {
            continue;
          }
          for (const value of Object.values(material)) {
            if (value instanceof THREE.Texture) {
              value.dispose();
            }
          }
          material.dispose();
        }
      } else {
        child.geometry?.dispose();
        child.material?.dispose();
      }
    });
  }
}
