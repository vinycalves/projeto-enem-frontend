export interface HardyWeinbergResult {
  p: number;
  q: number;
  aa: number;
  ab: number;
  bb: number;
  dominant: number;
  recessive: number;
  population: number;
}

export function hardyWeinberg(p: number, population = 1000): HardyWeinbergResult | null {
  if (!Number.isFinite(p) || p < 0 || p > 1 || !Number.isFinite(population) || population <= 0) {
    return null;
  }
  const q = 1 - p;
  const aa = p * p;
  const ab = 2 * p * q;
  const bb = q * q;
  return {
    p,
    q,
    aa,
    ab,
    bb,
    dominant: aa + ab,
    recessive: bb,
    population,
  };
}

export function hardyWeinbergCounts(
  result: HardyWeinbergResult,
): { aa: number; ab: number; bb: number } {
  return {
    aa: result.aa * result.population,
    ab: result.ab * result.population,
    bb: result.bb * result.population,
  };
}
