export type FunctionKind = 'affine' | 'quadratic' | 'exponential';

export interface FunctionSamplePoint {
  x: number;
  y: number;
}

export interface FunctionSample {
  points: FunctionSamplePoint[];
  minY: number;
  maxY: number;
  description: string;
}

export function sampleFunction(
  kind: FunctionKind,
  a: number,
  b: number,
  c: number,
  minX = -10,
  maxX = 10,
): FunctionSample | null {
  if (![a, b, c, minX, maxX].every((value) => Number.isFinite(value)) || minX >= maxX) {
    return null;
  }
  const points: FunctionSamplePoint[] = [];
  const steps = 160;
  for (let index = 0; index <= steps; index += 1) {
    const x = minX + ((maxX - minX) * index) / steps;
    const y =
      kind === 'affine'
        ? a * x + b
        : kind === 'quadratic'
          ? a * x * x + b * x + c
          : a * b ** x + c;
    if (Number.isFinite(y)) {
      points.push({ x, y });
    }
  }
  if (points.length < 2) {
    return null;
  }
  const values = points.map((point) => point.y);
  const minY = Math.min(...values);
  const maxY = Math.max(...values);
  const description =
    kind === 'affine'
      ? `f(x) = ${a}x + ${b}`
      : kind === 'quadratic'
        ? `f(x) = ${a}x² + ${b}x + ${c}`
        : `f(x) = ${a} · ${b}^x + ${c}`;
  return { points, minY, maxY, description };
}
