import { GeometryValues, PlanarShape, SolidShape } from './geometry';

const VIEW_WIDTH = 360;
const VIEW_HEIGHT = 260;
const BOX = {
  left: 62,
  top: 34,
  width: 236,
  height: 144,
};
const CENTER_X = VIEW_WIDTH / 2;
const CENTER_Y = BOX.top + BOX.height / 2;
const SOLID_FIT_SIZE = 2.2;
const MIN_DRAW_SIZE = 4;

export interface DiagramPoint {
  x: number;
  y: number;
}

export interface DiagramLine {
  x1: number;
  y1: number;
  x2: number;
  y2: number;
}

export interface DiagramLabel {
  x: number;
  y: number;
  text: string;
  anchor?: 'start' | 'middle' | 'end';
}

export interface DiagramDimension extends DiagramLine {
  label: string;
  labelX: number;
  labelY: number;
  labelAnchor: 'start' | 'middle' | 'end';
}

export interface GeometryDiagram {
  viewBox: string;
  outlinePath: string;
  guides: DiagramLine[];
  dimensions: DiagramDimension[];
  labels: DiagramLabel[];
  description: string;
}

export interface SolidRenderParams {
  shape: SolidShape;
  radius: number;
  width: number;
  height: number;
  depth: number;
  /** Fator aplicado às dimensões para caber na cena, sem alterar os valores exibidos. */
  scale: number;
}

const measureFormatter = new Intl.NumberFormat('pt-BR', {
  maximumFractionDigits: 2,
});

export function formatMeasure(value: number): string {
  return measureFormatter.format(value);
}

export function buildGeometryDiagram(
  shape: PlanarShape,
  values: GeometryValues,
): GeometryDiagram | null {
  const positive = (value: number | undefined): value is number =>
    value !== undefined && Number.isFinite(value) && value > 0;

  if (shape === 'rectangle') {
    if (!positive(values.base) || !positive(values.height)) return null;
    const scale = fitScale(values.base, values.height);
    const width = displaySize(values.base * scale, BOX.width);
    const height = displaySize(values.height * scale, BOX.height);
    const left = CENTER_X - width / 2;
    const right = CENTER_X + width / 2;
    const top = CENTER_Y - height / 2;
    const bottom = CENTER_Y + height / 2;

    return {
      viewBox: `0 0 ${VIEW_WIDTH} ${VIEW_HEIGHT}`,
      outlinePath: polygonPath([
        { x: left, y: top },
        { x: right, y: top },
        { x: right, y: bottom },
        { x: left, y: bottom },
      ]),
      guides: [],
      dimensions: [
        horizontalDimension(left, right, bottom + 12, `b = ${formatMeasure(values.base)}`),
        verticalDimension(left - 12, top, bottom, `h = ${formatMeasure(values.height)}`, 'end'),
      ],
      labels: [],
      description: `Retângulo com base ${formatMeasure(values.base)} e altura ${formatMeasure(values.height)}.`,
    };
  }

  if (shape === 'triangle') {
    if (!positive(values.base) || !positive(values.height)) return null;
    const scale = fitScale(values.base, values.height);
    const width = displaySize(values.base * scale, BOX.width);
    const height = displaySize(values.height * scale, BOX.height);
    const left = CENTER_X - width / 2;
    const right = CENTER_X + width / 2;
    const bottom = CENTER_Y + height / 2;
    const apex = { x: CENTER_X, y: bottom - height };

    return {
      viewBox: `0 0 ${VIEW_WIDTH} ${VIEW_HEIGHT}`,
      outlinePath: polygonPath([{ x: left, y: bottom }, { x: right, y: bottom }, apex]),
      guides: [{ x1: apex.x, y1: apex.y, x2: CENTER_X, y2: bottom }],
      dimensions: [
        horizontalDimension(left, right, bottom + 12, `b = ${formatMeasure(values.base)}`),
        verticalDimension(left - 12, apex.y, bottom, `h = ${formatMeasure(values.height)}`, 'end'),
      ],
      labels: [],
      description: `Triângulo com base ${formatMeasure(values.base)} e altura ${formatMeasure(values.height)}.`,
    };
  }

  if (shape === 'circle') {
    if (!positive(values.radius)) return null;
    const radius = Math.min(BOX.width, BOX.height) / 2;
    const cx = CENTER_X;
    const cy = CENTER_Y;
    const left = cx - radius;
    const right = cx + radius;

    return {
      viewBox: `0 0 ${VIEW_WIDTH} ${VIEW_HEIGHT}`,
      outlinePath: circlePath(cx, cy, radius),
      guides: [{ x1: cx, y1: cy, x2: right, y2: cy }],
      dimensions: [
        {
          x1: cx,
          y1: cy,
          x2: right,
          y2: cy,
          label: `r = ${formatMeasure(values.radius)}`,
          labelX: (cx + right) / 2,
          labelY: cy - 8,
          labelAnchor: 'middle',
        },
      ],
      labels: [{ x: cx, y: cy + 18, text: 'centro', anchor: 'middle' }],
      description: `Círculo com raio ${formatMeasure(values.radius)}.`,
    };
  }

  if (!positive(values.base) || !positive(values.top) || !positive(values.height)) return null;
  const scale = fitScale(Math.max(values.base, values.top), values.height);
  const baseWidth = displaySize(values.base * scale, BOX.width);
  const topWidth = displaySize(values.top * scale, BOX.width);
  const height = displaySize(values.height * scale, BOX.height);
  const leftBase = CENTER_X - baseWidth / 2;
  const rightBase = CENTER_X + baseWidth / 2;
  const leftTop = CENTER_X - topWidth / 2;
  const rightTop = CENTER_X + topWidth / 2;
  const bottom = CENTER_Y + height / 2;
  const top = bottom - height;

  return {
    viewBox: `0 0 ${VIEW_WIDTH} ${VIEW_HEIGHT}`,
    outlinePath: polygonPath([
      { x: leftBase, y: bottom },
      { x: rightBase, y: bottom },
      { x: rightTop, y: top },
      { x: leftTop, y: top },
    ]),
    guides: [{ x1: CENTER_X, y1: top, x2: CENTER_X, y2: bottom }],
    dimensions: [
      horizontalDimension(leftBase, rightBase, bottom + 12, `B = ${formatMeasure(values.base)}`),
      horizontalDimension(leftTop, rightTop, top - 8, `b = ${formatMeasure(values.top)}`),
      verticalDimension(leftBase - 12, top, bottom, `h = ${formatMeasure(values.height)}`, 'end'),
    ],
    labels: [],
    description: `Trapézio com base maior ${formatMeasure(values.base)}, base menor ${formatMeasure(values.top)} e altura ${formatMeasure(values.height)}.`,
  };
}

export function buildSolidRenderParams(
  shape: SolidShape,
  values: GeometryValues,
): SolidRenderParams | null {
  const positive = (value: number | undefined): value is number =>
    value !== undefined && Number.isFinite(value) && value > 0;

  if (shape === 'cylinder' || shape === 'cone') {
    if (!positive(values.radius) || !positive(values.height)) return null;
    return withScale({
      shape,
      radius: values.radius,
      width: values.radius * 2,
      height: values.height,
      depth: values.radius * 2,
    });
  }

  if (shape === 'sphere') {
    if (!positive(values.radius)) return null;
    return withScale({
      shape,
      radius: values.radius,
      width: values.radius * 2,
      height: values.radius * 2,
      depth: values.radius * 2,
    });
  }

  if (!positive(values.base) || !positive(values.depth) || !positive(values.height)) return null;
  return withScale({
    shape: 'rectangularPrism',
    radius: 0,
    width: values.base,
    height: values.height,
    depth: values.depth,
  });
}

function withScale(params: Omit<SolidRenderParams, 'scale'>): SolidRenderParams {
  const extent = Math.max(params.width, params.height, params.depth, 0.0001);
  return { ...params, scale: SOLID_FIT_SIZE / extent };
}

function fitScale(width: number, height: number): number {
  return Math.min(BOX.width / Math.max(width, 0.0001), BOX.height / Math.max(height, 0.0001));
}

function displaySize(value: number, limit: number): number {
  return Math.min(Math.max(value, MIN_DRAW_SIZE), limit);
}

function horizontalDimension(x1: number, x2: number, y: number, label: string): DiagramDimension {
  return {
    x1,
    y1: y,
    x2,
    y2: y,
    label,
    labelX: (x1 + x2) / 2,
    labelY: y + 15,
    labelAnchor: 'middle',
  };
}

function verticalDimension(
  x: number,
  y1: number,
  y2: number,
  label: string,
  anchor: 'start' | 'middle' | 'end',
): DiagramDimension {
  return {
    x1: x,
    y1,
    x2: x,
    y2,
    label,
    labelX: anchor === 'end' ? x - 5 : x + 5,
    labelY: (y1 + y2) / 2,
    labelAnchor: anchor,
  };
}

function polygonPath(points: DiagramPoint[]): string {
  return `${points
    .map((point, index) => `${index === 0 ? 'M' : 'L'} ${round(point.x)} ${round(point.y)}`)
    .join(' ')} Z`;
}

function circlePath(cx: number, cy: number, radius: number): string {
  const left = round(cx - radius);
  const right = round(cx + radius);
  const center = round(cy);
  const r = round(radius);
  return `M ${left} ${center} A ${r} ${r} 0 1 0 ${right} ${center} A ${r} ${r} 0 1 0 ${left} ${center} Z`;
}

function round(value: number): number {
  return Math.round(value * 10) / 10;
}
