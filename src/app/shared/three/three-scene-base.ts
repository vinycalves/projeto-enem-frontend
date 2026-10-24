import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';

export interface ThreeSceneOptions {
  autoRotate?: boolean;
  autoRotateSpeed?: number;
  cameraPosition?: [number, number, number];
  minDistance?: number;
  maxDistance?: number;
}

/**
 * Small, explicit Three.js lifecycle. Visualizations extend this class and
 * implement build() and update(). GPU resources are released in dispose().
 */
export abstract class ThreeSceneBase {
  protected readonly scene = new THREE.Scene();
  protected readonly content = new THREE.Group();
  protected readonly camera: THREE.PerspectiveCamera;
  protected renderer?: THREE.WebGLRenderer;
  protected controls?: OrbitControls;
  protected reducedMotion = false;

  private host?: HTMLElement;
  private frameId = 0;
  private lastTime = 0;
  private running = false;
  private visible = true;
  private resizeObserver?: ResizeObserver;
  private intersectionObserver?: IntersectionObserver;
  private readonly options: Required<ThreeSceneOptions>;

  constructor(options: ThreeSceneOptions = {}) {
    this.options = {
      autoRotate: options.autoRotate ?? false,
      autoRotateSpeed: options.autoRotateSpeed ?? 0.45,
      cameraPosition: options.cameraPosition ?? [4, 3, 6],
      minDistance: options.minDistance ?? 3,
      maxDistance: options.maxDistance ?? 14,
    };
    this.camera = new THREE.PerspectiveCamera(42, 1, 0.1, 100);
    this.camera.position.set(...this.options.cameraPosition);
    this.reducedMotion =
      typeof window !== 'undefined' &&
      typeof window.matchMedia === 'function' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  }

  start(host: HTMLElement): boolean {
    this.host = host;
    try {
      this.renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    } catch {
      return false;
    }

    const renderer = this.renderer;
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    renderer.setSize(Math.max(host.clientWidth, 1), Math.max(host.clientHeight, 1), false);
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.domElement.setAttribute('aria-hidden', 'true');
    renderer.domElement.style.display = 'block';
    renderer.domElement.style.width = '100%';
    renderer.domElement.style.height = '100%';
    host.appendChild(renderer.domElement);

    this.scene.add(this.content);
    this.scene.add(new THREE.AmbientLight(0xffffff, 1.15));
    const key = new THREE.DirectionalLight(0xfff4e0, 2.2);
    key.position.set(5, 8, 6);
    this.scene.add(key);
    const fill = new THREE.DirectionalLight(0x9fe3c2, 1.1);
    fill.position.set(-6, -2, 4);
    this.scene.add(fill);

    this.controls = new OrbitControls(this.camera, renderer.domElement);
    this.controls.enableDamping = true;
    this.controls.dampingFactor = 0.08;
    this.controls.minDistance = this.options.minDistance;
    this.controls.maxDistance = this.options.maxDistance;
    this.controls.autoRotate = this.options.autoRotate;
    this.controls.autoRotateSpeed = this.options.autoRotateSpeed;
    this.controls.target.set(0, 0, 0);

    this.build();
    this.observe(host);
    this.running = true;
    this.lastTime = performance.now();
    this.frameId = requestAnimationFrame(this.frame);
    return true;
  }

  stop(): void {
    this.running = false;
    cancelAnimationFrame(this.frameId);
    this.frameId = 0;
  }

  dispose(): void {
    this.stop();
    this.resizeObserver?.disconnect();
    this.intersectionObserver?.disconnect();
    this.resizeObserver = undefined;
    this.intersectionObserver = undefined;
    if (typeof document !== 'undefined') {
      document.removeEventListener('visibilitychange', this.onVisibilityChange);
    }
    if (typeof window !== 'undefined') {
      window.removeEventListener('resize', this.onWindowResize);
    }
    this.controls?.dispose();
    this.controls = undefined;
    this.clearContent();
    this.renderer?.dispose();
    if (this.renderer?.domElement.parentElement) {
      this.renderer.domElement.remove();
    }
    this.renderer = undefined;
    this.host = undefined;
  }

  setAutoRotate(enabled: boolean): void {
    if (this.controls) {
      this.controls.autoRotate = enabled && !this.reducedMotion;
    }
  }

  protected abstract build(): void;
  protected abstract update(dt: number): void;

  protected clearContent(): void {
    for (const child of [...this.content.children]) {
      this.content.remove(child);
      this.disposeObject(child);
    }
  }

  protected rebuild(): void {
    this.clearContent();
    this.build();
  }

  protected disposeObject(object: THREE.Object3D): void {
    object.traverse((child) => {
      if (
        !(child instanceof THREE.Mesh) &&
        !(child instanceof THREE.Line) &&
        !(child instanceof THREE.Points) &&
        !(child instanceof THREE.Sprite)
      ) {
        return;
      }

      const mesh = child as THREE.Mesh;
      mesh.geometry?.dispose();
      const materials = Array.isArray(mesh.material) ? mesh.material : [mesh.material];
      for (const material of materials) {
        if (!material) {
          continue;
        }
        for (const key of [
          'map',
          'normalMap',
          'roughnessMap',
          'metalnessMap',
          'emissiveMap',
          'alphaMap',
        ] as const) {
          const texture = (material as unknown as Record<string, THREE.Texture | null>)[key];
          texture?.dispose();
        }
        material.dispose();
      }
    });
  }

  private observe(host: HTMLElement): void {
    if (typeof ResizeObserver !== 'undefined') {
      this.resizeObserver = new ResizeObserver(() => this.resize(host));
      this.resizeObserver.observe(host);
    } else if (typeof window !== 'undefined') {
      window.addEventListener('resize', this.onWindowResize);
    }

    if (typeof IntersectionObserver !== 'undefined') {
      this.intersectionObserver = new IntersectionObserver((entries) => {
        this.visible = entries.some((entry) => entry.isIntersecting);
        this.lastTime = performance.now();
      });
      this.intersectionObserver.observe(host);
    }

    if (typeof document !== 'undefined') {
      document.addEventListener('visibilitychange', this.onVisibilityChange);
    }
  }

  private readonly onVisibilityChange = () => {
    this.lastTime = performance.now();
  };

  private readonly onWindowResize = () => {
    if (this.host) {
      this.resize(this.host);
    }
  };

  private resize(host: HTMLElement): void {
    if (!this.renderer) {
      return;
    }
    const width = Math.max(host.clientWidth, 1);
    const height = Math.max(host.clientHeight, 1);
    this.renderer.setSize(width, height, false);
    this.camera.aspect = width / height;
    this.camera.updateProjectionMatrix();
  }

  private readonly frame = (now: number) => {
    if (!this.running) {
      return;
    }
    this.frameId = requestAnimationFrame(this.frame);

    if (!this.visible || document.hidden) {
      return;
    }

    const dt = Math.min((now - this.lastTime) / 1000, 0.05);
    this.lastTime = now;
    this.update(dt);
    this.controls?.update();
    if (this.renderer) {
      this.renderer.render(this.scene, this.camera);
    }
  };
}
