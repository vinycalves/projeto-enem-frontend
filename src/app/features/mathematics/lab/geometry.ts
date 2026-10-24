export type GeometryShape =
  | 'rectangle'
  | 'triangle'
  | 'circle'
  | 'trapezoid'
  | 'cylinder'
  | 'cone'
  | 'sphere';

export interface GeometryValues {
  base?: number;
  height?: number;
  top?: number;
  radius?: number;
}

export interface GeometryResult {
  area?: number;
  perimeter?: number;
  volume?: number;
  surface?: number;
}

export function calculateGeometry(shape: GeometryShape, values: GeometryValues): GeometryResult | null {
  const positive = (value: number | undefined): value is number =>
    value !== undefined && Number.isFinite(value) && value > 0;

  if (shape === 'rectangle') {
    if (!positive(values.base) || !positive(values.height)) return null;
    return {
      area: values.base * values.height,
      perimeter: 2 * (values.base + values.height),
    };
  }
  if (shape === 'triangle') {
    if (!positive(values.base) || !positive(values.height)) return null;
    return { area: (values.base * values.height) / 2 };
  }
  if (shape === 'circle') {
    if (!positive(values.radius)) return null;
    return {
      area: Math.PI * values.radius ** 2,
      perimeter: 2 * Math.PI * values.radius,
    };
  }
  if (shape === 'trapezoid') {
    if (!positive(values.base) || !positive(values.top) || !positive(values.height)) return null;
    return { area: ((values.base + values.top) * values.height) / 2 };
  }
  if (shape === 'cylinder') {
    if (!positive(values.radius) || !positive(values.height)) return null;
    return {
      volume: Math.PI * values.radius ** 2 * values.height,
      surface: 2 * Math.PI * values.radius * (values.radius + values.height),
    };
  }
  if (shape === 'cone') {
    if (!positive(values.radius) || !positive(values.height)) return null;
    return {
      volume: (Math.PI * values.radius ** 2 * values.height) / 3,
    };
  }
  if (!positive(values.radius)) return null;
  return {
    volume: (4 * Math.PI * values.radius ** 3) / 3,
    surface: 4 * Math.PI * values.radius ** 2,
  };
}
