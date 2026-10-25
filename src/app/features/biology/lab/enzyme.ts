export interface EnzymeInputs {
  vmax: number;
  km: number;
  substrate: number;
}

export interface EnzymePoint {
  s: number;
  v: number;
}

export function michaelisMenten(inputs: EnzymeInputs): number | null {
  const { vmax, km, substrate } = inputs;
  if (
    !Number.isFinite(vmax) ||
    vmax <= 0 ||
    !Number.isFinite(km) ||
    km <= 0 ||
    !Number.isFinite(substrate) ||
    substrate < 0
  ) {
    return null;
  }
  return (vmax * substrate) / (km + substrate);
}

export function enzymeCurve(inputs: EnzymeInputs, maxSubstrate = 10, points = 160): EnzymePoint[] {
  if (
    !Number.isFinite(maxSubstrate) ||
    maxSubstrate <= 0 ||
    !Number.isFinite(points) ||
    points < 2
  ) {
    return [];
  }
  const result: EnzymePoint[] = [];
  for (let index = 0; index <= points; index += 1) {
    const s = (maxSubstrate * index) / points;
    const v = michaelisMenten({ ...inputs, substrate: s });
    if (v !== null) {
      result.push({ s, v });
    }
  }
  return result;
}
