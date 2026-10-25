import * as THREE from 'three';
import { ThreeSceneBase } from '../../../shared/three/three-scene-base';

export type NucleicAcidKind = 'dna' | 'rna';
export type BaseHighlight = 'A' | 'CG';

export interface DnaParams {
  molecule: NucleicAcidKind;
  showBases: boolean;
  highlight: BaseHighlight;
  opening: number;
}

type DnaBase = 'A' | 'T' | 'C' | 'G';
type RnaBase = 'A' | 'U' | 'C' | 'G';
type Nucleotide = DnaBase | RnaBase;

const DNA_PAIRS: DnaBase[][] = [
  ['A', 'T'],
  ['C', 'G'],
  ['G', 'C'],
  ['T', 'A'],
  ['A', 'T'],
  ['C', 'G'],
  ['A', 'T'],
  ['T', 'A'],
  ['C', 'G'],
  ['G', 'C'],
  ['A', 'T'],
  ['C', 'G'],
  ['T', 'A'],
  ['A', 'T'],
  ['G', 'C'],
  ['C', 'G'],
];

// Arbitrary didactic sequence. It does not represent a real transcript.
const RNA_BASES: RnaBase[] = [
  'A',
  'U',
  'G',
  'C',
  'A',
  'U',
  'G',
  'G',
  'C',
  'U',
  'A',
  'C',
  'G',
  'A',
  'U',
  'C',
  'G',
  'G',
  'A',
  'U',
];

const BASE_COLORS: Record<Nucleotide, string> = {
  A: '#e06c5a',
  T: '#d9a441',
  U: '#b07cc6',
  C: '#4f86c6',
  G: '#3f9d63',
};

export class DnaScene extends ThreeSceneBase {
  private params: DnaParams = {
    molecule: 'dna',
    showBases: true,
    highlight: 'A',
    opening: 0.1,
  };
  private readonly defaultCamera = new THREE.Vector3(3.4, 1.2, 7.2);
  private lastSignature = '';

  constructor() {
    super({ cameraPosition: [3.4, 1.2, 7.2], minDistance: 4, maxDistance: 13 });
  }

  setParams(params: DnaParams): void {
    this.params = params;
    if (!this.renderer) {
      return;
    }
    const signature = JSON.stringify(params);
    if (signature === this.lastSignature) {
      return;
    }
    this.lastSignature = signature;
    this.rebuild();
  }

  resetView(): void {
    if (!this.controls) {
      return;
    }
    this.camera.position.copy(this.defaultCamera);
    this.controls.target.set(0, 0, 0);
    this.controls.update();
  }

  rotateBy(radians: number): void {
    if (!this.controls) {
      return;
    }
    const offset = this.camera.position.clone().sub(this.controls.target);
    offset.applyAxisAngle(new THREE.Vector3(0, 1, 0), radians);
    this.camera.position.copy(this.controls.target).add(offset);
    this.controls.update();
  }

  zoomBy(factor: number): void {
    if (!this.controls) {
      return;
    }
    const offset = this.camera.position.clone().sub(this.controls.target);
    const distance = THREE.MathUtils.clamp(
      offset.length() * factor,
      this.controls.minDistance,
      this.controls.maxDistance,
    );
    offset.setLength(distance);
    this.camera.position.copy(this.controls.target).add(offset);
    this.controls.update();
  }

  protected build(): void {
    this.lastSignature = JSON.stringify(this.params);
    if (this.params.molecule === 'rna') {
      this.buildRna();
    } else {
      this.buildDna();
    }
  }

  protected update(_dt: number): void {
    // Rotation is intentionally manual. OrbitControls handles user input and
    // damping; nothing in this scene changes orientation on its own.
  }

  private buildDna(): void {
    const opening = Math.min(Math.max(this.params.opening, 0), 1);
    const radius = 1.15 + opening * 0.45;
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

    const strandMaterialA = this.meshMaterial('#7fb7c9');
    const strandMaterialB = this.meshMaterial('#9fe3c2');
    this.addStrand(pointsA, strandMaterialA);
    this.addStrand(pointsB, strandMaterialB);

    const labelTextures = new Map<string, THREE.CanvasTexture>();
    const baseMaterials = new Map<string, THREE.MeshStandardMaterial>();

    if (this.params.showBases) {
      for (let index = 0; index < DNA_PAIRS.length; index += 1) {
        const pointA = pointsA[index * 2 + 1];
        const pointB = pointsB[index * 2 + 1];
        if (!pointA || !pointB) {
          continue;
        }

        const [baseA, baseB] = DNA_PAIRS[index] ?? ['A', 'T'];
        const family: BaseHighlight = baseA === 'A' || baseB === 'A' ? 'A' : 'CG';
        const highlighted = family === this.params.highlight;
        const pairMaterial = this.pairMaterial(family, highlighted);
        this.content.add(this.cylinderBetween(pointA, pointB, 0.035, pairMaterial));

        const endA = new THREE.Mesh(
          new THREE.SphereGeometry(0.09, 14, 10),
          this.baseMaterial(baseA, highlighted, baseMaterials),
        );
        endA.position.copy(pointA);
        const endB = new THREE.Mesh(
          new THREE.SphereGeometry(0.09, 14, 10),
          this.baseMaterial(baseB, highlighted, baseMaterials),
        );
        endB.position.copy(pointB);
        this.content.add(endA, endB);

        const midpoint = pointA.clone().add(pointB).multiplyScalar(0.5);
        midpoint.y += 0.14;
        const pairLabel = this.labelSprite(
          `${baseA}–${baseB}`,
          BASE_COLORS[baseA],
          0.5,
          0.25,
          highlighted ? 1 : 0.52,
          labelTextures,
        );
        pairLabel.position.copy(midpoint);
        this.content.add(pairLabel);
      }
    }

    this.addEndLabel('5′', pointsA[0], 0.28, labelTextures);
    this.addEndLabel('3′', pointsA[pointsA.length - 1], 0.28, labelTextures);
    this.addEndLabel('3′', pointsB[0], 0.28, labelTextures);
    this.addEndLabel('5′', pointsB[pointsB.length - 1], 0.28, labelTextures);
  }

  private buildRna(): void {
    const backboneMaterial = this.meshMaterial('#8fd3b0');
    const labelTextures = new Map<string, THREE.CanvasTexture>();
    const baseMaterials = new Map<string, THREE.MeshStandardMaterial>();
    const points: THREE.Vector3[] = [];
    const radius = 0.9;

    for (let index = 0; index < RNA_BASES.length; index += 1) {
      const angle = index * 0.58;
      points.push(
        new THREE.Vector3(Math.cos(angle) * radius, index * 0.27 - 2.7, Math.sin(angle) * radius),
      );
    }

    this.addStrand(points, backboneMaterial);

    if (this.params.showBases) {
      for (let index = 0; index < RNA_BASES.length; index += 1) {
        const base = RNA_BASES[index] ?? 'A';
        const point = points[index];
        if (!point) {
          continue;
        }

        const family: BaseHighlight = base === 'A' || base === 'U' ? 'A' : 'CG';
        const highlighted = family === this.params.highlight;
        const material = this.baseMaterial(base, highlighted, baseMaterials);
        const radial = new THREE.Vector3(point.x, 0, point.z).normalize();
        const basePosition = point.clone().add(radial.clone().multiplyScalar(0.34));

        this.content.add(this.cylinderBetween(point, basePosition, 0.025, material));

        const sphere = new THREE.Mesh(new THREE.SphereGeometry(0.11, 14, 10), material);
        sphere.position.copy(basePosition);
        this.content.add(sphere);

        const letter = this.labelSprite(
          base,
          BASE_COLORS[base],
          0.3,
          0.15,
          highlighted ? 1 : 0.8,
          labelTextures,
        );
        letter.position.copy(basePosition).add(radial.clone().multiplyScalar(0.2));
        letter.position.y += 0.07;
        this.content.add(letter);
      }
    }

    this.addEndLabel('5′', points[0], 0.3, labelTextures);
    this.addEndLabel('3′', points[points.length - 1], 0.3, labelTextures);
  }

  private addStrand(points: THREE.Vector3[], material: THREE.Material): void {
    if (points.length === 0) {
      return;
    }
    for (const point of points) {
      const node = new THREE.Mesh(new THREE.SphereGeometry(0.09, 12, 8), material);
      node.position.copy(point);
      this.content.add(node);
    }
    for (let index = 0; index < points.length - 1; index += 1) {
      const start = points[index];
      const end = points[index + 1];
      if (start && end) {
        this.content.add(this.cylinderBetween(start, end, 0.085, material));
      }
    }
  }

  private addEndLabel(
    text: string,
    point: THREE.Vector3 | undefined,
    offsetY: number,
    textures: Map<string, THREE.CanvasTexture>,
  ): void {
    if (!point) {
      return;
    }
    const sprite = this.labelSprite(text, '#b9d1c2', 0.3, 0.15, 0.9, textures);
    sprite.position.copy(point).add(new THREE.Vector3(0, offsetY, 0));
    this.content.add(sprite);
  }

  private meshMaterial(color: string): THREE.MeshStandardMaterial {
    return new THREE.MeshStandardMaterial({
      color: new THREE.Color(color),
      roughness: 0.38,
      metalness: 0.08,
    });
  }

  private pairMaterial(family: BaseHighlight, highlighted: boolean): THREE.MeshStandardMaterial {
    const color = family === 'A' ? '#d97757' : '#5c9f8a';
    return new THREE.MeshStandardMaterial({
      color: new THREE.Color(color),
      roughness: 0.42,
      transparent: true,
      opacity: highlighted ? 0.95 : 0.3,
      emissive: new THREE.Color(highlighted ? '#f2c27b' : '#000000'),
      emissiveIntensity: highlighted ? 0.28 : 0,
    });
  }

  private baseMaterial(
    base: Nucleotide,
    highlighted: boolean,
    cache: Map<string, THREE.MeshStandardMaterial>,
  ): THREE.MeshStandardMaterial {
    const color = BASE_COLORS[base];
    const key = `${base}-${highlighted ? 'on' : 'off'}`;
    const cached = cache.get(key);
    if (cached) {
      return cached;
    }
    const material = new THREE.MeshStandardMaterial({
      color: new THREE.Color(color),
      roughness: 0.44,
      emissive: new THREE.Color(highlighted ? color : '#000000'),
      emissiveIntensity: highlighted ? 0.3 : 0,
    });
    cache.set(key, material);
    return material;
  }

  private labelSprite(
    text: string,
    color: string,
    scaleX: number,
    scaleY: number,
    opacity: number,
    textures: Map<string, THREE.CanvasTexture>,
  ): THREE.Sprite {
    const key = `${text}|${color}`;
    let texture = textures.get(key);
    if (!texture) {
      const canvas = document.createElement('canvas');
      canvas.width = 160;
      canvas.height = 80;
      const context = canvas.getContext('2d');
      if (context) {
        context.clearRect(0, 0, canvas.width, canvas.height);
        context.font = '700 46px "Segoe UI", system-ui, sans-serif';
        context.textAlign = 'center';
        context.textBaseline = 'middle';
        context.lineJoin = 'round';
        context.lineWidth = 9;
        context.strokeStyle = 'rgba(7, 25, 22, 0.96)';
        context.strokeText(text, canvas.width / 2, canvas.height / 2 + 2);
        context.fillStyle = color;
        context.fillText(text, canvas.width / 2, canvas.height / 2 + 2);
      }
      texture = new THREE.CanvasTexture(canvas);
      texture.colorSpace = THREE.SRGBColorSpace;
      texture.minFilter = THREE.LinearFilter;
      textures.set(key, texture);
    }

    const material = new THREE.SpriteMaterial({
      map: texture,
      transparent: true,
      opacity,
      depthWrite: false,
    });
    const sprite = new THREE.Sprite(material);
    sprite.scale.set(scaleX, scaleY, 1);
    sprite.renderOrder = 12;
    return sprite;
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
