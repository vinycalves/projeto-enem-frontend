import { describe, expect, it } from 'vitest';
import { EquilibriumModel } from './equilibrium';

describe('EquilibriumModel', () => {
  it('moves toward equilibrium and converges to Kc', () => {
    const model = new EquilibriumModel({
      initialN2O4: 0.05,
      initialNO2: 0,
      kc: 0.0059,
    });
    const target = model.equilibrium();
    expect((target.no2 * target.no2) / target.n2o4).toBeCloseTo(0.0059, 8);

    for (let index = 0; index < 20000; index += 1) {
      model.step(0.01);
    }
    expect(model.n2o4).toBeCloseTo(target.n2o4, 3);
    expect(model.no2).toBeCloseTo(target.no2, 3);
    expect(model.q()).toBeCloseTo(0.0059, 3);
    expect(model.direction()).toBe('equilibrium');
  });

  it('predicts forward direction when Q is below K', () => {
    const model = new EquilibriumModel({
      initialN2O4: 0.05,
      initialNO2: 0.001,
      kc: 0.0059,
    });
    expect(model.q()).toBeLessThan(model.kc);
    expect(model.direction()).toBe('forward');
  });

  it('predicts reverse direction after adding NO2', () => {
    const model = new EquilibriumModel({
      initialN2O4: 0.05,
      initialNO2: 0.02,
      kc: 0.0059,
    });
    expect(model.direction()).toBe('reverse');
    const before = model.n2o4;
    for (let index = 0; index < 5000; index += 1) {
      model.step(0.01);
    }
    expect(model.n2o4).toBeGreaterThan(before);
  });

  it('compression increases Q and shifts toward N2O4', () => {
    const model = new EquilibriumModel({
      initialN2O4: 0.02,
      initialNO2: 0.02,
      kc: 0.0059,
    });
    const qBefore = model.q();
    model.compress(0.5);
    expect(model.q()).toBeCloseTo(qBefore * 0.5, 8);
    expect(model.direction()).toBe('reverse');
  });
});
