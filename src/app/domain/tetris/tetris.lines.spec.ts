import { describe, expect, it } from 'vitest';
import { createEmptyBoard } from './tetris.collision';
import { clearLines, findFullRows } from './tetris.lines';

describe('tetris.lines', () => {
  it('clears a single full row', () => {
    const board = createEmptyBoard(4, 4);
    for (let c = 0; c < 4; c += 1) {
      board[3][c] = { filled: true, type: 'I' };
    }
    board[2][1] = { filled: true, type: 'T' };

    expect(findFullRows(board)).toEqual([3]);

    const result = clearLines(board);
    expect(result.count).toBe(1);
    expect(result.board.length).toBe(4);
    expect(result.board[3][1].filled).toBe(true);
    expect(result.board[3][1].type).toBe('T');
    expect(result.board[0].every((cell) => !cell.filled)).toBe(true);
  });

  it('clears four full rows (tetris)', () => {
    const board = createEmptyBoard(6, 4);
    for (let r = 2; r < 6; r += 1) {
      for (let c = 0; c < 4; c += 1) {
        board[r][c] = { filled: true, type: 'O' };
      }
    }

    const result = clearLines(board);
    expect(result.count).toBe(4);
    expect(result.board.every((row) => row.every((cell) => !cell.filled))).toBe(
      true,
    );
  });
});
