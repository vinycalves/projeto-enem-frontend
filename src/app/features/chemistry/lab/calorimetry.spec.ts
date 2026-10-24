import { describe, expect, it } from 'vitest';
import { calculateCalorimetry } from './calorimetry';

describe('calculateCalorimetry', () => {
  it('calculates Q = m c ΔT and identifies heat release', () => {
    const heating = calculateCalorimetry({
      massGrams: 100,
      specificHeatJPerGramCelsius: 4.18,
      temperatureChangeCelsius: 20,
    });
    expect(heating?.energyJoules).toBeCloseTo(8360, 6);
    expect(heating?.energyKilojoules).toBeCloseTo(8.36, 3);
    expect(heating?.released).toBe(false);

    const cooling = calculateCalorimetry({
      massGrams: 100,
      specificHeatJPerGramCelsius: 4.18,
      temperatureChangeCelsius: -10,
    });
    expect(cooling?.energyJoules).toBeCloseTo(-4180, 6);
    expect(cooling?.released).toBe(true);
  });

  it('rejects invalid inputs', () => {
    expect(
      calculateCalorimetry({
        massGrams: 0,
        specificHeatJPerGramCelsius: 4.18,
        temperatureChangeCelsius: 10,
      }),
    ).toBeNull();
  });
});
