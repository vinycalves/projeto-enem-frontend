import { CellKind } from '../../../core/biology-data';

export interface DiagramShape {
  kind: 'path' | 'circle' | 'ellipse' | 'rect' | 'line';
  d?: string;
  cx?: number;
  cy?: number;
  r?: number;
  rx?: number;
  ry?: number;
  x?: number;
  y?: number;
  width?: number;
  height?: number;
  x1?: number;
  y1?: number;
  x2?: number;
  y2?: number;
  fill?: string;
  stroke?: string;
  strokeWidth?: number;
  opacity?: number;
  transform?: string;
  strokeDasharray?: string;
  strokeLinecap?: 'butt' | 'round' | 'square';
  className?: string;
}

export interface DiagramMarker {
  x: number;
  y: number;
  labelX: number;
  labelY: number;
  labelAnchor?: 'start' | 'middle' | 'end';
}

export interface DiagramItemLayout {
  marker: DiagramMarker;
  shapes: DiagramShape[];
}

export interface CellDiagramLayout {
  viewBox: string;
  order: string[];
  items: Record<string, DiagramItemLayout>;
}

export const ORGANELLE_COLOR_TOKEN = 'organelle';
const ORGANELLE = ORGANELLE_COLOR_TOKEN;

const ANIMAL_OUTLINE =
  'M 400 42 C 545 34 700 112 724 252 C 748 392 640 502 470 518 C 300 534 128 474 96 340 C 64 206 158 66 310 46 C 340 42 370 42 400 42 Z';

function mitochondrion(cx: number, cy: number, angle: number): DiagramShape[] {
  const transform = `rotate(${angle} ${cx} ${cy})`;
  return [
    {
      kind: 'ellipse',
      cx,
      cy,
      rx: 42,
      ry: 16,
      fill: ORGANELLE,
      stroke: '#0b1f1a',
      strokeWidth: 2,
      transform,
    },
    {
      kind: 'path',
      d: `M ${cx - 24} ${cy} Q ${cx - 12} ${cy - 10} ${cx} ${cy} T ${cx + 24} ${cy}`,
      fill: 'none',
      stroke: '#f2c27b',
      strokeWidth: 2.4,
      strokeLinecap: 'round',
      transform,
    },
  ];
}

function chloroplast(cx: number, cy: number, angle: number): DiagramShape[] {
  const transform = `rotate(${angle} ${cx} ${cy})`;
  return [
    {
      kind: 'ellipse',
      cx,
      cy,
      rx: 36,
      ry: 16,
      fill: ORGANELLE,
      stroke: '#0b1f1a',
      strokeWidth: 1.8,
      transform,
    },
    ...[-10, 0, 10].map<DiagramShape>((dx) => ({
      kind: 'line',
      x1: cx + dx,
      y1: cy - 7,
      x2: cx + dx,
      y2: cy + 7,
      stroke: '#a3e635',
      strokeWidth: 2,
      strokeLinecap: 'round',
      transform,
    })),
  ];
}

function ribosomes(points: Array<[number, number]>): DiagramShape[] {
  return points.map<DiagramShape>(([cx, cy]) => ({
    kind: 'circle',
    cx,
    cy,
    r: 3.2,
    fill: ORGANELLE,
    stroke: '#0b1f1a',
    strokeWidth: 0.7,
  }));
}

function golgi(cx: number, cy: number): DiagramShape[] {
  return [0, 1, 2, 3].map<DiagramShape>((index) => ({
    kind: 'path',
    d: `M ${cx - 40} ${cy + index * 12} Q ${cx} ${cy - 12 + index * 12} ${cx + 40} ${cy + index * 12}`,
    fill: 'none',
    stroke: ORGANELLE,
    strokeWidth: 7 - index * 0.35,
    strokeLinecap: 'round',
  }));
}

function lysosomes(points: Array<[number, number]>): DiagramShape[] {
  return points.flatMap<DiagramShape>(([cx, cy]) => [
    {
      kind: 'circle',
      cx,
      cy,
      r: 10,
      fill: ORGANELLE,
      stroke: '#0b1f1a',
      strokeWidth: 1.5,
    },
    {
      kind: 'circle',
      cx: cx + 2,
      cy: cy - 2,
      r: 3,
      fill: '#f8d7c8',
      opacity: 0.8,
    },
  ]);
}

function peroxisomes(points: Array<[number, number]>): DiagramShape[] {
  return points.flatMap<DiagramShape>(([cx, cy]) => [
    {
      kind: 'circle',
      cx,
      cy,
      r: 8,
      fill: ORGANELLE,
      stroke: '#0b1f1a',
      strokeWidth: 1.2,
    },
    {
      kind: 'circle',
      cx,
      cy,
      r: 3,
      fill: '#e9dcff',
      opacity: 0.85,
    },
  ]);
}

const ANIMAL_LAYOUT: CellDiagramLayout = {
  viewBox: '0 0 800 560',
  order: [
    'membrane',
    'cytoplasm',
    'rer',
    'nucleus',
    'nucleolus',
    'mitochondrion',
    'golgi',
    'lysosome',
    'centrosome',
    'ribosome',
  ],
  items: {
    membrane: {
      marker: { x: 370, y: 34, labelX: 370, labelY: 18, labelAnchor: 'middle' },
      shapes: [
        {
          kind: 'path',
          d: ANIMAL_OUTLINE,
          fill: 'none',
          stroke: ORGANELLE,
          strokeWidth: 6,
          className: 'structure-stroke',
        },
        {
          kind: 'path',
          d: ANIMAL_OUTLINE,
          fill: 'none',
          stroke: '#7fb7c9',
          strokeWidth: 1.5,
          opacity: 0.8,
          strokeDasharray: '9 7',
        },
      ],
    },
    cytoplasm: {
      marker: { x: 690, y: 470, labelX: 690, labelY: 496, labelAnchor: 'middle' },
      shapes: [
        {
          kind: 'path',
          d: ANIMAL_OUTLINE,
          fill: ORGANELLE,
          opacity: 0.08,
        },
      ],
    },
    rer: {
      marker: { x: 225, y: 290, labelX: 200, labelY: 270, labelAnchor: 'end' },
      shapes: [
        {
          kind: 'path',
          d: 'M 245 205 C 200 225 198 300 245 330',
          fill: 'none',
          stroke: ORGANELLE,
          strokeWidth: 6,
          strokeLinecap: 'round',
        },
        {
          kind: 'path',
          d: 'M 266 175 C 208 198 205 345 270 372',
          fill: 'none',
          stroke: ORGANELLE,
          strokeWidth: 5,
          strokeLinecap: 'round',
        },
        {
          kind: 'path',
          d: 'M 262 350 C 302 398 356 405 398 382',
          fill: 'none',
          stroke: ORGANELLE,
          strokeWidth: 5,
          strokeLinecap: 'round',
        },
        {
          kind: 'path',
          d: 'M 248 180 C 300 150 400 165 425 215',
          fill: 'none',
          stroke: ORGANELLE,
          strokeWidth: 4,
          strokeLinecap: 'round',
        },
      ],
    },
    nucleus: {
      marker: { x: 320, y: 285, labelX: 350, labelY: 382, labelAnchor: 'middle' },
      shapes: [
        {
          kind: 'circle',
          cx: 350,
          cy: 265,
          r: 92,
          fill: ORGANELLE,
          stroke: '#0b1f1a',
          strokeWidth: 2.5,
          opacity: 0.9,
        },
        {
          kind: 'circle',
          cx: 350,
          cy: 265,
          r: 76,
          fill: 'none',
          stroke: '#f1e6ff',
          strokeWidth: 1.5,
          opacity: 0.25,
          strokeDasharray: '5 7',
        },
      ],
    },
    nucleolus: {
      marker: { x: 382, y: 243, labelX: 420, labelY: 243, labelAnchor: 'start' },
      shapes: [
        {
          kind: 'circle',
          cx: 382,
          cy: 243,
          r: 29,
          fill: ORGANELLE,
          stroke: '#0b1f1a',
          strokeWidth: 1.8,
        },
      ],
    },
    mitochondrion: {
      marker: { x: 550, y: 145, labelX: 550, labelY: 112, labelAnchor: 'middle' },
      shapes: [
        ...mitochondrion(550, 145, 18),
        ...mitochondrion(600, 400, -24),
        ...mitochondrion(170, 400, 65),
      ],
    },
    golgi: {
      marker: { x: 575, y: 300, labelX: 620, labelY: 300, labelAnchor: 'start' },
      shapes: [...golgi(575, 285)],
    },
    lysosome: {
      marker: { x: 205, y: 175, labelX: 185, labelY: 145, labelAnchor: 'middle' },
      shapes: [
        ...lysosomes([
          [205, 175],
          [210, 430],
          [500, 455],
        ]),
      ],
    },
    centrosome: {
      marker: { x: 460, y: 155, labelX: 460, labelY: 118, labelAnchor: 'middle' },
      shapes: [
        {
          kind: 'rect',
          x: 438,
          y: 148,
          width: 44,
          height: 9,
          rx: 4.5,
          fill: ORGANELLE,
          transform: 'rotate(18 460 155)',
        },
        {
          kind: 'rect',
          x: 455,
          y: 131,
          width: 9,
          height: 44,
          rx: 4.5,
          fill: ORGANELLE,
          transform: 'rotate(18 460 155)',
        },
      ],
    },
    ribosome: {
      marker: { x: 660, y: 280, labelX: 660, labelY: 258, labelAnchor: 'middle' },
      shapes: [
        ...ribosomes([
          [640, 220],
          [660, 260],
          [620, 380],
          [590, 440],
          [540, 480],
          [470, 500],
          [420, 135],
          [385, 120],
          [300, 120],
          [260, 155],
          [145, 210],
          [130, 300],
          [155, 360],
          [500, 220],
          [520, 250],
          [430, 330],
          [460, 370],
          [300, 460],
          [240, 500],
          [690, 330],
          [110, 180],
          [120, 430],
          [680, 420],
          [630, 170],
        ]),
      ],
    },
  },
};

const PLANT_WALL =
  'M 70 36 H 730 Q 766 36 766 72 V 488 Q 766 524 730 524 H 70 Q 34 524 34 488 V 72 Q 34 36 70 36 Z';
const PLANT_MEMBRANE =
  'M 82 56 H 718 Q 738 56 738 76 V 484 Q 738 504 718 504 H 82 Q 62 504 62 484 V 76 Q 62 56 82 56 Z';
const PLANT_CYTOPLASM =
  'M 88 62 H 712 Q 732 62 732 82 V 478 Q 732 498 712 498 H 88 Q 68 498 68 478 V 82 Q 68 62 88 62 Z';

const PLANT_LAYOUT: CellDiagramLayout = {
  viewBox: '0 0 800 560',
  order: [
    'cellwall',
    'membrane',
    'cytoplasm',
    'vacuole',
    'chloroplast',
    'mitochondrion',
    'rer',
    'nucleus',
    'nucleolus',
    'golgi',
    'peroxisome',
    'ribosome',
  ],
  items: {
    cellwall: {
      marker: { x: 705, y: 40, labelX: 690, labelY: 18, labelAnchor: 'end' },
      shapes: [
        {
          kind: 'path',
          d: PLANT_WALL,
          fill: ORGANELLE,
          opacity: 0.14,
          stroke: ORGANELLE,
          strokeWidth: 11,
          className: 'structure-stroke',
        },
        {
          kind: 'path',
          d: 'M 52 92 C 100 70 140 100 180 76 M 610 480 C 660 456 700 480 748 458',
          fill: 'none',
          stroke: '#d7c49b',
          strokeWidth: 2,
          opacity: 0.5,
          strokeLinecap: 'round',
        },
      ],
    },
    membrane: {
      marker: { x: 710, y: 82, labelX: 690, labelY: 104, labelAnchor: 'end' },
      shapes: [
        {
          kind: 'path',
          d: PLANT_MEMBRANE,
          fill: 'none',
          stroke: ORGANELLE,
          strokeWidth: 4,
          className: 'structure-stroke',
        },
        {
          kind: 'path',
          d: 'M 76 70 Q 62 80 76 94 M 724 70 Q 738 80 724 94',
          fill: 'none',
          stroke: ORGANELLE,
          strokeWidth: 2,
          opacity: 0.7,
        },
      ],
    },
    cytoplasm: {
      marker: { x: 112, y: 490, labelX: 112, labelY: 518, labelAnchor: 'start' },
      shapes: [
        {
          kind: 'path',
          d: PLANT_CYTOPLASM,
          fill: ORGANELLE,
          opacity: 0.06,
        },
      ],
    },
    vacuole: {
      marker: { x: 560, y: 260, labelX: 560, labelY: 300, labelAnchor: 'middle' },
      shapes: [
        {
          kind: 'rect',
          x: 282,
          y: 108,
          width: 384,
          height: 330,
          rx: 100,
          fill: ORGANELLE,
          stroke: '#0b1f1a',
          strokeWidth: 2,
          opacity: 0.26,
        },
        {
          kind: 'rect',
          x: 300,
          y: 126,
          width: 348,
          height: 294,
          rx: 88,
          fill: 'none',
          stroke: '#b7e3e8',
          strokeWidth: 1.5,
          opacity: 0.35,
          strokeDasharray: '6 8',
        },
      ],
    },
    chloroplast: {
      marker: { x: 390, y: 470, labelX: 390, labelY: 502, labelAnchor: 'middle' },
      shapes: [
        ...chloroplast(145, 145, 20),
        ...chloroplast(300, 85, -8),
        ...chloroplast(560, 86, 12),
        ...chloroplast(675, 165, 68),
        ...chloroplast(145, 425, -18),
        ...chloroplast(390, 470, 4),
        ...chloroplast(650, 430, 45),
      ],
    },
    mitochondrion: {
      marker: { x: 120, y: 380, labelX: 120, labelY: 350, labelAnchor: 'middle' },
      shapes: [
        ...mitochondrion(120, 380, 75),
        ...mitochondrion(560, 468, -18),
        ...mitochondrion(680, 290, 88),
      ],
    },
    rer: {
      marker: { x: 280, y: 230, labelX: 292, labelY: 205, labelAnchor: 'start' },
      shapes: [
        {
          kind: 'path',
          d: 'M 262 218 C 300 232 305 330 268 350',
          fill: 'none',
          stroke: ORGANELLE,
          strokeWidth: 5,
          strokeLinecap: 'round',
        },
        {
          kind: 'path',
          d: 'M 250 194 C 315 200 330 340 280 380',
          fill: 'none',
          stroke: ORGANELLE,
          strokeWidth: 4,
          strokeLinecap: 'round',
        },
        {
          kind: 'path',
          d: 'M 230 220 C 270 190 320 198 338 226',
          fill: 'none',
          stroke: ORGANELLE,
          strokeWidth: 4,
          strokeLinecap: 'round',
        },
      ],
    },
    nucleus: {
      marker: { x: 180, y: 310, labelX: 200, labelY: 365, labelAnchor: 'middle' },
      shapes: [
        {
          kind: 'circle',
          cx: 200,
          cy: 285,
          r: 68,
          fill: ORGANELLE,
          stroke: '#0b1f1a',
          strokeWidth: 2.2,
          opacity: 0.92,
        },
        {
          kind: 'circle',
          cx: 200,
          cy: 285,
          r: 55,
          fill: 'none',
          stroke: '#fff7dc',
          strokeWidth: 1.4,
          opacity: 0.35,
          strokeDasharray: '5 6',
        },
      ],
    },
    nucleolus: {
      marker: { x: 224, y: 268, labelX: 254, labelY: 268, labelAnchor: 'start' },
      shapes: [
        {
          kind: 'circle',
          cx: 224,
          cy: 268,
          r: 22,
          fill: ORGANELLE,
          stroke: '#0b1f1a',
          strokeWidth: 1.5,
        },
      ],
    },
    golgi: {
      marker: { x: 300, y: 460, labelX: 300, labelY: 438, labelAnchor: 'middle' },
      shapes: [...golgi(300, 452)],
    },
    peroxisome: {
      marker: { x: 105, y: 200, labelX: 105, labelY: 176, labelAnchor: 'middle' },
      shapes: [
        ...peroxisomes([
          [105, 200],
          [690, 480],
        ]),
      ],
    },
    ribosome: {
      marker: { x: 500, y: 490, labelX: 500, labelY: 514, labelAnchor: 'middle' },
      shapes: [
        ...ribosomes([
          [120, 100],
          [190, 100],
          [240, 130],
          [250, 200],
          [270, 260],
          [250, 340],
          [270, 390],
          [180, 390],
          [140, 380],
          [130, 320],
          [170, 470],
          [330, 90],
          [380, 95],
          [430, 90],
          [480, 95],
          [540, 120],
          [660, 220],
          [670, 250],
          [680, 360],
          [660, 390],
          [650, 470],
          [470, 490],
          [430, 500],
          [340, 500],
          [520, 450],
          [560, 450],
        ]),
      ],
    },
  },
};

export const CELL_DIAGRAM_LAYOUTS: Record<CellKind, CellDiagramLayout> = {
  animal: ANIMAL_LAYOUT,
  vegetal: PLANT_LAYOUT,
};
