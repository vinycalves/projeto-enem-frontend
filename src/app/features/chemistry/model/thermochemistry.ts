import { ReactionSeed } from '../../../core/api/models/reaction-seed';

export interface ElementCount {
  element: string;
  count: number;
}

export function countElements(reaction: ReactionSeed, side: 'reactant' | 'product'): ElementCount[] {
  const counts = new Map<string, number>();
  for (const species of reaction.species.filter((item) => item.side === side)) {
    for (const atom of species.atoms) {
      counts.set(atom.element, (counts.get(atom.element) ?? 0) + 1);
    }
  }
  return [...counts.entries()]
    .map(([element, count]) => ({ element, count }))
    .sort((a, b) => a.element.localeCompare(b.element));
}

export function atomConservation(reaction: ReactionSeed): boolean {
  const reactants = countElements(reaction, 'reactant');
  const products = countElements(reaction, 'product');
  if (reactants.length !== products.length) {
    return false;
  }
  return reactants.every(
    (item, index) =>
      item.element === products[index].element && item.count === products[index].count,
  );
}

export function deltaHFromFormation(
  formationEnthalpies: Record<string, number>,
  species: Array<{ key: string; coefficient: number; side: 'reactant' | 'product' }>,
): number {
  let total = 0;
  for (const item of species) {
    const enthalpy = formationEnthalpies[item.key];
    if (enthalpy === undefined) {
      throw new Error(`Entalpia de formação ausente para ${item.key}.`);
    }
    total += item.side === 'product' ? item.coefficient * enthalpy : -item.coefficient * enthalpy;
  }
  return total;
}
