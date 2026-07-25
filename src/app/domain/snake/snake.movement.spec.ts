import { describe, expect, it } from 'vitest';
import { isOpposite } from './snake.movement';

describe('snake.movement', () => {
  it('rejects opposite directions', () => {
    expect(isOpposite('right', 'left')).toBe(true);
    expect(isOpposite('up', 'down')).toBe(true);
    expect(isOpposite('right', 'up')).toBe(false);
    expect(isOpposite('up', 'left')).toBe(false);
  });
});
