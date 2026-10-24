import { ParsedFormula } from './formula';

export class BalanceError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'BalanceError';
  }
}

export interface BalancedReaction {
  reactants: number[];
  products: number[];
  coefficients: number[];
}

interface Fraction {
  n: bigint;
  d: bigint;
}

export function balanceReaction(
  reactants: ParsedFormula[],
  products: ParsedFormula[],
): BalancedReaction {
  if (reactants.length === 0 || products.length === 0) {
    throw new BalanceError('Informe pelo menos um reagente e um produto.');
  }

  const species = [...reactants, ...products];
  const elements = [...new Set(species.flatMap((item) => Object.keys(item.counts)))].sort();
  const hasCharge = species.some((item) => item.charge !== 0);
  const rows: bigint[][] = elements.map((element) => {
    return species.map((item, index) => {
      const sign = index < reactants.length ? 1n : -1n;
      return BigInt(item.counts[element] ?? 0) * sign;
    });
  });
  if (hasCharge) {
    rows.push(
      species.map((item, index) => {
        const sign = index < reactants.length ? 1n : -1n;
        return BigInt(item.charge) * sign;
      }),
    );
  }

  const matrix = rows.map((row) => row.map((value) => fraction(value, 1n)));
  const pivotColumns = reducedRowEchelon(matrix);
  const columns = species.length;
  const freeColumns = Array.from({ length: columns }, (_, index) => index).filter(
    (index) => !pivotColumns.includes(index),
  );

  if (freeColumns.length === 0) {
    throw new BalanceError('Não há solução não trivial para essa reação.');
  }
  if (freeColumns.length > 1) {
    throw new BalanceError(
      'Essa combinação tem mais de um balanceamento independente. Reduza o número de espécies ou separe a reação em etapas.',
    );
  }

  const vector: Fraction[] = Array.from({ length: columns }, () => fraction(0n, 1n));
  vector[freeColumns[0]] = fraction(1n, 1n);
  for (let row = 0; row < pivotColumns.length; row += 1) {
    const pivot = pivotColumns[row];
    let value = fraction(0n, 1n);
    for (let column = 0; column < columns; column += 1) {
      if (column === pivot) {
        continue;
      }
      value = addFractions(value, multiplyFractions(matrix[row][column], vector[column]));
    }
    vector[pivot] = negateFraction(value);
  }

  const integers = toIntegers(vector);
  let divisor = integers.reduce((current, value) => gcdBig(current, absBig(value)), 0n);
  if (divisor === 0n) {
    throw new BalanceError('Não foi possível obter coeficientes inteiros.');
  }
  let normalized = integers.map((value) => value / divisor);
  if (normalized.every((value) => value < 0n)) {
    normalized = normalized.map((value) => -value);
  }
  if (normalized.some((value) => value <= 0n)) {
    throw new BalanceError('O balanceamento encontrado tem coeficientes inválidos.');
  }

  const max = BigInt(Number.MAX_SAFE_INTEGER);
  if (normalized.some((value) => value > max)) {
    throw new BalanceError('Os coeficientes são grandes demais para exibir com segurança.');
  }

  const numeric = normalized.map(Number);
  return {
    reactants: numeric.slice(0, reactants.length),
    products: numeric.slice(reactants.length),
    coefficients: numeric,
  };
}

function reducedRowEchelon(matrix: Fraction[][]): number[] {
  const rows = matrix.length;
  const columns = matrix[0]?.length ?? 0;
  const pivots: number[] = [];
  let pivotRow = 0;

  for (let column = 0; column < columns && pivotRow < rows; column += 1) {
    let selected = pivotRow;
    while (selected < rows && matrix[selected][column].n === 0n) {
      selected += 1;
    }
    if (selected === rows) {
      continue;
    }
    [matrix[pivotRow], matrix[selected]] = [matrix[selected], matrix[pivotRow]];
    const pivotValue = matrix[pivotRow][column];
    for (let index = column; index < columns; index += 1) {
      matrix[pivotRow][index] = divideFractions(matrix[pivotRow][index], pivotValue);
    }
    for (let row = 0; row < rows; row += 1) {
      if (row === pivotRow) {
        continue;
      }
      const factor = matrix[row][column];
      if (factor.n === 0n) {
        continue;
      }
      for (let index = column; index < columns; index += 1) {
        matrix[row][index] = subtractFractions(
          matrix[row][index],
          multiplyFractions(factor, matrix[pivotRow][index]),
        );
      }
    }
    pivots.push(column);
    pivotRow += 1;
  }

  return pivots;
}

function toIntegers(vector: Fraction[]): bigint[] {
  const denominator = vector.reduce((current, item) => lcmBig(current, item.d), 1n);
  return vector.map((item) => (item.n * denominator) / item.d);
}

function fraction(n: bigint, d: bigint): Fraction {
  if (d === 0n) {
    throw new BalanceError('Divisão por zero no balanceamento.');
  }
  let numerator = n;
  let denominator = d;
  if (denominator < 0n) {
    numerator = -numerator;
    denominator = -denominator;
  }
  const divisor = gcdBig(absBig(numerator), denominator);
  return { n: numerator / divisor, d: denominator / divisor };
}

function addFractions(a: Fraction, b: Fraction): Fraction {
  return fraction(a.n * b.d + b.n * a.d, a.d * b.d);
}

function subtractFractions(a: Fraction, b: Fraction): Fraction {
  return fraction(a.n * b.d - b.n * a.d, a.d * b.d);
}

function multiplyFractions(a: Fraction, b: Fraction): Fraction {
  return fraction(a.n * b.n, a.d * b.d);
}

function divideFractions(a: Fraction, b: Fraction): Fraction {
  if (b.n === 0n) {
    throw new BalanceError('Divisão por zero no balanceamento.');
  }
  return fraction(a.n * b.d, a.d * b.n);
}

function negateFraction(value: Fraction): Fraction {
  return fraction(-value.n, value.d);
}

function absBig(value: bigint): bigint {
  return value < 0n ? -value : value;
}

function gcdBig(a: bigint, b: bigint): bigint {
  let left = absBig(a);
  let right = absBig(b);
  while (right !== 0n) {
    [left, right] = [right, left % right];
  }
  return left;
}

function lcmBig(a: bigint, b: bigint): bigint {
  if (a === 0n || b === 0n) {
    return 0n;
  }
  return absBig((a / gcdBig(a, b)) * b);
}
