export interface PhInputs {
  concentration: number;
  nature: 'acid' | 'base';
  strength: 'strong' | 'weak';
  ionizationConstant: number;
  kw: number;
}

export interface PhResult {
  ph: number;
  poh: number;
  hydrogen: number;
  hydroxide: number;
  degree: number | null;
}

export function calculatePh(inputs: PhInputs): PhResult | null {
  const c = inputs.concentration;
  const kw = inputs.kw;
  if (!Number.isFinite(c) || c <= 0 || !Number.isFinite(kw) || kw <= 0) {
    return null;
  }

  let hydrogen: number;
  let hydroxide: number;
  let degree: number | null = null;

  if (inputs.strength === 'strong') {
    hydrogen = inputs.nature === 'acid' ? c : kw / c;
    hydroxide = kw / hydrogen;
    degree = 1;
  } else {
    const constant = Math.max(inputs.ionizationConstant, 1e-14);
    if (inputs.nature === 'acid') {
      hydrogen = (-constant + Math.sqrt(constant * constant + 4 * constant * c)) / 2;
      hydroxide = kw / hydrogen;
      degree = hydrogen / c;
    } else {
      hydroxide = (-constant + Math.sqrt(constant * constant + 4 * constant * c)) / 2;
      hydrogen = kw / hydroxide;
      degree = hydroxide / c;
    }
  }

  if (!Number.isFinite(hydrogen) || hydrogen <= 0 || !Number.isFinite(hydroxide) || hydroxide <= 0) {
    return null;
  }

  return {
    ph: clamp(-Math.log10(hydrogen)),
    poh: clamp(-Math.log10(hydroxide)),
    hydrogen,
    hydroxide,
    degree,
  };
}

function clamp(value: number): number {
  return Math.min(14, Math.max(0, value));
}
