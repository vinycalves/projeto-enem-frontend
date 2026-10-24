import { ProjectileSimulation } from './projectile-simulation';

describe('ProjectileSimulation', () => {
  it('matches the analytical range at 45 degrees', () => {
    const simulation = new ProjectileSimulation({ speed: 30, angleDeg: 45, gravity: 9.8 });
    for (let index = 0; index < 20_000 && !simulation.state.finished; index += 1) {
      simulation.step(1 / 240);
    }

    expect(Math.abs(simulation.state.x - simulation.range)).toBeLessThan(0.2);
    expect(simulation.flightTime).toBeCloseTo((2 * 30 * Math.sin(Math.PI / 4)) / 9.8, 4);
  });

  it('matches the analytical maximum height', () => {
    const simulation = new ProjectileSimulation({ speed: 24, angleDeg: 60, gravity: 9.8 });
    let maxY = 0;
    for (let index = 0; index < 20_000 && !simulation.state.finished; index += 1) {
      simulation.step(1 / 240);
      maxY = Math.max(maxY, simulation.state.y);
    }
    expect(Math.abs(maxY - simulation.maxHeight)).toBeLessThan(0.2);
  });

  it('does not move vertically in free fall before the first step', () => {
    const simulation = new ProjectileSimulation({ speed: 20, angleDeg: 30, gravity: 10 });
    expect(simulation.state.x).toBe(0);
    expect(simulation.state.y).toBe(0);
    simulation.step(0.1);
    expect(simulation.state.x).toBeGreaterThan(0);
    expect(simulation.state.y).toBeGreaterThan(0);
  });

  it('stops at ground level and is idempotent after finishing', () => {
    const simulation = new ProjectileSimulation({ speed: 10, angleDeg: 20, gravity: 9.8 });
    for (let index = 0; index < 20_000 && !simulation.state.finished; index += 1) {
      simulation.step(1 / 240);
    }
    const x = simulation.state.x;
    simulation.step(1 / 60);
    expect(simulation.state.finished).toBe(true);
    expect(simulation.state.x).toBe(x);
    expect(simulation.state.y).toBe(0);
  });
});
