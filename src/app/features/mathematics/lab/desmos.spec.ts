import { describe, expect, it } from 'vitest';
import {
  DESMOS_DEFAULT_API_VERSION,
  buildDesmosBounds,
  buildDesmosLatex,
  resolveDesmosSettings,
} from './desmos';

describe('Desmos configuration', () => {
  it('stays disabled when no legitimate key is configured', () => {
    expect(resolveDesmosSettings(undefined)).toBeNull();
    expect(resolveDesmosSettings({ DESMOS_API_KEY: '' })).toBeNull();
    expect(resolveDesmosSettings({ DESMOS_API_KEY: '<YOUR_API_KEY_HERE>' })).toBeNull();
    expect(resolveDesmosSettings({ DESMOS_API_KEY: 'COLE_SUA_CHAVE_AQUI' })).toBeNull();
  });

  it('builds the official script URL from a configured key', () => {
    const settings = resolveDesmosSettings({ DESMOS_API_KEY: 'abc123def456' });

    expect(settings).toMatchObject({
      apiKey: 'abc123def456',
      apiVersion: DESMOS_DEFAULT_API_VERSION,
    });
    expect(settings?.scriptUrl).toBe(
      `https://www.desmos.com/api/v${DESMOS_DEFAULT_API_VERSION}/calculator.js?apiKey=abc123def456`,
    );
  });

  it('accepts a version from config and a key from a deployment meta tag', () => {
    const settings = resolveDesmosSettings(
      { DESMOS_CONFIG: { apiVersion: '1.10' } },
      'metaKey123',
      '1.9',
    );

    expect(settings?.apiVersion).toBe('1.10');
    expect(settings?.apiKey).toBe('metaKey123');
    expect(settings?.scriptUrl).toContain('/api/v1.10/calculator.js');
  });

  it('falls back to the supported version when the version is invalid', () => {
    const settings = resolveDesmosSettings({
      DESMOS_CONFIG: { apiKey: 'validKey123', apiVersion: 'latest' },
    });

    expect(settings?.apiVersion).toBe(DESMOS_DEFAULT_API_VERSION);
  });
});

describe('Desmos expressions and bounds', () => {
  it('converts each function kind to LaTeX', () => {
    expect(buildDesmosLatex('affine', 2, -1, 0)).toBe('y=2x - 1');
    expect(buildDesmosLatex('quadratic', 1, -3, 2)).toBe('y=1x^{2} - 3x + 2');
    expect(buildDesmosLatex('exponential', 1, 2, 0)).toBe('y=1\\cdot 2^{x} + 0');
    expect(buildDesmosLatex('affine', Number.NaN, 0, 0)).toBeNull();
  });

  it('includes zero and padding in the visible window', () => {
    expect(buildDesmosBounds({ minY: -2, maxY: 10 })).toEqual({
      left: -10,
      right: 10,
      bottom: -3.44,
      top: 11.44,
    });
    expect(buildDesmosBounds({ minY: 0, maxY: 0 })).toEqual({
      left: -10,
      right: 10,
      bottom: -1,
      top: 1,
    });
  });
});
