import { TETRIS_COLS, TETRIS_ROWS } from '../../core/constants/tetris.constants';
import {
  ActivePiece,
  GridCell,
  TetrominoType,
} from '../../models/arcade.types';
import { getShapeMatrix } from './tetromino-shapes';

export function createEmptyRow(cols: number = TETRIS_COLS): GridCell[] {
  return Array.from({ length: cols }, () => ({ filled: false, type: null }));
}

export function createEmptyBoard(
  rows: number = TETRIS_ROWS,
  cols: number = TETRIS_COLS,
): GridCell[][] {
  return Array.from({ length: rows }, () => createEmptyRow(cols));
}

export function collides(
  board: GridCell[][],
  piece: ActivePiece,
  rowOffset: number,
  colOffset: number,
  rotationIndex: number = piece.rotationIndex,
): boolean {
  const matrix = getShapeMatrix(piece.type, rotationIndex);
  const rows = board.length;
  const cols = board[0]?.length ?? 0;

  for (let sr = 0; sr < matrix.length; sr += 1) {
    for (let sc = 0; sc < matrix[sr].length; sc += 1) {
      if (matrix[sr][sc] !== 1) {
        continue;
      }
      const br = piece.row + sr + rowOffset;
      const bc = piece.col + sc + colOffset;
      if (bc < 0 || bc >= cols || br >= rows) {
        return true;
      }
      if (br >= 0 && board[br][bc].filled) {
        return true;
      }
    }
  }
  return false;
}

export function mergePiece(
  board: GridCell[][],
  piece: ActivePiece,
): GridCell[][] {
  const next = board.map((row) => row.map((cell) => ({ ...cell })));
  const matrix = getShapeMatrix(piece.type, piece.rotationIndex);

  for (let sr = 0; sr < matrix.length; sr += 1) {
    for (let sc = 0; sc < matrix[sr].length; sc += 1) {
      if (matrix[sr][sc] !== 1) {
        continue;
      }
      const br = piece.row + sr;
      const bc = piece.col + sc;
      if (br >= 0 && br < next.length && bc >= 0 && bc < next[0].length) {
        next[br][bc] = { filled: true, type: piece.type };
      }
    }
  }
  return next;
}

export function dropDistance(board: GridCell[][], piece: ActivePiece): number {
  let distance = 0;
  while (!collides(board, piece, distance + 1, 0, piece.rotationIndex)) {
    distance += 1;
  }
  return distance;
}

export function cloneBoard(board: GridCell[][]): GridCell[][] {
  return board.map((row) => row.map((cell) => ({ ...cell })));
}

export function cellTypeAt(
  board: GridCell[][],
  row: number,
  col: number,
): TetrominoType | null {
  if (row < 0 || row >= board.length || col < 0 || col >= board[0].length) {
    return null;
  }
  return board[row][col].type;
}
