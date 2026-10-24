const SUPERSCRIPTS: Record<string, string> = {
  '0': '⁰',
  '1': '¹',
  '2': '²',
  '3': '³',
  '4': '⁴',
  '5': '⁵',
  '6': '⁶',
  '7': '⁷',
  '8': '⁸',
  '9': '⁹',
  '-': '⁻',
  '+': '⁺',
};

export function formatNumber(value: number, digits = 2): string {
  if (!Number.isFinite(value)) {
    return '—';
  }
  return new Intl.NumberFormat('pt-BR', {
    minimumFractionDigits: digits,
    maximumFractionDigits: digits,
  }).format(value);
}

export function formatScientific(value: number, digits = 2): string {
  if (!Number.isFinite(value) || value === 0) {
    return value === 0 ? '0' : '—';
  }
  const [mantissa, exponent] = value.toExponential(digits).split('e');
  const formattedMantissa = mantissa.replace('.', ',');
  const exponentNumber = Number(exponent);
  const exponentText = String(exponentNumber)
    .split('')
    .map((character) => SUPERSCRIPTS[character] ?? character)
    .join('');
  return `${formattedMantissa} × 10${exponentText}`;
}

export function formatPh(value: number): string {
  return formatNumber(value, 2).replace(',00', ',0');
}

export function normalizeMinus(value: string): string {
  return value.replace(/-/g, '−');
}
