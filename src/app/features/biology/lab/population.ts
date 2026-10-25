export interface LogisticInputs {
  initialPopulation: number;
  growthRate: number;
  carryingCapacity: number;
  time: number;
  step?: number;
}

export interface PopulationPoint {
  t: number;
  n: number;
}

export interface LogisticResult {
  points: PopulationPoint[];
  carryingCapacity: number;
  growthRate: number;
}

export function simulateLogistic(inputs: LogisticInputs): LogisticResult | null {
  const { initialPopulation, growthRate, carryingCapacity, time } = inputs;
  const step = inputs.step ?? 0.1;
  if (
    !Number.isFinite(initialPopulation) ||
    initialPopulation < 0 ||
    !Number.isFinite(growthRate) ||
    !Number.isFinite(carryingCapacity) ||
    carryingCapacity <= 0 ||
    !Number.isFinite(time) ||
    time < 0 ||
    !Number.isFinite(step) ||
    step <= 0
  ) {
    return null;
  }

  const points: PopulationPoint[] = [{ t: 0, n: initialPopulation }];
  let n = initialPopulation;
  let t = 0;
  const iterations = Math.min(Math.ceil(time / step), 100000);
  for (let index = 0; index < iterations; index += 1) {
    const dt = Math.min(step, time - t);
    n = Math.max(0, n + dt * growthRate * n * (1 - n / carryingCapacity));
    t += dt;
    points.push({ t, n });
  }
  return { points, carryingCapacity, growthRate };
}
