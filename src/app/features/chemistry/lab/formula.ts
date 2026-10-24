export interface ElementInfo {
  symbol: string;
  namePt: string;
  atomicMass: number;
}

export type ElementTable = ReadonlyMap<string, ElementInfo>;

export interface ParsedFormula {
  input: string;
  formula: string;
  counts: Record<string, number>;
  charge: number;
  molarMass: number;
}

export class FormulaParseError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'FormulaParseError';
  }
}

export function parseChemicalFormula(input: string, elements: ElementTable): ParsedFormula {
  const original = input.trim();
  if (!original) {
    throw new FormulaParseError('Digite uma fórmula química.');
  }

  let formula = original.replace(/\s+/g, '').replace(/−/g, '-');
  let charge = 0;
  const chargeMatch = formula.match(/\^\{?(\d*)([+-])\}?$/);
  if (chargeMatch) {
    const magnitude = chargeMatch[1] ? Number(chargeMatch[1]) : 1;
    charge = chargeMatch[2] === '+' ? magnitude : -magnitude;
    formula = formula.slice(0, chargeMatch.index);
  }
  if (!formula) {
    throw new FormulaParseError('A fórmula não pode conter apenas uma carga.');
  }

  const counts: Record<string, number> = {};
  const hydrateParts = formula.split(/[·*]/);
  for (const part of hydrateParts) {
    if (!part) {
      throw new FormulaParseError('Fórmula com separador de hidrato incompleto.');
    }
    let segment = part;
    let multiplier = 1;
    const leading = segment.match(/^(\d+)(.*)$/);
    if (leading && leading[2]) {
      multiplier = Number(leading[1]);
      segment = leading[2];
    }
    const parsed = parseSequence(segment, elements);
    for (const [symbol, count] of Object.entries(parsed)) {
      counts[symbol] = (counts[symbol] ?? 0) + count * multiplier;
    }
  }

  let molarMass = 0;
  for (const [symbol, count] of Object.entries(counts)) {
    const element = elements.get(symbol);
    if (!element) {
      throw new FormulaParseError(`Elemento desconhecido: ${symbol}.`);
    }
    molarMass += element.atomicMass * count;
  }

  return {
    input: original,
    formula,
    counts,
    charge,
    molarMass,
  };
}

export function formulaNotation(parsed: ParsedFormula): string {
  if (parsed.charge === 0) {
    return parsed.formula;
  }
  const magnitude = Math.abs(parsed.charge) === 1 ? '' : String(Math.abs(parsed.charge));
  return `${parsed.formula}^${magnitude}${parsed.charge > 0 ? '+' : '−'}`;
}

export function countAtoms(parsed: ParsedFormula): number {
  return Object.values(parsed.counts).reduce((total, count) => total + count, 0);
}

function parseSequence(
  formula: string,
  elements: ElementTable,
): Record<string, number> {
  let index = 0;
  const parseGroup = (stop: string | null): Record<string, number> => {
    const counts: Record<string, number> = {};
    while (index < formula.length) {
      const character = formula[index];
      if (character === ')' || character === ']') {
        if (!stop) {
          throw new FormulaParseError('Parêntese de fechamento sem abertura.');
        }
        return counts;
      }
      if (character === '(' || character === '[') {
        const closing = character === '(' ? ')' : ']';
        index += 1;
        const inner = parseGroup(closing);
        if (formula[index] !== closing) {
          throw new FormulaParseError('Parêntese não fechado.');
        }
        index += 1;
        const multiplier = readNumber(formula, () => index, (value) => (index = value));
        for (const [symbol, count] of Object.entries(inner)) {
          counts[symbol] = (counts[symbol] ?? 0) + count * multiplier;
        }
        continue;
      }
      if (/[A-Z]/.test(character)) {
        let symbol = character;
        index += 1;
        while (index < formula.length && /[a-z]/.test(formula[index])) {
          symbol += formula[index];
          index += 1;
        }
        if (!elements.has(symbol)) {
          throw new FormulaParseError(`Elemento desconhecido: ${symbol}.`);
        }
        const multiplier = readNumber(formula, () => index, (value) => (index = value));
        counts[symbol] = (counts[symbol] ?? 0) + multiplier;
        continue;
      }
      throw new FormulaParseError(`Trecho inválido na fórmula: “${character}”.`);
    }
    if (stop) {
      throw new FormulaParseError('Parêntese não fechado.');
    }
    return counts;
  };

  return parseGroup(null);
}

function readNumber(
  _formula: string,
  getIndex: () => number,
  setIndex: (value: number) => void,
): number {
  let index = getIndex();
  const start = index;
  let value = 0;
  while (index < _formula.length && /\d/.test(_formula[index])) {
    value = value * 10 + Number(_formula[index]);
    index += 1;
  }
  setIndex(index);
  return index === start ? 1 : value;
}
