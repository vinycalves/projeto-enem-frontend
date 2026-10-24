import { describe, expect, it } from 'vitest';
import { formatNumber, formatScientific } from './format';

describe('formatting pt-BR', () => {
  it('uses comma as decimal separator', () => {
    expect(formatNumber(3.14159, 2)).toBe('3,14');
    expect(formatNumber(890.3, 1)).toBe('890,3');
  });

  it('formats scientific notation with superscript exponent', () => {
    expect(formatScientific(0.0000175, 2)).toBe('1,75 × 10⁻⁵');
    expect(formatScientific(6.02e23, 2)).toBe('6,02 × 10²³');
  });
});
