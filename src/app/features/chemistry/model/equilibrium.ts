export interface EquilibriumInputs {
  initialN2O4: number;
  initialNO2: number;
  kc: number;
  forwardRate?: number;
}

export interface EquilibriumState {
  n2o4: number;
  no2: number;
  timeSeconds: number;
  q: number;
  kc: number;
  direction: 'forward' | 'reverse' | 'equilibrium';
}

export class EquilibriumModel {
  readonly kc: number;
  readonly forwardRate: number;
  n2o4: number;
  no2: number;
  timeSeconds = 0;

  constructor(inputs: EquilibriumInputs) {
    this.kc = Math.max(inputs.kc, 1e-12);
    this.forwardRate = Math.max(inputs.forwardRate ?? 0.12, 1e-9);
    this.n2o4 = Math.max(inputs.initialN2O4, 1e-9);
    this.no2 = Math.max(inputs.initialNO2, 0);
  }

  reverseRate(): number {
    return this.forwardRate / this.kc;
  }

  q(): number {
    return (this.no2 * this.no2) / Math.max(this.n2o4, 1e-12);
  }

  direction(): EquilibriumState['direction'] {
    const q = this.q();
    const relative = (q - this.kc) / Math.max(this.kc, 1e-12);
    if (Math.abs(relative) < 1e-4) {
      return 'equilibrium';
    }
    return q < this.kc ? 'forward' : 'reverse';
  }

  step(deltaSeconds: number): void {
    const dt = Math.min(Math.max(deltaSeconds, 0), 0.1);
    if (dt === 0) {
      return;
    }
    const rate =
      -this.forwardRate * this.n2o4 + this.reverseRate() * this.no2 * this.no2;
    this.n2o4 = Math.max(0, this.n2o4 + rate * dt);
    this.no2 = Math.max(0, this.no2 - 2 * rate * dt);
    this.timeSeconds += dt;
  }

  equilibrium(): { n2o4: number; no2: number } {
    const a = this.n2o4;
    const b = this.no2;
    const k = this.kc;
    // (b + 2x)^2 / (a - x) = K  ->  4x^2 + (4b + K)x + (b^2 - K a) = 0
    const quadraticA = 4;
    const quadraticB = 4 * b + k;
    const quadraticC = b * b - k * a;
    const discriminant = quadraticB * quadraticB - 4 * quadraticA * quadraticC;
    if (discriminant < 0) {
      return { n2o4: a, no2: b };
    }
    const root = Math.sqrt(discriminant);
    const candidates = [
      (-quadraticB + root) / (2 * quadraticA),
      (-quadraticB - root) / (2 * quadraticA),
    ];
    const physical = candidates.filter(
      (extent) => a - extent >= -1e-12 && b + 2 * extent >= -1e-12,
    );
    if (physical.length === 0) {
      return { n2o4: a, no2: b };
    }
    const extent = physical.reduce((best, current) =>
      Math.abs(current) < Math.abs(best) ? current : best,
    );
    return {
      n2o4: Math.max(0, a - extent),
      no2: Math.max(0, b + 2 * extent),
    };
  }

  addN2O4(amount: number): void {
    this.n2o4 = Math.max(0, this.n2o4 + amount);
  }

  addNO2(amount: number): void {
    this.no2 = Math.max(0, this.no2 + amount);
  }

  compress(factor: number): void {
    const safe = Math.max(factor, 1e-6);
    this.n2o4 *= safe;
    this.no2 *= safe;
  }

  state(): EquilibriumState {
    return {
      n2o4: this.n2o4,
      no2: this.no2,
      timeSeconds: this.timeSeconds,
      q: this.q(),
      kc: this.kc,
      direction: this.direction(),
    };
  }
}
