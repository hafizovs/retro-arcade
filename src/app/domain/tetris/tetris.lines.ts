import { TETRIS_COLS, TETRIS_ROWS } from '../../core/constants/tetris.constants';
import { GridCell } from '../../models/arcade.types';
import { createEmptyRow } from './tetris.collision';

export function findFullRows(board: GridCell[][]): number[] {
  const fullRows: number[] = [];
  for (let r = 0; r < board.length; r += 1) {
    if (board[r].every((cell) => cell.filled)) {
      fullRows.push(r);
    }
  }
  return fullRows;
}

export function clearLines(board: GridCell[][]): {
  board: GridCell[][];
  count: number;
  clearedRows: number[];
} {
  const fullRows = findFullRows(board);
  if (fullRows.length === 0) {
    return {
      board: board.map((row) => row.map((cell) => ({ ...cell }))),
      count: 0,
      clearedRows: [],
    };
  }

  const fullSet = new Set(fullRows);
  const kept: GridCell[][] = [];
  for (let r = 0; r < board.length; r += 1) {
    if (!fullSet.has(r)) {
      kept.push(board[r].map((cell) => ({ ...cell })));
    }
  }

  const cols = board[0]?.length ?? TETRIS_COLS;
  const rows = board.length || TETRIS_ROWS;
  while (kept.length < rows) {
    kept.unshift(createEmptyRow(cols));
  }

  return {
    board: kept,
    count: fullRows.length,
    clearedRows: fullRows,
  };
}
