import { describe, expect, it } from 'vitest';
import { balanceReaction, BalanceError } from './balance';
import { ElementInfo, parseChemicalFormula } from './formula';
import { calculateStoichiometry } from './stoichiometry';

const elements = new Map<string, ElementInfo>([
  ['H', { symbol: 'H', namePt: 'Hidrogênio', atomicMass: 1.008 }],
  ['C', { symbol: 'C', namePt: 'Carbono', atomicMass: 12.011 }],
  ['N', { symbol: 'N', namePt: 'Nitrogênio', atomicMass: 14.007 }],
  ['O', { symbol: 'O', namePt: 'Oxigênio', atomicMass: 15.999 }],
  ['Na', { symbol: 'Na', namePt: 'Sódio', atomicMass: 22.99 }],
  ['Cl', { symbol: 'Cl', namePt: 'Cloro', atomicMass: 35.45 }],
  ['Fe', { symbol: 'Fe', namePt: 'Ferro', atomicMass: 55.845 }],
  ['S', { symbol: 'S', namePt: 'Enxofre', atomicMass: 32.06 }],
  ['Cu', { symbol: 'Cu', namePt: 'Cobre', atomicMass: 63.546 }],
  ['Ca', { symbol: 'Ca', namePt: 'Cálcio', atomicMass: 40.078 }],
]);

const parse = (formula: string) => parseChemicalFormula(formula, elements);

describe('formula parser', () => {
  it('parses parentheses, hydrates and charges', () => {
    expect(parse('Ca(OH)2').counts).toEqual({ Ca: 1, O: 2, H: 2 });
    expect(parse('CuSO4·5H2O').counts).toEqual({ Cu: 1, S: 1, O: 9, H: 10 });
    expect(parse('Fe^3+').charge).toBe(3);
    expect(parse('SO4^2−').charge).toBe(-2);
  });

  it('calculates molar mass', () => {
    expect(parse('H2O').molarMass).toBeCloseTo(18.015, 2);
    expect(parse('CH4').molarMass).toBeCloseTo(16.043, 2);
  });

  it('rejects unknown elements and malformed parentheses', () => {
    expect(() => parse('Xx2O')).toThrow(/desconhecido/);
    expect(() => parse('Ca(OH2')).toThrow(/fechado/);
  });
});

describe('reaction balancer', () => {
  it('balances combustion reactions', () => {
    const result = balanceReaction(
      [parse('CH4'), parse('O2')],
      [parse('CO2'), parse('H2O')],
    );
    expect(result.reactants).toEqual([1, 2]);
    expect(result.products).toEqual([1, 2]);

    const propane = balanceReaction(
      [parse('C3H8'), parse('O2')],
      [parse('CO2'), parse('H2O')],
    );
    expect(propane.coefficients).toEqual([1, 5, 3, 4]);
  });

  it('balances ionic and hydrated reactions', () => {
    const ionic = balanceReaction(
      [parse('Fe^3+'), parse('OH^-')],
      [parse('Fe(OH)3')],
    );
    expect(ionic.coefficients).toEqual([1, 3, 1]);

    const hydrate = balanceReaction(
      [parse('CuSO4·5H2O')],
      [parse('CuSO4'), parse('H2O')],
    );
    expect(hydrate.coefficients).toEqual([1, 1, 5]);
  });

  it('rejects ambiguous or incomplete reactions', () => {
    expect(() => balanceReaction([parse('H2'), parse('O2')], [parse('H2O')])).not.toThrow();
    expect(() =>
      balanceReaction([parse('H2'), parse('O2')], [parse('H2O'), parse('H2O2')]),
    ).toThrow(BalanceError);
  });
});

describe('stoichiometry', () => {
  it('finds the limiting reagent and theoretical product mass', () => {
    const result = calculateStoichiometry(
      [
        {
          id: 'ch4',
          parsed: parse('CH4'),
          coefficient: 1,
          massGrams: 16.043,
        },
        {
          id: 'o2',
          parsed: parse('O2'),
          coefficient: 2,
          massGrams: 32,
        },
      ],
      parse('CO2'),
      1,
      50,
    );

    expect(result?.limitingId).toBe('o2');
    expect(result?.target.theoreticalMassGrams).toBeCloseTo(22.0, 0);
    expect(result?.target.actualMassGrams).toBeCloseTo(11.0, 0);
    expect(result?.rows.find((row) => row.id === 'o2')?.excessMoles).toBeCloseTo(0, 4);
  });
});
