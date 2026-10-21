import {
  ArcadePhase,
  LEADERBOARD_SCHEMA_VERSION,
  LEADERBOARD_STORAGE_KEY,
} from '../models/arcade.types';

export const MIN_TICK_MS = 16;
export const MAX_TICK_MS = 2000;
export const MAX_TICKS_PER_FRAME = 5;
export const SESSION_UI_UPDATE_MS = 250;
export const LEADERBOARD_MAX_ENTRIES = 10;
export { LEADERBOARD_STORAGE_KEY, LEADERBOARD_SCHEMA_VERSION };
export const PLAYER_NAME_MAX_LEN = 16;
export const DEFAULT_PLAYER_NAME = 'Player';
export const DEFAULT_TEST_RNG_SEED = 42;

export const ARCADE_PHASES: readonly ArcadePhase[] = [
  'idle',
  'running',
  'paused',
  'gameover',
] as const;

export const THEME_STORAGE_KEY = 'rae-theme';
export const LOCALE_STORAGE_KEY = 'rae-locale';
