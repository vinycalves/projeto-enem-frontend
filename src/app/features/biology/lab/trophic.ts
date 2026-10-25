export interface TrophicLevel {
  level: number;
  label: string;
  energy: number;
  percentOfInitial: number;
}

export interface TrophicResult {
  levels: TrophicLevel[];
  efficiency: number;
}

const LABELS = ['Produtores', 'Consumidores primários', 'Consumidores secundários', 'Consumidores terciários', 'Consumidores quaternários'];

export function trophicPyramid(
  initialEnergy: number,
  efficiencyPercent: number,
  levels: number,
): TrophicResult | null {
  if (
    !Number.isFinite(initialEnergy) ||
    initialEnergy <= 0 ||
    !Number.isFinite(efficiencyPercent) ||
    efficiencyPercent <= 0 ||
    efficiencyPercent > 100 ||
    !Number.isInteger(levels) ||
    levels < 2 ||
    levels > 5
  ) {
    return null;
  }
  const efficiency = efficiencyPercent / 100;
  const result: TrophicLevel[] = [];
  for (let index = 0; index < levels; index += 1) {
    const energy = initialEnergy * efficiency ** index;
    result.push({
      level: index + 1,
      label: LABELS[index] ?? `Nível ${index + 1}`,
      energy,
      percentOfInitial: (energy / initialEnergy) * 100,
    });
  }
  return { levels: result, efficiency: efficiencyPercent };
}
