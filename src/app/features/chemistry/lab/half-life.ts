export interface HalfLifeResult {
  remaining: number;
  fraction: number;
  halfLives: number;
}

export function calculateHalfLife(
  initialMass: number,
  halfLife: number,
  elapsedTime: number,
): HalfLifeResult | null {
  if (
    !Number.isFinite(initialMass) ||
    initialMass <= 0 ||
    !Number.isFinite(halfLife) ||
    halfLife <= 0 ||
    !Number.isFinite(elapsedTime) ||
    elapsedTime < 0
  ) {
    return null;
  }
  const halfLives = elapsedTime / halfLife;
  const fraction = 0.5 ** halfLives;
  return {
    remaining: initialMass * fraction,
    fraction,
    halfLives,
  };
}
