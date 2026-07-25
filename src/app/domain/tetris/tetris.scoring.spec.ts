import { describe, expect, it } from 'vitest';
import { scoreForLines, scoreHardDrop } from './tetris.scoring';

describe('tetris.scoring', () => {
  it('scores single/double/triple/tetris by level', () => {
    expect(scoreForLines(1, 2)).toBe(200);
    expect(scoreForLines(2, 1)).toBe(300);
    expect(scoreForLines(3, 3)).toBe(1500);
    expect(scoreForLines(4, 2)).toBe(1600);
  });

  it('scores hard drop by distance', () => {
    expect(scoreHardDrop(5)).toBe(10);
    expect(scoreHardDrop(0)).toBe(0);
  });
});
