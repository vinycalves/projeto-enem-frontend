export type DifficultyTone = 'inicial' | 'intermediaria' | 'avancada' | 'indefinida';
export type EventKindTone = 'inscricao' | 'prova' | 'gabarito' | 'resultado' | 'outro';

const DIFFICULTY_LABELS: Record<DifficultyTone, string> = {
  inicial: 'Inicial',
  intermediaria: 'Intermediária',
  avancada: 'Avançada',
  indefinida: 'Nível não informado',
};

export function difficultyTone(value: string | null | undefined): DifficultyTone {
  const normalized = normalize(value);
  if (['facil', 'inicial', 'easy', 'beginner', 'basico'].includes(normalized)) {
    return 'inicial';
  }
  if (['medio', 'intermediario', 'medium', 'intermediate'].includes(normalized)) {
    return 'intermediaria';
  }
  if (['dificil', 'avancado', 'hard', 'advanced', 'expert'].includes(normalized)) {
    return 'avancada';
  }
  return 'indefinida';
}

export function difficultyLabel(value: string | null | undefined): string {
  const tone = difficultyTone(value);
  if (tone !== 'indefinida') {
    return DIFFICULTY_LABELS[tone];
  }
  return value ? capitalize(value) : DIFFICULTY_LABELS.indefinida;
}

export function eventKindTone(value: string | null | undefined): EventKindTone {
  const normalized = normalize(value);
  if (normalized.includes('inscri') || normalized.includes('enrollment')) {
    return 'inscricao';
  }
  if (normalized.includes('gabarito') || normalized.includes('answer')) {
    return 'gabarito';
  }
  if (normalized.includes('resultado') || normalized.includes('result')) {
    return 'resultado';
  }
  if (normalized.includes('prova') || normalized.includes('exam') || normalized.includes('test')) {
    return 'prova';
  }
  return 'outro';
}

export function eventKindLabel(value: string | null | undefined): string {
  switch (eventKindTone(value)) {
    case 'inscricao':
      return 'Inscrições';
    case 'prova':
      return 'Provas';
    case 'gabarito':
      return 'Gabaritos';
    case 'resultado':
      return 'Resultados';
    default:
      return value ? capitalize(value) : 'Etapa';
  }
}

export function formatAccuracy(value: number | null | undefined): string {
  if (value === null || value === undefined || Number.isNaN(value)) {
    return '—';
  }
  const percentage = value <= 1 ? value * 100 : value;
  return `${Math.round(percentage)}%`;
}

function normalize(value: string | null | undefined): string {
  return (value ?? '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .trim()
    .toLowerCase();
}

function capitalize(value: string): string {
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed.charAt(0).toUpperCase() + trimmed.slice(1) : 'Etapa';
}
