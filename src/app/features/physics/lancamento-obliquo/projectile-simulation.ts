export interface ProjectileParameters {
  speed: number;
  angleDeg: number;
  gravity: number;
}

export interface ProjectilePoint {
  x: number;
  y: number;
  t: number;
}

export interface ProjectileState {
  x: number;
  y: number;
  vx: number;
  vy: number;
  t: number;
  finished: boolean;
}

/**
 * Classical projectile motion without air resistance.
 * Pure TypeScript: no Angular, no Three.js, fixed-step friendly.
 */
export class ProjectileSimulation {
  readonly params: ProjectileParameters;
  readonly trajectory: ProjectilePoint[] = [];
  state: ProjectileState;

  constructor(params: ProjectileParameters) {
    this.params = {
      speed: Math.max(params.speed, 0.001),
      angleDeg: Math.min(Math.max(params.angleDeg, 0.1), 89.9),
      gravity: Math.max(params.gravity, 0.001),
    };
    this.state = this.initialState();
    this.reset();
  }

  get initialSpeedX(): number {
    return this.params.speed * Math.cos((this.params.angleDeg * Math.PI) / 180);
  }

  get initialSpeedY(): number {
    return this.params.speed * Math.sin((this.params.angleDeg * Math.PI) / 180);
  }

  get flightTime(): number {
    return (2 * this.initialSpeedY) / this.params.gravity;
  }

  get range(): number {
    return this.initialSpeedX * this.flightTime;
  }

  get maxHeight(): number {
    return (this.initialSpeedY * this.initialSpeedY) / (2 * this.params.gravity);
  }

  reset(): void {
    this.state = this.initialState();
    this.trajectory.length = 0;
    this.trajectory.push({ x: 0, y: 0, t: 0 });
  }

  step(dt: number): void {
    if (this.state.finished || dt <= 0) {
      return;
    }

    const nextX = this.state.x + this.state.vx * dt;
    const nextVy = this.state.vy - this.params.gravity * dt;
    const nextY = this.state.y + this.state.vy * dt;
    const nextT = this.state.t + dt;

    if (nextY <= 0 && nextT > 0) {
      // Interpolate the final ground contact for a stable trajectory.
      const ratio = this.state.y / Math.max(this.state.y - nextY, 0.000001);
      const impactT = this.state.t + dt * ratio;
      this.state = {
        x: this.state.x + this.state.vx * dt * ratio,
        y: 0,
        vx: this.state.vx,
        vy: this.state.vy - this.params.gravity * dt * ratio,
        t: impactT,
        finished: true,
      };
      this.trajectory.push({ x: this.state.x, y: 0, t: impactT });
      return;
    }

    this.state = {
      x: nextX,
      y: nextY,
      vx: this.state.vx,
      vy: nextVy,
      t: nextT,
      finished: false,
    };
    this.trajectory.push({ x: nextX, y: nextY, t: nextT });
  }

  private initialState(): ProjectileState {
    return {
      x: 0,
      y: 0,
      vx: this.initialSpeedX,
      vy: this.initialSpeedY,
      t: 0,
      finished: false,
    };
  }
}
