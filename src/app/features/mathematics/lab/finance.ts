export interface InterestResult {
  interest: number;
  amount: number;
}

export function percentageOf(value: number, percent: number): number {
  return (value * percent) / 100;
}

export function percentChange(initial: number, final: number): number | null {
  if (!Number.isFinite(initial) || initial === 0 || !Number.isFinite(final)) {
    return null;
  }
  return ((final - initial) / Math.abs(initial)) * 100;
}

export function applySuccessiveChanges(value: number, changesPercent: number[]): number {
  return changesPercent.reduce((current, change) => current * (1 + change / 100), value);
}

export function simpleInterest(capital: number, ratePercent: number, periods: number): InterestResult | null {
  if ([capital, ratePercent, periods].some((value) => !Number.isFinite(value)) || capital < 0 || periods < 0) {
    return null;
  }
  const interest = capital * (ratePercent / 100) * periods;
  return { interest, amount: capital + interest };
}

export function compoundInterest(capital: number, ratePercent: number, periods: number): InterestResult | null {
  if ([capital, ratePercent, periods].some((value) => !Number.isFinite(value)) || capital < 0 || periods < 0) {
    return null;
  }
  const amount = capital * (1 + ratePercent / 100) ** periods;
  return { interest: amount - capital, amount };
}
