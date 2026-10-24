/**
 * Fixed-timestep loop decoupled from rendering.
 * Simulation code must not import Angular or Three.js.
 */
export class FixedStepLoop {
  private frameId = 0;
  private lastTime = 0;
  private accumulator = 0;
  private running = false;

  constructor(
    private readonly stepSeconds: number,
    private readonly update: (dt: number) => void,
    private readonly render: () => void,
    private readonly maxFrameSeconds = 0.25,
  ) {}

  start(): void {
    if (this.running) {
      return;
    }
    this.running = true;
    this.lastTime = performance.now();
    this.accumulator = 0;
    this.frameId = requestAnimationFrame(this.frame);
  }

  stop(): void {
    this.running = false;
    cancelAnimationFrame(this.frameId);
    this.frameId = 0;
  }

  reset(): void {
    this.accumulator = 0;
    this.lastTime = performance.now();
  }

  /** Testable advance, independent of requestAnimationFrame. */
  advance(deltaSeconds: number): void {
    this.accumulator += Math.min(Math.max(deltaSeconds, 0), this.maxFrameSeconds);
    let safety = 0;
    while (this.accumulator + 1e-9 >= this.stepSeconds && safety < 1000) {
      this.update(this.stepSeconds);
      this.accumulator -= this.stepSeconds;
      safety += 1;
    }
    this.render();
  }

  private readonly frame = (now: number) => {
    if (!this.running) {
      return;
    }
    const elapsed = (now - this.lastTime) / 1000;
    this.lastTime = now;
    this.advance(elapsed);
    this.frameId = requestAnimationFrame(this.frame);
  };
}
