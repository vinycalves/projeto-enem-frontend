export function classicalProbability(favorable: number, total: number): number | null {
  if (
    !Number.isFinite(favorable) ||
    !Number.isFinite(total) ||
    favorable < 0 ||
    total <= 0 ||
    favorable > total
  ) {
    return null;
  }
  return favorable / total;
}

export function factorial(n: number): number | null {
  if (!Number.isInteger(n) || n < 0 || n > 170) {
    return null;
  }
  let result = 1;
  for (let value = 2; value <= n; value += 1) {
    result *= value;
  }
  return result;
}

export function permutation(n: number, p: number): number | null {
  if (!Number.isInteger(n) || !Number.isInteger(p) || n < 0 || p < 0 || p > n) {
    return null;
  }
  const nFactorial = factorial(n);
  const remainder = factorial(n - p);
  if (nFactorial === null || remainder === null) {
    return null;
  }
  return nFactorial / remainder;
}

export function combination(n: number, p: number): number | null {
  if (!Number.isInteger(n) || !Number.isInteger(p) || n < 0 || p < 0 || p > n) {
    return null;
  }
  const permutations = permutation(n, p);
  const pFactorial = factorial(p);
  if (permutations === null || pFactorial === null) {
    return null;
  }
  return permutations / pFactorial;
}
