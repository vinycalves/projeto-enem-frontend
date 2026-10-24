import { describe, expect, it } from 'vitest';
import { applySuccessiveChanges, compoundInterest, percentChange, percentageOf, simpleInterest } from './finance';
import { sampleFunction } from './function-plot';
import { calculateGeometry } from './geometry';
import { combination, classicalProbability, permutation } from './probability';
import { solveRuleOfThree } from './proportion';
import { calculateStatistics, parseNumberList } from './statistics';

describe('financial mathematics', () => {
  it('calculates percentage, change and successive factors', () => {
    expect(percentageOf(200, 15)).toBe(30);
    expect(percentChange(200, 250)).toBe(25);
    expect(applySuccessiveChanges(100, [20, -20])).toBeCloseTo(96, 8);
  });

  it('distinguishes simple and compound interest', () => {
    expect(simpleInterest(1000, 10, 2)).toEqual({ interest: 200, amount: 1200 });
    const compound = compoundInterest(1000, 10, 2);
    expect(compound?.amount).toBeCloseTo(1210, 8);
    expect(compound?.interest).toBeCloseTo(210, 8);
  });
});

describe('proportion and geometry', () => {
  it('solves direct and inverse rule of three', () => {
    expect(solveRuleOfThree(2, 4, 3, 'direct')).toBe(6);
    expect(solveRuleOfThree(2, 4, 3, 'inverse')).toBeCloseTo(8 / 3, 8);
  });

  it('calculates plane and spatial measures', () => {
    expect(calculateGeometry('rectangle', { base: 4, height: 3 })).toEqual({
      area: 12,
      perimeter: 14,
    });
    expect(calculateGeometry('circle', { radius: 2 })?.area).toBeCloseTo(4 * Math.PI, 8);
    expect(calculateGeometry('cylinder', { radius: 2, height: 5 })?.volume).toBeCloseTo(20 * Math.PI, 8);
    expect(calculateGeometry('cone', { radius: 2, height: 6 })?.volume).toBeCloseTo(8 * Math.PI, 8);
  });
});

describe('statistics and probability', () => {
  it('calculates central tendency and dispersion', () => {
    const values = parseNumberList('10; 12; 12; 14; 20');
    const stats = calculateStatistics(values);
    expect(stats?.mean).toBeCloseTo(13.6, 8);
    expect(stats?.median).toBe(12);
    expect(stats?.mode).toEqual([12]);
    expect(stats?.range).toBe(10);
    expect(stats?.standardDeviation).toBeGreaterThan(0);
  });

  it('calculates classical probability and counting', () => {
    expect(classicalProbability(3, 8)).toBe(0.375);
    expect(permutation(5, 2)).toBe(20);
    expect(combination(5, 2)).toBe(10);
    expect(classicalProbability(9, 8)).toBeNull();
  });
});

describe('function sampler', () => {
  it('samples affine, quadratic and exponential functions', () => {
    expect(sampleFunction('affine', 2, 1, 0)?.points).toHaveLength(161);
    expect(sampleFunction('quadratic', 1, 0, 0)?.points[80]?.y).toBeCloseTo(0, 8);
    expect(sampleFunction('exponential', 1, 2, 0)?.description).toContain('2^x');
  });
});
