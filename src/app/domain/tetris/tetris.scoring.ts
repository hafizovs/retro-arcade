import {
  HARD_DROP_PER_CELL,
  LINE_SCORE_TABLE,
  SOFT_DROP_PER_CELL,
} from '../../core/constants/tetris.constants';

export function scoreForLines(cleared: number, level: number): number {
  if (cleared <= 0) {
    return 0;
  }
  const base = LINE_SCORE_TABLE[cleared] ?? 0;
  return base * Math.max(1, level);
}

export function scoreHardDrop(distance: number): number {
  return Math.max(0, distance) * HARD_DROP_PER_CELL;
}

export function scoreSoftDrop(cells: number): number {
  return Math.max(0, cells) * SOFT_DROP_PER_CELL;
}
