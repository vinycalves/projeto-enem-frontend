import { describe, expect, it } from 'vitest';
import { calculatePh } from './ph';

describe('calculatePh', () => {
  it('calculates strong acid and strong base', () => {
    const acid = calculatePh({
      concentration: 0.1,
      nature: 'acid',
      strength: 'strong',
      ionizationConstant: 0,
      kw: 1e-14,
    });
    expect(acid?.ph).toBeCloseTo(1, 5);
    expect(acid?.poh).toBeCloseTo(13, 5);

    const base = calculatePh({
      concentration: 0.01,
      nature: 'base',
      strength: 'strong',
      ionizationConstant: 0,
      kw: 1e-14,
    });
    expect(base?.ph).toBeCloseTo(12, 5);
  });

  it('calculates weak acid and weak base with monoprotic equilibrium', () => {
    const acid = calculatePh({
      concentration: 0.1,
      nature: 'acid',
      strength: 'weak',
      ionizationConstant: 1.75e-5,
      kw: 1e-14,
    });
    expect(acid?.ph).toBeCloseTo(2.881, 2);
    expect(acid?.degree).toBeCloseTo(0.0131, 3);

    const base = calculatePh({
      concentration: 0.1,
      nature: 'base',
      strength: 'weak',
      ionizationConstant: 1.8e-5,
      kw: 1e-14,
    });
    expect(base?.ph).toBeCloseTo(11.125, 2);
  });
});
