import { TetrominoType } from '../models/arcade.types';

export const TETRIS_ROWS = 20;
export const TETRIS_COLS = 10;
export const SOFT_DROP_MULTIPLIER = 0.05;
export const LOCK_DELAY_MS = 500;
export const LINES_PER_LEVEL = 10;
export const LEVEL_SPEED_STEP = 0.05;
export const MIN_LEVEL_FACTOR = 0.2;
export const SPAWN_COL = Math.floor(TETRIS_COLS / 2) - 2;
export const SPAWN_ROW = 0;
export const HARD_DROP_PER_CELL = 2;
export const SOFT_DROP_PER_CELL = 1;

export const TETROMINO_BAG: readonly TetrominoType[] = [
  'I',
  'J',
  'L',
  'O',
  'S',
  'T',
  'Z',
];

export const WALL_KICK_OFFSETS: readonly { row: number; col: number }[] = [
  { row: 0, col: 0 },
  { row: 0, col: -1 },
  { row: 0, col: 1 },
  { row: -1, col: 0 },
  { row: 0, col: -2 },
  { row: 0, col: 2 },
];

export const TETRIS_COLORS: Record<TetrominoType, string> = {
  I: '#00f0ff',
  O: '#ffaa00',
  T: '#b066ff',
  S: '#39ff88',
  Z: '#ff3355',
  J: '#3366ff',
  L: '#ff8800',
};

export const LINE_SCORE_TABLE: Record<number, number> = {
  1: 100,
  2: 300,
  3: 500,
  4: 800,
};
