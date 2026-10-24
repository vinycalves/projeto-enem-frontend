import { describe, expect, it } from 'vitest';
import { GUIDE_META, guideBySlug } from './guide-meta';

describe('guide metadata', () => {
  it('registers the index and fifteen subject guides', () => {
    expect(GUIDE_META).toHaveLength(16);
    expect(new Set(GUIDE_META.map((guide) => guide.slug)).size).toBe(16);
    expect(GUIDE_META.filter((guide) => guide.area !== 'geral')).toHaveLength(15);
  });

  it('maps the canonical slugs to their markdown files', () => {
    expect(guideBySlug('matematica')?.file).toBe('01-matematica.md');
    expect(guideBySlug('quimica')?.file).toBe('03-quimica.md');
    expect(guideBySlug('redacao')?.file).toBe('15-redacao.md');
    expect(guideBySlug('nao-existe')).toBeUndefined();
  });
});
