export const FIRST_EXAM_DATE = new Date(2026, 10, 8);

const DAY_IN_MS = 24 * 60 * 60 * 1000;
const dateFormatter = new Intl.DateTimeFormat('pt-BR', {
  day: '2-digit',
  month: '2-digit',
  year: 'numeric',
});
const longDateFormatter = new Intl.DateTimeFormat('pt-BR', {
  day: 'numeric',
  month: 'long',
  year: 'numeric',
});
const dateTimeFormatter = new Intl.DateTimeFormat('pt-BR', {
  day: '2-digit',
  month: '2-digit',
  year: 'numeric',
  hour: '2-digit',
  minute: '2-digit',
});

function utcDay(date: Date): number {
  return Date.UTC(date.getFullYear(), date.getMonth(), date.getDate());
}

export function daysUntil(target: Date, from = new Date()): number {
  return Math.round((utcDay(target) - utcDay(from)) / DAY_IN_MS);
}

export function daysUntilFirstExam(from = new Date()): number {
  return daysUntil(FIRST_EXAM_DATE, from);
}

export function formatDateBR(value: string | null | undefined): string {
  if (!value) {
    return 'A definir';
  }

  const date = parseDateOnly(value);
  return date ? dateFormatter.format(date) : 'A definir';
}

export function formatLongDateBR(value: string | null | undefined): string {
  if (!value) {
    return 'A definir';
  }

  const date = parseDateOnly(value);
  return date ? longDateFormatter.format(date) : 'A definir';
}

export function formatDateTimeBR(value: string | null | undefined): string {
  if (!value) {
    return '—';
  }

  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? '—' : dateTimeFormatter.format(date);
}

export function formatDateRange(
  startsOn: string | null | undefined,
  endsOn: string | null | undefined,
): string {
  if (!startsOn) {
    return 'A definir';
  }

  if (!endsOn || endsOn === startsOn) {
    return formatLongDateBR(startsOn);
  }

  return `${formatLongDateBR(startsOn)} a ${formatLongDateBR(endsOn)}`;
}

function parseDateOnly(value: string): Date | null {
  const match = /^(\d{4})-(\d{2})-(\d{2})/.exec(value);
  if (match) {
    const year = Number(match[1]);
    const month = Number(match[2]) - 1;
    const day = Number(match[3]);
    const parsed = new Date(year, month, day);
    return Number.isNaN(parsed.getTime()) ? null : parsed;
  }

  const fallback = new Date(value);
  return Number.isNaN(fallback.getTime()) ? null : fallback;
}
