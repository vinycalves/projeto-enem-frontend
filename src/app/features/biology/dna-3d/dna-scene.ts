import * as THREE from 'three';
import { ThreeSceneBase } from '../../../shared/three/three-scene-base';

export interface DnaParams {
  rotacao: number;
  mostrarPares: boolean;
  destacarPar: 'A-T' | 'C-G';
  abrirHelice: number;
}

const PAIRS: string[] = [
  'A-T',
  'C-G',
  'G-C',
  'T-A',
  'A-T',
  'C-G',
  'A-T',
  'T-A',
  'C-G',
  'G-C',
  'A-T',
  'C-G',
  'T-A',
  'A-T',
  'G-C',
  'C-G',
];

export class DnaScene extends ThreeSceneBase {
  private params: DnaParams = {
    rotacao: 0.6,
    mostrarPares: true,
    destacarPar: 'A-T',
    abrirHelice: 0.1,
  };
  private basePairs = new THREE.Group();

  constructor() {
    super({ cameraPosition: [3.4, 1.2, 7.2], minDistance: 4, maxDistance: 13 });
  }

  setParams(params: DnaParams): void {
    this.params = params;
    if (this.renderer) {
      this.rebuild();
    }
  }

  protected build(): void {
    const open = Math.min(Math.max(this.params.abrirHelice, 0), 1);
    const radius = 1.15 + open * 0.45;
    const pointsA: THREE.Vector3[] = [];
    const pointsB: THREE.Vector3[] = [];

    for (let index = 0; index < 42; index += 1) {
      const angle = index * 0.42;
      const y = index * 0.16 - 3.25;
      pointsA.push(new THREE.Vector3(Math.cos(angle) * radius, y, Math.sin(angle) * radius));
      pointsB.push(
        new THREE.Vector3(
          Math.cos(angle + Math.PI) * radius,
          y,
          Math.sin(angle + Math.PI) * radius,
        ),
      );
    }

    const strandMaterialA = new THREE.MeshStandardMaterial({
      color: new THREE.Color('#7fb7c9'),
      roughness: 0.38,
      metalness: 0.08,
    });
    const strandMaterialB = new THREE.MeshStandardMaterial({
      color: new THREE.Color('#9fe3c2'),
      roughness: 0.38,
      metalness: 0.08,
    });

    this.addStrand(pointsA, strandMaterialA);
    this.addStrand(pointsB, strandMaterialB);

    this.basePairs = new THREE.Group();
    for (let index = 0; index < PAIRS.length; index += 1) {
      const pointA = pointsA[index * 2 + 1];
      const pointB = pointsB[index * 2 + 1];
      if (!pointA || !pointB) {
        continue;
      }
      const pair = PAIRS[index] ?? 'A-T';
      const pairType = pair.includes('A') ? 'A-T' : 'C-G';
      const highlighted = pairType === this.params.destacarPar;
      const pairMaterial = new THREE.MeshStandardMaterial({
        color: new THREE.Color(pairType === 'A-T' ? '#d97757' : '#5c9f8a'),
        roughness: 0.42,
        transparent: true,
        opacity: this.params.mostrarPares ? (highlighted ? 1 : 0.34) : 0,
        emissive: new THREE.Color(highlighted ? '#f2c27b' : '#000000'),
        emissiveIntensity: highlighted ? 0.28 : 0,
      });
      const rung = this.cylinderBetween(pointA, pointB, 0.035, pairMaterial);
      this.basePairs.add(rung);

      const endA = new THREE.Mesh(
        new THREE.SphereGeometry(0.075, 12, 8),
        new THREE.MeshStandardMaterial({
          color: new THREE.Color(pair.startsWith('A') ? '#d95f4a' : '#3f6f8f'),
          roughness: 0.5,
        }),
      );
      endA.position.copy(pointA);
      const endB = new THREE.Mesh(
        new THREE.SphereGeometry(0.075, 12, 8),
        new THREE.MeshStandardMaterial({
          color: new THREE.Color(pair.endsWith('T') ? '#d9a441' : '#2f7d4f'),
          roughness: 0.5,
        }),
      );
      endB.position.copy(pointB);
      this.basePairs.add(endA, endB);
    }

    this.content.add(this.basePairs);
  }

  protected update(dt: number): void {
    if (!this.reducedMotion) {
      this.content.rotation.y += this.params.rotacao * dt;
    }
  }

  private addStrand(points: THREE.Vector3[], material: THREE.Material): void {
    for (const point of points) {
      const node = new THREE.Mesh(new THREE.SphereGeometry(0.09, 12, 8), material);
      node.position.copy(point);
      this.content.add(node);
    }
    for (let index = 0; index < points.length - 1; index += 1) {
      this.content.add(this.cylinderBetween(points[index], points[index + 1], 0.085, material));
    }
  }

  private cylinderBetween(
    start: THREE.Vector3,
    end: THREE.Vector3,
    radius: number,
    material: THREE.Material,
  ): THREE.Mesh {
    const direction = new THREE.Vector3().subVectors(end, start);
    const length = direction.length();
    const geometry = new THREE.CylinderGeometry(radius, radius, length, 8);
    const mesh = new THREE.Mesh(geometry, material);
    mesh.position.copy(start).add(end).multiplyScalar(0.5);
    mesh.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), direction.normalize());
    return mesh;
  }
}
