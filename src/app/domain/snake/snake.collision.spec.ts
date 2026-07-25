import { describe, expect, it } from 'vitest';
import { hitsSelf, hitsWall } from './snake.collision';

describe('snake.collision', () => {
  it('detects wall collisions', () => {
    expect(hitsWall({ x: -1, y: 0 }, 10, 10)).toBe(true);
    expect(hitsWall({ x: 10, y: 0 }, 10, 10)).toBe(true);
    expect(hitsWall({ x: 0, y: -1 }, 10, 10)).toBe(true);
    expect(hitsWall({ x: 5, y: 5 }, 10, 10)).toBe(false);
  });

  it('detects self collisions', () => {
    const body = [
      { x: 2, y: 2 },
      { x: 1, y: 2 },
      { x: 1, y: 1 },
    ];
    expect(hitsSelf({ x: 1, y: 1 }, body)).toBe(true);
    expect(hitsSelf({ x: 3, y: 2 }, body)).toBe(false);
  });
});
