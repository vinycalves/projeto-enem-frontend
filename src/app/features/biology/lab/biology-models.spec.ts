import { describe, expect, it } from 'vitest';
import { michaelisMenten, enzymeCurve } from './enzyme';
import { hardyWeinberg, hardyWeinbergCounts } from './hardy-weinberg';
import { simulateLogistic } from './population';
import { cross } from './punnett';
import { trophicPyramid } from './trophic';

describe('Punnett cross', () => {
  it('produces the classic 3:1 phenotype ratio', () => {
    const result = cross('Aa', 'Aa');
    expect(result.genotypes).toEqual({ AA: 1, Aa: 2, aa: 1 });
    expect(result.phenotypes).toEqual({ dominant: 3, recessive: 1 });
    expect(result.phenotypePercent.dominant).toBe(75);
  });

  it('crossing homozygous parents produces only heterozygotes', () => {
    const result = cross('AA', 'aa');
    expect(result.cells.every((genotype) => genotype === 'Aa')).toBe(true);
    expect(result.phenotypePercent.dominant).toBe(100);
  });
});

describe('Hardy-Weinberg', () => {
  it('calculates genotype frequencies and counts', () => {
    const result = hardyWeinberg(0.6, 1000);
    expect(result).not.toBeNull();
    if (!result) {
      throw new Error('expected a Hardy-Weinberg result');
    }
    expect(result.q).toBeCloseTo(0.4, 8);
    expect(result.aa).toBeCloseTo(0.36, 8);
    expect(result.ab).toBeCloseTo(0.48, 8);
    expect(result.bb).toBeCloseTo(0.16, 8);
    expect(result.aa + result.ab + result.bb).toBeCloseTo(1, 8);
    expect(hardyWeinbergCounts(result).aa).toBeCloseTo(360, 6);
  });

  it('rejects invalid allele frequencies', () => {
    expect(hardyWeinberg(-0.1)).toBeNull();
    expect(hardyWeinberg(1.1)).toBeNull();
  });
});

describe('logistic population model', () => {
  it('grows and approaches carrying capacity', () => {
    const result = simulateLogistic({
      initialPopulation: 10,
      growthRate: 0.5,
      carryingCapacity: 500,
      time: 40,
      step: 0.05,
    });
    expect(result?.points[0]).toEqual({ t: 0, n: 10 });
    expect(result!.points.at(-1)!.n).toBeGreaterThan(450);
    expect(result!.points.at(-1)!.n).toBeLessThanOrEqual(500);
    expect(result!.points.at(-1)!.n).toBeGreaterThan(result!.points[1].n);
  });

  it('rejects invalid parameters', () => {
    expect(
      simulateLogistic({
        initialPopulation: 10,
        growthRate: 0.5,
        carryingCapacity: 0,
        time: 10,
      }),
    ).toBeNull();
  });
});

describe('Michaelis-Menten enzyme kinetics', () => {
  it('reaches half Vmax at Km', () => {
    expect(michaelisMenten({ vmax: 100, km: 2, substrate: 2 })).toBeCloseTo(50, 8);
    expect(michaelisMenten({ vmax: 100, km: 2, substrate: 0 })).toBe(0);
    expect(michaelisMenten({ vmax: 100, km: 2, substrate: 100 })).toBeGreaterThan(95);
  });

  it('builds a monotonic curve', () => {
    const curve = enzymeCurve({ vmax: 100, km: 2, substrate: 0 }, 10, 20);
    expect(curve.length).toBe(21);
    for (let index = 1; index < curve.length; index += 1) {
      expect(curve[index].v).toBeGreaterThanOrEqual(curve[index - 1].v);
    }
  });
});

describe('trophic energy pyramid', () => {
  it('applies the transfer efficiency at each level', () => {
    const result = trophicPyramid(1000, 10, 4);
    expect(result).not.toBeNull();
    if (!result) {
      throw new Error('expected a trophic pyramid result');
    }
    expect(result.levels.map((level) => level.energy)).toEqual([
      expect.closeTo(1000, 8),
      expect.closeTo(100, 8),
      expect.closeTo(10, 8),
      expect.closeTo(1, 8),
    ]);
    expect(result.levels.at(-1)?.percentOfInitial).toBeCloseTo(0.1, 8);
  });

  it('rejects levels outside the supported range', () => {
    expect(trophicPyramid(1000, 10, 1)).toBeNull();
    expect(trophicPyramid(1000, 110, 4)).toBeNull();
  });
});
