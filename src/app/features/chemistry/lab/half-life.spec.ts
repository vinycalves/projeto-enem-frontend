import { describe, expect, it } from 'vitest';
import { calculateHalfLife } from './half-life';

describe('calculateHalfLife', () => {
  it('halves the mass after each half-life', () => {
    const one = calculateHalfLife(80, 5, 5);
    expect(one?.remaining).toBeCloseTo(40, 8);
    expect(one?.fraction).toBeCloseTo(0.5, 8);

    const two = calculateHalfLife(80, 5, 10);
    expect(two?.remaining).toBeCloseTo(20, 8);
    expect(two?.halfLives).toBeCloseTo(2, 8);

    const three = calculateHalfLife(80, 5, 17.5);
    expect(three?.remaining).toBeCloseTo(10 / Math.SQRT2, 8);
  });

  it('rejects invalid values', () => {
    expect(calculateHalfLife(0, 5, 5)).toBeNull();
    expect(calculateHalfLife(80, 0, 5)).toBeNull();
    expect(calculateHalfLife(80, 5, -1)).toBeNull();
  });
});
