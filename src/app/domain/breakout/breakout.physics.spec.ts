import { describe, expect, it } from 'vitest';
import { reflectPaddle } from './breakout.physics';

describe('breakout.physics', () => {
  const paddle = { x: 200, y: 300, width: 80, height: 12 };
  const speed = 5;

  it('bounces nearly vertical from paddle center', () => {
    const result = reflectPaddle(
      { x: 240, y: 305, radius: 6, dx: 0, dy: speed },
      paddle,
    );
    expect(result).not.toBeNull();
    expect(result!.dy).toBeLessThan(0);
    expect(Math.abs(result!.dx)).toBeLessThan(1);
  });

  it('bounces left from left paddle edge', () => {
    const result = reflectPaddle(
      { x: 200, y: 305, radius: 6, dx: 1, dy: speed },
      paddle,
    );
    expect(result).not.toBeNull();
    expect(result!.dy).toBeLessThan(0);
    expect(result!.dx).toBeLessThan(0);
  });

  it('bounces right from right paddle edge', () => {
    const result = reflectPaddle(
      { x: 280, y: 305, radius: 6, dx: -1, dy: speed },
      paddle,
    );
    expect(result).not.toBeNull();
    expect(result!.dy).toBeLessThan(0);
    expect(result!.dx).toBeGreaterThan(0);
  });
});
