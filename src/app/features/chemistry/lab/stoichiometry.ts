import { ParsedFormula } from './formula';

export interface ReactantAmount {
  id: string;
  parsed: ParsedFormula;
  coefficient: number;
  massGrams: number | null;
}

export interface StoichiometryRow {
  id: string;
  formula: string;
  molarMass: number;
  moles: number | null;
  massGrams: number | null;
  normalizedMoles: number | null;
  excessMoles: number | null;
  excessMassGrams: number | null;
  limiting: boolean;
}

export interface StoichiometryResult {
  rows: StoichiometryRow[];
  limitingId: string;
  target: {
    formula: string;
    coefficient: number;
    molarMass: number;
    theoreticalMoles: number;
    theoreticalMassGrams: number;
    actualMassGrams: number;
    yieldPercent: number;
  };
}

export function calculateStoichiometry(
  reactants: ReactantAmount[],
  target: ParsedFormula,
  targetCoefficient: number,
  yieldPercent = 100,
): StoichiometryResult | null {
  const withMass = reactants.filter(
    (item) => item.massGrams !== null && item.massGrams > 0 && item.parsed.molarMass > 0,
  );
  if (withMass.length === 0 || targetCoefficient <= 0) {
    return null;
  }

  const limiting = withMass.reduce((best, current) => {
    const currentNormalized = current.massGrams! / current.parsed.molarMass / current.coefficient;
    const bestNormalized = best.massGrams! / best.parsed.molarMass / best.coefficient;
    return currentNormalized < bestNormalized ? current : best;
  });
  const limitingNormalized = limiting.massGrams! / limiting.parsed.molarMass / limiting.coefficient;
  const safeYield = Math.min(Math.max(yieldPercent, 0), 100);
  const theoreticalMoles = limitingNormalized * targetCoefficient;
  const theoreticalMass = theoreticalMoles * target.molarMass;

  return {
    rows: reactants.map((item) => {
      const hasMass = item.massGrams !== null && item.massGrams > 0 && item.parsed.molarMass > 0;
      const moles = hasMass ? item.massGrams! / item.parsed.molarMass : null;
      const normalizedMoles = moles === null ? null : moles / item.coefficient;
      const excessMoles = moles === null ? null : Math.max(0, moles - limitingNormalized * item.coefficient);
      return {
        id: item.id,
        formula: item.parsed.formula,
        molarMass: item.parsed.molarMass,
        moles,
        massGrams: hasMass ? item.massGrams : null,
        normalizedMoles,
        excessMoles,
        excessMassGrams: excessMoles === null ? null : excessMoles * item.parsed.molarMass,
        limiting: item.id === limiting.id,
      };
    }),
    limitingId: limiting.id,
    target: {
      formula: target.formula,
      coefficient: targetCoefficient,
      molarMass: target.molarMass,
      theoreticalMoles,
      theoreticalMassGrams: theoreticalMass,
      actualMassGrams: theoreticalMass * (safeYield / 100),
      yieldPercent: safeYield,
    },
  };
}
