import { FixedStepLoop } from './fixed-step-loop';

describe('FixedStepLoop', () => {
  it('runs the update at a fixed rate independent of the frame delta', () => {
    let updates = 0;
    let renders = 0;
    const loop = new FixedStepLoop(
      0.1,
      (dt) => {
        expect(dt).toBeCloseTo(0.1, 6);
        updates += 1;
      },
      () => {
        renders += 1;
      },
      1,
    );

    loop.advance(0.35);
    expect(updates).toBe(3);
    expect(renders).toBe(1);

    loop.advance(0.01);
    expect(updates).toBe(3);
    loop.advance(0.05);
    expect(updates).toBe(4);
  });

  it('caps a very long frame to avoid a spiral of death', () => {
    let updates = 0;
    const loop = new FixedStepLoop(
      0.1,
      () => {
        updates += 1;
      },
      () => undefined,
      0.25,
    );
    loop.advance(10);
    expect(updates).toBe(2);
  });
});
