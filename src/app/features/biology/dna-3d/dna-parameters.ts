import { ParamDefinition } from '../../../shared/ui/parameter-panel/parameter-panel';

/**
 * The DNA visualization seed predates the RNA mode and still exposes an
 * automatic-rotation slider. The visualization is intentionally manual, so the
 * host replaces those legacy controls with the curated set below.
 */
export const NUCLEIC_ACID_PARAMETERS: ParamDefinition[] = [
  {
    id: 'molecule',
    label: 'Molécula',
    kind: 'select',
    default: 'DNA',
    options: ['DNA', 'RNA'],
  },
  {
    id: 'showBases',
    label: 'Mostrar bases nitrogenadas',
    kind: 'toggle',
    default: true,
  },
  {
    id: 'highlight',
    label: 'Destacar bases',
    kind: 'select',
    default: 'A (A–T/A–U)',
    options: ['A (A–T/A–U)', 'C (C–G)'],
  },
  {
    id: 'opening',
    label: 'Abertura visual da hélice (modo DNA)',
    kind: 'slider',
    min: 0,
    max: 1,
    step: 0.05,
    default: 0.1,
  },
];

const NUCLEIC_ACID_PARAM_IDS = new Set([
  'molecule',
  'showBases',
  'highlight',
  'opening',
  'rotacao',
  'mostrarPares',
  'destacarPar',
  'abrirHelice',
]);

/**
 * Keep any future seed-specific parameters while dropping the obsolete
 * automatic-rotation and DNA-only controls.
 */
export function dnaVisualizationParams(params: ParamDefinition[]): ParamDefinition[] {
  return [
    ...NUCLEIC_ACID_PARAMETERS,
    ...params.filter((param) => !NUCLEIC_ACID_PARAM_IDS.has(param.id)),
  ];
}
