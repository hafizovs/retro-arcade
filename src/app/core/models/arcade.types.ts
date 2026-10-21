export type GameId = 'tetris' | 'snake' | 'breakout';

export type ArcadePhase = 'idle' | 'running' | 'paused' | 'gameover';

export type DifficultyId = 'easy' | 'normal' | 'hard';

export type Direction = 'up' | 'down' | 'left' | 'right';

export type TetrominoType = 'I' | 'J' | 'L' | 'O' | 'S' | 'T' | 'Z';

export type ThemeId = 'dark' | 'light';

export type LocaleId = 'ru' | 'en';

export type GameInputAction =
  | { type: 'move'; direction: 'left' | 'right' }
  | { type: 'rotate'; direction: 'cw' | 'ccw' }
  | { type: 'softDrop'; active: boolean }
  | { type: 'hardDrop' }
  | { type: 'snakeDirection'; direction: Direction }
  | { type: 'paddleMove'; x: number }
  | { type: 'paddleNudge'; direction: 'left' | 'right' }
  | { type: 'launchBall' };

export interface LeaderboardEntry {
  id: string;
  gameId: GameId;
  playerName: string;
  score: number;
  achievedAtIso: string;
  difficulty: DifficultyId;
}

export interface LeaderboardState {
  entries: LeaderboardEntry[];
  version: number;
}

export interface ArcadeTelemetry {
  currentScore: number;
  sessionHighScore: number;
  storedHighScore: number;
  level: number;
  tickIntervalMs: number;
  sessionElapsedMs: number;
  linesCleared?: number;
  snakeLength?: number;
  bricksRemaining?: number;
}

export interface ArcadeStoreState {
  activeGameId: GameId;
  phase: ArcadePhase;
  difficultyId: DifficultyId;
  telemetry: ArcadeTelemetry;
  lastGameOverReason: 'lose' | 'win' | null;
}

export interface GridCell {
  filled: boolean;
  type: TetrominoType | null;
}

export interface ActivePiece {
  type: TetrominoType;
  rotationIndex: number;
  row: number;
  col: number;
}

export interface TetrisState {
  rows: number;
  cols: number;
  board: GridCell[][];
  activePiece: ActivePiece | null;
  nextPieceType: TetrominoType;
  score: number;
  lines: number;
  level: number;
  gameOver: boolean;
  softDropActive: boolean;
  lockDelayMs: number;
  lockTimerMs: number;
  bag: TetrominoType[];
}

export interface GridPoint {
  x: number;
  y: number;
}

export interface SnakeState {
  cols: number;
  rows: number;
  snake: GridPoint[];
  direction: Direction;
  queuedDirection: Direction | null;
  apple: GridPoint;
  score: number;
  gameOver: boolean;
  tickAccumulatorMs: number;
}

export interface Vec2 {
  x: number;
  y: number;
}

export interface BrickCell {
  alive: boolean;
  durability: number;
  maxDurability: number;
  colorIndex: number;
}

export interface BreakoutState {
  width: number;
  height: number;
  paddle: { x: number; y: number; width: number; height: number };
  ball: { x: number; y: number; radius: number; dx: number; dy: number };
  bricks: BrickCell[][];
  brickRows: number;
  brickCols: number;
  score: number;
  lives: number;
  gameOver: boolean;
  win: boolean;
  ballAttached: boolean;
  paddleSpeed: number;
}

export type ShapeMatrix = readonly (readonly (0 | 1)[])[];

export interface TetrominoDefinition {
  type: TetrominoType;
  rotations: readonly ShapeMatrix[];
  colorVar: string;
}

export interface UiStoreState {
  themeId: ThemeId;
  localeId: LocaleId;
  helpOpen: boolean;
  pauseOverlayOpen: boolean;
  gameOverOverlayOpen: boolean;
  playerNameDraft: string;
}

export const LEADERBOARD_STORAGE_KEY = 'rae-leaderboard-v1';
export const LEADERBOARD_SCHEMA_VERSION = 1;

export function isGameId(value: string): value is GameId {
  return value === 'tetris' || value === 'snake' || value === 'breakout';
}

export function isDifficultyId(value: string): value is DifficultyId {
  return value === 'easy' || value === 'normal' || value === 'hard';
}
