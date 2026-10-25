import { describe, expect, it } from 'vitest';
import { buildGeometryDiagram, buildSolidRenderParams, formatMeasure } from './geometry-visual';

describe('geometry diagram layout', () => {
  it('lays out a rectangle preserving the dimension ratio', () => {
    const diagram = buildGeometryDiagram('rectangle', { base: 4, height: 3 });

    expect(diagram).not.toBeNull();
    expect(diagram?.outlinePath).toBe('M 84 34 L 276 34 L 276 178 L 84 178 Z');
    expect(diagram?.dimensions.map((dimension) => dimension.label)).toEqual(['b = 4', 'h = 3']);
    expect(diagram?.description).toContain('base 4');
  });

  it('draws a triangle with a height guide', () => {
    const diagram = buildGeometryDiagram('triangle', { base: 6, height: 4 });

    expect(diagram?.guides).toHaveLength(1);
    expect(diagram?.dimensions.map((dimension) => dimension.label)).toEqual(['b = 6', 'h = 4']);
    expect(diagram?.outlinePath.startsWith('M ')).toBe(true);
  });

  it('draws a circle with a radius line and a center label', () => {
    const diagram = buildGeometryDiagram('circle', { radius: 2.5 });

    expect(diagram?.outlinePath).toContain('A 72 72');
    expect(diagram?.guides).toHaveLength(1);
    expect(diagram?.dimensions[0]?.label).toBe('r = 2,5');
    expect(diagram?.labels[0]?.text).toBe('centro');
  });

  it('draws a trapezoid with both bases and the height', () => {
    const diagram = buildGeometryDiagram('trapezoid', { base: 8, top: 3, height: 4 });

    expect(diagram?.dimensions.map((dimension) => dimension.label)).toEqual([
      'B = 8',
      'b = 3',
      'h = 4',
    ]);
    expect(diagram?.description).toContain('base maior 8');
  });

  it('keeps all diagram coordinates inside the view box for extreme ratios', () => {
    const diagram = buildGeometryDiagram('rectangle', { base: 0.1, height: 1000 });

    expect(diagram).not.toBeNull();
    const coordinates = (diagram?.outlinePath.match(/-?\d+(?:\.\d+)?/g) ?? []).map(Number);
    expect(coordinates.every((value) => value >= 0 && value <= 360)).toBe(true);
    const xs = coordinates.filter((_value, index) => index % 2 === 0);
    const ys = coordinates.filter((_value, index) => index % 2 === 1);
    expect(Math.max(...xs) - Math.min(...xs)).toBeGreaterThanOrEqual(4);
    expect(Math.max(...ys) - Math.min(...ys)).toBeGreaterThanOrEqual(4);
    expect(
      diagram?.dimensions.every((dimension) => dimension.labelX >= 0 && dimension.labelX <= 360),
    ).toBe(true);
  });

  it('returns null for invalid dimensions', () => {
    expect(buildGeometryDiagram('rectangle', { base: 0, height: 2 })).toBeNull();
    expect(buildGeometryDiagram('circle', { radius: -1 })).toBeNull();
    expect(buildGeometryDiagram('trapezoid', { base: 4, top: 2 })).toBeNull();
  });

  it('formats measures with pt-BR decimals', () => {
    expect(formatMeasure(2)).toBe('2');
    expect(formatMeasure(2.5)).toBe('2,5');
    expect(formatMeasure(1.234)).toBe('1,23');
  });
});

describe('solid render parameters', () => {
  it('normalizes the largest dimension to fit the scene', () => {
    const cylinder = buildSolidRenderParams('cylinder', { radius: 2, height: 5 });
    expect(cylinder).toMatchObject({
      shape: 'cylinder',
      radius: 2,
      width: 4,
      height: 5,
      depth: 4,
    });
    expect(Math.max(cylinder!.width, cylinder!.height) * cylinder!.scale).toBeCloseTo(2.2, 8);

    const prism = buildSolidRenderParams('rectangularPrism', { base: 3, depth: 4, height: 2 });
    expect(prism).toMatchObject({ width: 3, depth: 4, height: 2, radius: 0 });
    expect(Math.max(prism!.width, prism!.depth, prism!.height) * prism!.scale).toBeCloseTo(2.2, 8);

    const sphere = buildSolidRenderParams('sphere', { radius: 3 });
    expect(sphere?.width).toBe(6);
    expect(sphere?.height).toBe(6);
    expect(sphere?.depth).toBe(6);
  });

  it('returns null when a required solid measure is missing', () => {
    expect(buildSolidRenderParams('cylinder', { radius: 2 })).toBeNull();
    expect(buildSolidRenderParams('rectangularPrism', { base: 3, depth: 2 })).toBeNull();
    expect(buildSolidRenderParams('sphere', {})).toBeNull();
  });
});
