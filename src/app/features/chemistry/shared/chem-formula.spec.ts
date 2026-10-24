import { describe, expect, it } from 'vitest';
import { parseFormulaParts } from './chem-formula';

describe('parseFormulaParts', () => {
  it('marks digits after elements as subscripts', () => {
    expect(parseFormulaParts('H2O')).toEqual([
      { text: 'H' },
      { text: '2', script: 'sub' },
      { text: 'O' },
    ]);
  });

  it('supports parentheses and charges', () => {
    expect(parseFormulaParts('Ca(OH)2')).toEqual([
      { text: 'Ca' },
      { text: '(' },
      { text: 'O' },
      { text: 'H' },
      { text: ')' },
      { text: '2', script: 'sub' },
    ]);
    expect(parseFormulaParts('SO4^2-')).toEqual([
      { text: 'S' },
      { text: 'O' },
      { text: '4', script: 'sub' },
      { text: '2−', script: 'sup' },
    ]);
  });
});
