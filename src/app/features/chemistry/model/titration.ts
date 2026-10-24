export type AnalyteStrength = 'strong' | 'weak';

export interface TitrationInputs {
  analyte: AnalyteStrength;
  analyteConcentration: number;
  analyteVolumeMl: number;
  titrantConcentration: number;
  ka: number;
  kw: number;
}

export interface TitrationPoint {
  volumeMl: number;
  pH: number;
}

export interface Indicator {
  id: string;
  name: string;
  lowPh: number;
  highPh: number;
  acidColor: string;
  baseColor: string;
}

const EPSILON = 1e-12;

export class TitrationModel {
  readonly inputs: TitrationInputs;

  constructor(inputs: TitrationInputs) {
    this.inputs = {
      ...inputs,
      analyteConcentration: Math.max(inputs.analyteConcentration, 1e-9),
      analyteVolumeMl: Math.max(inputs.analyteVolumeMl, 0),
      titrantConcentration: Math.max(inputs.titrantConcentration, 1e-9),
      ka: Math.max(inputs.ka, 1e-14),
      kw: Math.max(inputs.kw, 1e-14),
    };
  }

  equivalenceVolumeMl(): number {
    return (
      (this.inputs.analyteConcentration * this.inputs.analyteVolumeMl) /
      this.inputs.titrantConcentration
    );
  }

  pHAt(volumeMl: number): number {
    const volume = Math.max(volumeMl, 0);
    if (this.inputs.analyte === 'strong') {
      return this.strongAcidPH(volume);
    }
    return this.weakAcidPH(volume);
  }

  curve(maxVolumeMl?: number): TitrationPoint[] {
    const equivalence = this.equivalenceVolumeMl();
    const limit = Math.max(maxVolumeMl ?? equivalence * 2, 1);
    const points = 280;
    const result: TitrationPoint[] = [];
    for (let index = 0; index <= points; index += 1) {
      const volume = (limit * index) / points;
      result.push({ volumeMl: volume, pH: this.pHAt(volume) });
    }
    if (equivalence <= limit) {
      result.push({ volumeMl: equivalence, pH: this.pHAt(equivalence) });
      result.sort((a, b) => a.volumeMl - b.volumeMl);
    }
    return result;
  }

  indicatorState(indicator: Indicator, pH: number): 'acid' | 'transition' | 'base' {
    if (pH < indicator.lowPh) {
      return 'acid';
    }
    if (pH > indicator.highPh) {
      return 'base';
    }
    return 'transition';
  }

  private strongAcidPH(volumeMl: number): number {
    const totalVolumeL = (this.inputs.analyteVolumeMl + volumeMl) / 1000;
    if (totalVolumeL <= 0) {
      return 7;
    }
    const acidMoles = this.inputs.analyteConcentration * (this.inputs.analyteVolumeMl / 1000);
    const baseMoles = this.inputs.titrantConcentration * (volumeMl / 1000);
    const difference = acidMoles - baseMoles;
    if (Math.abs(difference) < EPSILON) {
      return 7;
    }
    if (difference > 0) {
      return this.clampPH(-Math.log10(difference / totalVolumeL));
    }
    const hydroxide = -difference / totalVolumeL;
    return this.clampPH(14 + Math.log10(hydroxide));
  }

  /**
   * Exact monoprotic weak-acid/strong-base charge balance, without activity
   * coefficients. Solves h + [Na+] = Kw/h + C_T*Ka/(h + Ka) by bisection.
   */
  private weakAcidPH(volumeMl: number): number {
    const totalVolumeL = (this.inputs.analyteVolumeMl + volumeMl) / 1000;
    if (totalVolumeL <= 0) {
      return 7;
    }
    const totalAcid = this.inputs.analyteConcentration * (this.inputs.analyteVolumeMl / 1000);
    const sodium = this.inputs.titrantConcentration * (volumeMl / 1000);
    const totalConcentration = totalAcid / totalVolumeL;
    const sodiumConcentration = sodium / totalVolumeL;
    const ka = this.inputs.ka;
    const kw = this.inputs.kw;

    const chargeBalance = (h: number): number =>
      h +
      sodiumConcentration -
      kw / Math.max(h, 1e-30) -
      (totalConcentration * ka) / (h + ka);

    let low = 1e-14;
    let high = 1;
    let lowValue = chargeBalance(low);
    let highValue = chargeBalance(high);
    if (lowValue > 0) {
      return 14;
    }
    if (highValue < 0) {
      return 0;
    }

    for (let iteration = 0; iteration < 120; iteration += 1) {
      const middle = Math.sqrt(low * high);
      const middleValue = chargeBalance(middle);
      if (middleValue === 0) {
        low = middle;
        high = middle;
        break;
      }
      if (middleValue * lowValue <= 0) {
        high = middle;
        highValue = middleValue;
      } else {
        low = middle;
        lowValue = middleValue;
      }
    }

    return this.clampPH(-Math.log10((low + high) / 2));
  }

  private clampPH(value: number): number {
    if (!Number.isFinite(value)) {
      return 7;
    }
    return Math.min(14, Math.max(0, value));
  }
}
