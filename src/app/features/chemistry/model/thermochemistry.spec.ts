import { describe, expect, it } from 'vitest';
import { ReactionSeed } from '../../../core/api/models/reaction-seed';
import { atomConservation, countElements, deltaHFromFormation } from './thermochemistry';

const methaneReaction: ReactionSeed = {
  id: 'methane-combustion',
  name: 'Combustão do metano',
  classification: 'Combustão',
  equation: 'CH4 + 2O2 -> CO2 + 2H2O',
  species: [
    { side: 'reactant', formula: 'CH4', name: 'Metano', state: 'g', coefficient: 1, charge: 0, atoms: [] },
    { side: 'reactant', formula: 'O2', name: 'Oxigênio', state: 'g', coefficient: 2, charge: 0, atoms: [] },
    { side: 'product', formula: 'CO2', name: 'CO2', state: 'g', coefficient: 1, charge: 0, atoms: [] },
    { side: 'product', formula: 'H2O', name: 'Água', state: 'l', coefficient: 2, charge: 0, atoms: [] },
  ],
  atomMapping: [],
  stages: [],
  enemTopics: [],
  didacticNote: '',
  sources: [],
};

describe('thermochemistry helpers', () => {
  it('counts elements on each side', () => {
    const withAtoms = structuredClone(methaneReaction);
    withAtoms.species[0].atoms = [
      { id: 'c', element: 'C' },
      { id: 'h', element: 'H' },
    ];
    withAtoms.species[2].atoms = [
      { id: 'p-c', element: 'C' },
      { id: 'p-h', element: 'H' },
    ];
    expect(countElements(withAtoms, 'reactant')).toEqual([
      { element: 'C', count: 1 },
      { element: 'H', count: 1 },
    ]);
    expect(atomConservation(withAtoms)).toBe(true);
  });

  it('calculates methane combustion enthalpy from formation data', () => {
    const deltaH = deltaHFromFormation(
      { 'CH4(g)': -74.87, 'CO2(g)': -393.51, 'H2O(l)': -285.83, 'O2(g)': 0 },
      [
        { key: 'CH4(g)', coefficient: 1, side: 'reactant' },
        { key: 'O2(g)', coefficient: 2, side: 'reactant' },
        { key: 'CO2(g)', coefficient: 1, side: 'product' },
        { key: 'H2O(l)', coefficient: 2, side: 'product' },
      ],
    );
    expect(deltaH).toBeCloseTo(-890.3, 1);
  });
});
