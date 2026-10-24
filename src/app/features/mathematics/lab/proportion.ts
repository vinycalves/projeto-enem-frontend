export type ProportionRelation = 'direct' | 'inverse';

export function solveRuleOfThree(
  a: number,
  b: number,
  c: number,
  relation: ProportionRelation,
): number | null {
  if ([a, b, c].some((value) => !Number.isFinite(value)) || a === 0) {
    return null;
  }
  if (relation === 'direct') {
    return (b * c) / a;
  }
  if (b === 0 || c === 0) {
    return null;
  }
  return (a * b) / c;
}
