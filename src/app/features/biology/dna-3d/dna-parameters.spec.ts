import { ParamDefinition } from '../../../shared/ui/parameter-panel/parameter-panel';
import { dnaVisualizationParams } from './dna-parameters';

describe('dnaVisualizationParams', () => {
  it('replaces the automatic-rotation control with the DNA/RNA mode', () => {
    const seed: ParamDefinition[] = [
      {
        id: 'rotacao',
        label: 'Velocidade de rotação',
        kind: 'slider',
        min: 0,
        max: 2,
        step: 0.1,
        default: 0.6,
      },
      { id: 'mostrarPares', label: 'Mostrar pares de bases', kind: 'toggle', default: true },
      { id: 'destacarPar', label: 'Destacar par de bases', kind: 'select', default: 'A-T' },
      {
        id: 'abrirHelice',
        label: 'Abrir a hélice',
        kind: 'slider',
        min: 0,
        max: 1,
        step: 0.05,
        default: 0.1,
      },
    ];

    const params = dnaVisualizationParams(seed);

    expect(params.some((param) => param.id === 'rotacao')).toBe(false);
    expect(params.find((param) => param.id === 'molecule')?.options).toEqual(['DNA', 'RNA']);
    expect(params.find((param) => param.id === 'showBases')).toBeTruthy();
    expect(params.find((param) => param.id === 'opening')).toBeTruthy();
  });

  it('keeps unrelated future parameters from the seed', () => {
    const seed: ParamDefinition[] = [
      { id: 'futureParam', label: 'Futuro', kind: 'toggle', default: true },
    ];

    const params = dnaVisualizationParams(seed);

    expect(params.some((param) => param.id === 'futureParam')).toBe(true);
  });
});
