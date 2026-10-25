import * as THREE from 'three';
import { ThreeSceneBase } from '../../../shared/three/three-scene-base';
import { SolidRenderParams } from './geometry-visual';

const SURFACE_COLOR = '#6fae92';
const EDGE_COLOR = '#143e2f';

/**
 * Cena didática dos sólidos geométricos. Sem rotação automática: o modelo só
 * se move por interação do usuário (ou permanece estático com movimento reduzido).
 */
export class GeometrySolidScene extends ThreeSceneBase {
  private params?: SolidRenderParams;

  constructor() {
    super({
      autoRotate: false,
      cameraPosition: [3.6, 2.7, 5.4],
      minDistance: 3,
      maxDistance: 12,
    });
  }

  setParams(params: SolidRenderParams): void {
    if (this.params && JSON.stringify(this.params) === JSON.stringify(params)) {
      return;
    }
    this.params = params;
    if (this.renderer) {
      this.rebuild();
    }
  }

  protected build(): void {
    const params = this.params;
    if (!params) return;

    const surface = new THREE.MeshStandardMaterial({
      color: new THREE.Color(SURFACE_COLOR),
      roughness: 0.38,
      metalness: 0.06,
      transparent: true,
      opacity: 0.92,
      side: THREE.DoubleSide,
    });
    const edgeMaterial = new THREE.LineBasicMaterial({
      color: new THREE.Color(EDGE_COLOR),
      transparent: true,
      opacity: 0.72,
    });

    const geometry = this.createGeometry(params);
    const mesh = new THREE.Mesh(geometry, surface);
    mesh.add(new THREE.LineSegments(new THREE.EdgesGeometry(geometry, 18), edgeMaterial));
    this.content.add(mesh);

    if (params.shape === 'sphere') {
      this.addSphereGuides(params, edgeMaterial);
    }

    const bottom = (-params.height * params.scale) / 2;
    const grid = new THREE.GridHelper(5, 10, 0xb8ad97, 0xd6ccb8);
    const gridMaterial = grid.material as THREE.LineBasicMaterial;
    gridMaterial.transparent = true;
    gridMaterial.opacity = 0.3;
    grid.position.y = bottom - 0.05;
    this.content.add(grid);
  }

  protected update(_dt: number): void {
    // Sem animação automática. OrbitControls aplica apenas a interação do usuário.
  }

  private createGeometry(params: SolidRenderParams): THREE.BufferGeometry {
    const radius = params.radius * params.scale;
    const height = params.height * params.scale;

    if (params.shape === 'cylinder') {
      return new THREE.CylinderGeometry(radius, radius, height, 64, 1);
    }
    if (params.shape === 'cone') {
      return new THREE.ConeGeometry(radius, height, 64, 1);
    }
    if (params.shape === 'sphere') {
      return new THREE.SphereGeometry(radius, 48, 32);
    }
    return new THREE.BoxGeometry(params.width * params.scale, height, params.depth * params.scale);
  }

  private addSphereGuides(params: SolidRenderParams, material: THREE.LineBasicMaterial): void {
    const radius = params.radius * params.scale;
    const segments = 96;
    const guideMaterial = material.clone();
    guideMaterial.opacity = 0.2;

    const createLoop = (pointAt: (angle: number) => THREE.Vector3): void => {
      const points: THREE.Vector3[] = [];
      for (let index = 0; index < segments; index += 1) {
        points.push(pointAt((index / segments) * Math.PI * 2));
      }
      this.content.add(
        new THREE.LineLoop(new THREE.BufferGeometry().setFromPoints(points), guideMaterial),
      );
    };

    createLoop((angle) => new THREE.Vector3(Math.cos(angle) * radius, 0, Math.sin(angle) * radius));
    createLoop((angle) => new THREE.Vector3(Math.cos(angle) * radius, Math.sin(angle) * radius, 0));
    createLoop((angle) => new THREE.Vector3(0, Math.sin(angle) * radius, Math.cos(angle) * radius));
  }
}
