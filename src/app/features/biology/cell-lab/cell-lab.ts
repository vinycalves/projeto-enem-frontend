import {
  AfterViewInit,
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  OnDestroy,
  ViewChild,
  computed,
  signal,
} from '@angular/core';
import { RouterLink } from '@angular/router';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import {
  CellKind,
  Organelle,
  organelleById,
  organellesFor,
} from '../../../core/biology-data';

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

  protected readonly kind = signal<CellKind>('animal');
  protected readonly selectedId = signal('nucleus');
  protected readonly autoRotate = signal(true);
  protected readonly isolate = signal(false);
  protected readonly webglError = signal(false);

  protected readonly organelles = computed(() => organellesFor(this.kind()));
  protected readonly selected = computed<Organelle | undefined>(() => {
    return organelleById(this.selectedId()) ?? this.organelles()[0];
  });

  private renderer?: THREE.WebGLRenderer;
  private scene?: THREE.Scene;
  private camera?: THREE.PerspectiveCamera;
  private controls?: OrbitControls;
  private cellGroup?: THREE.Group;
  private readonly meshes = new Map<string, THREE.Object3D>();
  private readonly raycaster = new THREE.Raycaster();
  private readonly pointer = new THREE.Vector2();
  private animationId = 0;
  private resizeObserver?: ResizeObserver;

  ngAfterViewInit(): void {
    this.initScene();
  }

  ngOnDestroy(): void {
    cancelAnimationFrame(this.animationId);
    this.resizeObserver?.disconnect();
    this.resizeObserver = undefined;
    window.removeEventListener('resize', this.onWindowResize);
    this.controls?.dispose();
    this.disposeObject(this.cellGroup);
    this.renderer?.dispose();
    const canvas = this.renderer?.domElement;
    if (canvas?.parentElement) {
      canvas.removeEventListener('pointerdown', this.onPointerDown);
      canvas.remove();
    }
  }

  protected setCellKind(kind: CellKind): void {
    if (this.kind() === kind) {
      return;
    }
    this.kind.set(kind);
    this.selectedId.set('nucleus');
    this.buildCell();
    this.applySelection();
  }

  protected selectOrganelle(id: string): void {
    this.selectedId.set(id);
    this.applySelection();
  }

  protected toggleAutoRotate(): void {
    const next = !this.autoRotate();
    this.autoRotate.set(next);
    if (this.controls) {
      this.controls.autoRotate = next;
    }
  }

  protected toggleIsolate(): void {
    this.isolate.update((value) => !value);
    this.applySelection();
  }

  protected resetView(): void {
    if (!this.camera || !this.controls) {
      return;
    }
    this.camera.position.set(4.2, 3.2, 6.4);
    this.controls.target.set(0, 0, 0);
    this.controls.update();
  }

  private initScene(): void {
    const host = this.canvasHost.nativeElement;
    const canvas = document.createElement('canvas');

    try {
      this.renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
    } catch {
      this.webglError.set(true);
      return;
    }

    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.renderer.setSize(Math.max(host.clientWidth, 320), Math.max(host.clientHeight, 420), false);
    this.renderer.outputColorSpace = THREE.SRGBColorSpace;
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    canvas.setAttribute('aria-hidden', 'true');
    canvas.style.display = 'block';
    canvas.style.width = '100%';
    canvas.style.height = '100%';
    canvas.addEventListener('pointerdown', this.onPointerDown);
    host.appendChild(canvas);

    this.scene = new THREE.Scene();
    this.camera = new THREE.PerspectiveCamera(
      42,
      Math.max(host.clientWidth, 1) / Math.max(host.clientHeight, 1),
      0.1,
      100,
    );
    this.camera.position.set(4.2, 3.2, 6.4);

    this.controls = new OrbitControls(this.camera, canvas);
    this.controls.enableDamping = true;
    this.controls.dampingFactor = 0.08;
    this.controls.minDistance = 3.4;
    this.controls.maxDistance = 11;
    this.controls.autoRotate = this.autoRotate();
    this.controls.autoRotateSpeed = 0.55;
    this.controls.target.set(0, 0, 0);

    this.scene.add(new THREE.AmbientLight(0xffffff, 1.15));
    const keyLight = new THREE.DirectionalLight(0xfff4e0, 2.4);
    keyLight.position.set(5, 8, 6);
    this.scene.add(keyLight);
    const fillLight = new THREE.DirectionalLight(0x9fe3c2, 1.1);
    fillLight.position.set(-6, -2, 4);
    this.scene.add(fillLight);
    const rimLight = new THREE.PointLight(0x7fb7c9, 18, 20);
    rimLight.position.set(0, 2, -6);
    this.scene.add(rimLight);

    this.buildCell();
    this.observeResize(host);
    this.animate();
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
      } = {},
    ) =>
      new THREE.MeshStandardMaterial({
        color: new THREE.Color(color),
        transparent: options.transparent ?? false,
        opacity: options.opacity ?? 1,
        roughness: options.roughness ?? 0.5,
        metalness: options.metalness ?? 0.08,
        depthWrite: options.depthWrite ?? true,
        side: THREE.DoubleSide,
      });

    const register = (id: string, object: THREE.Object3D) => {
      object.traverse((child) => {
        child.userData['organelleId'] = id;
      });
      this.meshes.set(id, object);
      group.add(object);
    };

    if (this.kind() === 'animal') {
      const membrane = new THREE.Group();
      membrane.add(
        new THREE.Mesh(
          new THREE.SphereGeometry(2.3, 48, 32),
          standard('#9cc9b7', {
            transparent: true,
            opacity: 0.16,
            roughness: 0.25,
            depthWrite: false,
          }),
        ),
      );
      membrane.add(
        new THREE.Mesh(
          new THREE.SphereGeometry(2.31, 24, 16),
          new THREE.MeshBasicMaterial({
            color: new THREE.Color('#9cc9b7'),
            wireframe: true,
            transparent: true,
            opacity: 0.08,
          }),
        ),
      );
      register('membrane', membrane);

      const cytoplasm = new THREE.Mesh(
        new THREE.SphereGeometry(2.16, 40, 28),
        standard('#d8efe4', {
          transparent: true,
          opacity: 0.07,
          depthWrite: false,
          roughness: 0.8,
        }),
      );
      register('cytoplasm', cytoplasm);
    } else {
      const wall = new THREE.Group();
      wall.add(
        new THREE.Mesh(
          new THREE.BoxGeometry(4.5, 3.6, 3.0),
          standard('#8a6a2f', {
            transparent: true,
            opacity: 0.09,
            roughness: 0.8,
            depthWrite: false,
          }),
        ),
      );
      const edges = new THREE.LineSegments(
        new THREE.EdgesGeometry(new THREE.BoxGeometry(4.5, 3.6, 3.0)),
        new THREE.LineBasicMaterial({
          color: new THREE.Color('#8a6a2f'),
          transparent: true,
          opacity: 0.55,
        }),
      );
      wall.add(edges);
      register('cellwall', wall);

      const membrane = new THREE.Mesh(
        new THREE.BoxGeometry(4.28, 3.38, 2.78),
        standard('#9cc9b7', {
          transparent: true,
          opacity: 0.16,
          roughness: 0.3,
          depthWrite: false,
        }),
      );
      register('membrane', membrane);

      const vacuole = new THREE.Mesh(
        new THREE.SphereGeometry(1.45, 40, 28),
        standard('#7fb7c9', {
          transparent: true,
          opacity: 0.24,
          roughness: 0.2,
          depthWrite: false,
        }),
      );
      vacuole.scale.set(1.05, 0.86, 0.78);
      vacuole.position.set(0.35, 0.05, 0);
      register('vacuole', vacuole);
    }

    const nucleusPosition =
      this.kind() === 'animal'
        ? new THREE.Vector3(-0.45, 0.35, 0.1)
        : new THREE.Vector3(-1.25, 0.78, 0.25);
    const nucleus = new THREE.Mesh(
      new THREE.SphereGeometry(this.kind() === 'animal' ? 0.76 : 0.58, 32, 24),
      standard('#6b4f8a', { roughness: 0.38, metalness: 0.04 }),
    );
    nucleus.position.copy(nucleusPosition);
    register('nucleus', nucleus);

    const nucleolus = new THREE.Mesh(
      new THREE.SphereGeometry(this.kind() === 'animal' ? 0.24 : 0.18, 20, 16),
      standard('#8f6caf', { roughness: 0.45 }),
    );
    nucleolus.position.copy(nucleusPosition).add(new THREE.Vector3(0.2, 0.08, 0.1));
    register('nucleolus', nucleolus);

    const mitochondria = new THREE.Group();
    const mitochondrialPositions =
      this.kind() === 'animal'
        ? [
            new THREE.Vector3(1.15, 0.95, 0.45),
            new THREE.Vector3(1.2, -0.65, -0.5),
            new THREE.Vector3(-1.2, -0.95, 0.4),
          ]
        : [
            new THREE.Vector3(1.35, -0.8, 0.5),
            new THREE.Vector3(-1.45, -0.55, -0.35),
            new THREE.Vector3(0.9, 1.1, -0.45),
          ];
    for (const [index, position] of mitochondrialPositions.entries()) {
      const mitochondrion = new THREE.Group();
      const body = new THREE.Mesh(
        new THREE.CapsuleGeometry(0.14, 0.48, 8, 16),
        standard('#c96f4a', { roughness: 0.4 }),
      );
      body.rotation.z = index % 2 === 0 ? 0.7 : -0.4;
      body.rotation.x = index * 0.5;
      mitochondrion.add(body);
      for (let ring = 0; ring < 3; ring += 1) {
        const ridge = new THREE.Mesh(
          new THREE.TorusGeometry(0.155, 0.018, 6, 16),
          standard('#8f3f2a', { roughness: 0.5 }),
        );
        ridge.position.y = -0.2 + ring * 0.2;
        ridge.rotation.x = Math.PI / 2;
        mitochondrion.add(ridge);
      }
      mitochondrion.position.copy(position);
      mitochondria.add(mitochondrion);
    }
    register('mitochondrion', mitochondria);

    const ribosomes = new THREE.Group();
    for (let index = 0; index < 26; index += 1) {
      const angle = index * 2.399;
      const radius = 1.2 + (index % 5) * 0.16;
      const height = Math.sin(index * 1.7) * (this.kind() === 'animal' ? 1.25 : 1.0);
      const ribosome = new THREE.Mesh(
        new THREE.SphereGeometry(0.043, 8, 6),
        standard('#d9a441', { roughness: 0.6 }),
      );
      ribosome.position.set(
        Math.cos(angle) * radius * (this.kind() === 'animal' ? 1 : 1.15),
        height,
        Math.sin(angle) * radius * 0.75,
      );
      ribosomes.add(ribosome);
    }
    register('ribosome', ribosomes);

    const rer = new THREE.Group();
    for (let index = 0; index < 3; index += 1) {
      const fold = new THREE.Mesh(
        new THREE.TorusGeometry(
          this.kind() === 'animal' ? 0.95 : 0.72,
          0.06,
          8,
          36,
          Math.PI * 1.15,
        ),
        standard('#b58a4a', { roughness: 0.55 }),
      );
      fold.position.copy(nucleusPosition);
      fold.position.y += (index - 1) * 0.18;
      fold.rotation.set(0.5 + index * 0.35, 0.3, index * 0.9);
      rer.add(fold);
    }
    register('rer', rer);

    const golgi = new THREE.Group();
    const golgiPosition =
      this.kind() === 'animal'
        ? new THREE.Vector3(1.2, -0.75, 0.4)
        : new THREE.Vector3(1.45, 0.55, 0.55);
    for (let index = 0; index < 4; index += 1) {
      const cisterna = new THREE.Mesh(
        new THREE.BoxGeometry(0.62 - index * 0.05, 0.06, 0.34),
        standard('#d9a441', { roughness: 0.42 }),
      );
      cisterna.position.copy(golgiPosition);
      cisterna.position.y += index * 0.11;
      cisterna.rotation.z = index * 0.05;
      cisterna.rotation.y = 0.35;
      golgi.add(cisterna);
    }
    register('golgi', golgi);

    if (this.kind() === 'animal') {
      const lysosomes = new THREE.Group();
      const lysosomePositions = [
        new THREE.Vector3(-1.25, -0.7, -0.45),
        new THREE.Vector3(0.55, -1.2, 0.55),
        new THREE.Vector3(0.35, 1.25, -0.65),
        new THREE.Vector3(-1.4, 0.8, 0.55),
      ];
      for (const position of lysosomePositions) {
        const lysosome = new THREE.Mesh(
          new THREE.SphereGeometry(0.13, 16, 12),
          standard('#b55d3f', { roughness: 0.5 }),
        );
        lysosome.position.copy(position);
        lysosomes.add(lysosome);
      }
      register('lysosome', lysosomes);

      const centrosome = new THREE.Group();
      for (const rotation of [0, Math.PI / 2]) {
        const centriole = new THREE.Mesh(
          new THREE.CylinderGeometry(0.07, 0.07, 0.48, 12),
          standard('#3f6f8f', { roughness: 0.35, metalness: 0.2 }),
        );
        centriole.rotation.z = rotation;
        centrosome.add(centriole);
      }
      centrosome.position.set(0.95, 0.95, -0.55);
      register('centrosome', centrosome);
    }

    if (this.kind() === 'vegetal') {
      const chloroplasts = new THREE.Group();
      const positions = [
        new THREE.Vector3(1.45, 0.9, 0.35),
        new THREE.Vector3(1.5, -0.5, -0.45),
        new THREE.Vector3(-1.6, 0.35, 0.55),
        new THREE.Vector3(-1.5, -0.8, -0.3),
        new THREE.Vector3(0.35, 1.35, 0.3),
        new THREE.Vector3(0.5, -1.25, -0.55),
      ];
      for (const position of positions) {
        const chloroplast = new THREE.Group();
        const body = new THREE.Mesh(
          new THREE.SphereGeometry(0.32, 20, 14),
          standard('#2f7d4f', { roughness: 0.5 }),
        );
        body.scale.set(1.35, 0.68, 0.9);
        chloroplast.add(body);
        const granum = new THREE.Mesh(
          new THREE.TorusGeometry(0.13, 0.025, 6, 18),
          standard('#1f5c3a', { roughness: 0.6 }),
        );
        granum.rotation.x = Math.PI / 2;
        chloroplast.add(granum);
        chloroplast.position.copy(position);
        chloroplast.rotation.set(position.x, position.y, position.z);
        chloroplasts.add(chloroplast);
      }
      register('chloroplast', chloroplasts);
    }

    this.applySelection();
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
          if (material instanceof THREE.MeshStandardMaterial) {
            material.emissive.set(id === selected ? material.color : '#000000');
            material.emissiveIntensity = id === selected ? 0.22 : 0;
          }
        }
      });
    }
  }

  private observeResize(host: HTMLDivElement): void {
    if (typeof ResizeObserver !== 'undefined') {
      this.resizeObserver = new ResizeObserver(() => this.resize(host));
      this.resizeObserver.observe(host);
    } else {
      window.addEventListener('resize', this.onWindowResize);
    }
  }

  private readonly onWindowResize = () => {
    if (this.canvasHost) {
      this.resize(this.canvasHost.nativeElement);
    }
  };

  private resize(host: HTMLDivElement): void {
    if (!this.renderer || !this.camera) {
      return;
    }
    const width = Math.max(host.clientWidth, 1);
    const height = Math.max(host.clientHeight, 1);
    this.renderer.setSize(width, height, false);
    this.camera.aspect = width / height;
    this.camera.updateProjectionMatrix();
  }

  private readonly onPointerDown = (event: PointerEvent) => {
    if (!this.renderer || !this.camera || !this.cellGroup) {
      return;
    }
    const rect = this.renderer.domElement.getBoundingClientRect();
    this.pointer.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
    this.pointer.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;
    this.raycaster.setFromCamera(this.pointer, this.camera);

    const intersections = this.raycaster.intersectObjects(this.cellGroup.children, true);
    const hit =
      intersections.find((intersection) => {
        const id = intersection.object.userData['organelleId'] as string | undefined;
        return id !== undefined && !['membrane', 'cytoplasm', 'cellwall'].includes(id);
      }) ?? intersections[0];

    const id = hit?.object.userData['organelleId'] as string | undefined;
    if (id) {
      this.selectOrganelle(id);
    }
  };

  private animate = () => {
    this.animationId = requestAnimationFrame(this.animate);
    this.controls?.update();
    if (this.renderer && this.scene && this.camera) {
      this.renderer.render(this.scene, this.camera);
    }
  };

  private disposeObject(object: THREE.Object3D | undefined): void {
    object?.traverse((child) => {
      if (!(child instanceof THREE.Mesh) && !(child instanceof THREE.LineSegments)) {
        return;
      }
      child.geometry?.dispose();
      const materials = Array.isArray(child.material) ? child.material : [child.material];
      for (const material of materials) {
        material.dispose();
      }
    });
  }
}
