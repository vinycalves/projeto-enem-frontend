import { describe, expect, it } from 'vitest';
import { Indicator, TitrationModel } from './titration';

const strong = new TitrationModel({
  analyte: 'strong',
  analyteConcentration: 0.1,
  analyteVolumeMl: 25,
  titrantConcentration: 0.1,
  ka: 1e-14,
  kw: 1e-14,
});

const weak = new TitrationModel({
  analyte: 'weak',
  analyteConcentration: 0.1,
  analyteVolumeMl: 25,
  titrantConcentration: 0.1,
  ka: 1.75e-5,
  kw: 1e-14,
});

describe('TitrationModel', () => {
  it('reproduces strong acid neutralization', () => {
    expect(strong.equivalenceVolumeMl()).toBeCloseTo(25, 6);
    expect(strong.pHAt(0)).toBeCloseTo(1, 3);
    expect(strong.pHAt(12.5)).toBeCloseTo(1.477, 2);
    expect(strong.pHAt(25)).toBeCloseTo(7, 6);
    expect(strong.pHAt(30)).toBeGreaterThan(11.5);
  });

  it('reproduces weak acid initial pH, buffer and equivalence', () => {
    expect(weak.pHAt(0)).toBeCloseTo(2.881, 2);
    expect(weak.pHAt(12.5)).toBeCloseTo(4.756, 2);
    expect(weak.pHAt(25)).toBeGreaterThan(8.5);
    expect(weak.pHAt(25)).toBeLessThan(9);
  });

  it('chooses indicator states from the pH range', () => {
    const phenolphthalein: Indicator = {
      id: 'phenolphthalein',
      name: 'Fenolftaleína',
      lowPh: 8.2,
      highPh: 10,
      acidColor: 'incolor',
      baseColor: 'rosa',
    };
    expect(weak.indicatorState(phenolphthalein, 7)).toBe('acid');
    expect(weak.indicatorState(phenolphthalein, 9)).toBe('transition');
    expect(weak.indicatorState(phenolphthalein, 11)).toBe('base');
  });

  it('keeps the curve inside the pH scale and monotonic after equivalence', () => {
    const curve = strong.curve();
    expect(curve.length).toBeGreaterThan(200);
    expect(Math.min(...curve.map((point) => point.pH))).toBeGreaterThanOrEqual(0);
    expect(Math.max(...curve.map((point) => point.pH))).toBeLessThanOrEqual(14);
    expect(strong.pHAt(26)).toBeGreaterThan(strong.pHAt(25));
    expect(strong.pHAt(40)).toBeGreaterThan(strong.pHAt(30));
  });
});
