import { describe, expect, it } from 'vitest';
import { CHEMISTRY_GUIDE, ESSENTIAL_FORMULAS } from './chemistry-guide-data';

describe('chemistry guide data', () => {
  it('covers the fifteen blocks without duplicate ids', () => {
    expect(CHEMISTRY_GUIDE).toHaveLength(15);
    const blockIds = new Set(CHEMISTRY_GUIDE.map((block) => block.id));
    expect(blockIds.size).toBe(15);
    const topicIds = new Set<string>();
    let topics = 0;
    for (const block of CHEMISTRY_GUIDE) {
      expect(block.topics.length).toBeGreaterThan(0);
      for (const topic of block.topics) {
        topics += 1;
        expect(topicIds.has(topic.id)).toBe(false);
        topicIds.add(topic.id);
        expect(topic.bullets.length).toBeGreaterThan(0);
      }
    }
    expect(topics).toBeGreaterThanOrEqual(90);
  });

  it('contains the essential formula groups and canonical ENEM paths', () => {
    expect(ESSENTIAL_FORMULAS.length).toBeGreaterThanOrEqual(7);
    const allRoutes = CHEMISTRY_GUIDE.flatMap((block) =>
      block.topics.flatMap((topic) => (topic.tool ? [topic.tool.route] : [])),
    );
    expect(allRoutes).toContain('/quimica/laboratorio');
    expect(allRoutes).toContain('/quimica/tabela-periodica');
    expect(allRoutes).toContain('/visualizacoes/equilibrio-n2o4');
  });
});
