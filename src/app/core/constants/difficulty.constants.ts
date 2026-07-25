import { DifficultyId } from '../../models/arcade.types';

export const TETRIS_GRAVITY_MS: Record<DifficultyId, number> = {
  easy: 800,
  normal: 500,
  hard: 300,
};

export const SNAKE_STEP_MS: Record<DifficultyId, number> = {
  easy: 180,
  normal: 120,
  hard: 80,
};

export const BREAKOUT_BALL_SPEED_MULT: Record<DifficultyId, number> = {
  easy: 0.85,
  normal: 1.0,
  hard: 1.2,
};

export const DIFFICULTY_IDS: readonly DifficultyId[] = [
  'easy',
  'normal',
  'hard',
];
