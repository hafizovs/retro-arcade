# 03 — Data Model & Types

Все интерфейсы ниже реализуй **буквально** в `src/app/models/arcade.types.ts` (и реэкспорт из modular `core/models/*` при необходимости). Числовые дефолты — в [appendix-a-defaults.md](appendix-a-defaults.md).

---

## 3.1 Идентификаторы и enum/union типы

```ts
export type GameId = 'tetris' | 'snake' | 'breakout';

export type ArcadePhase = 'idle' | 'running' | 'paused' | 'gameover';

export type DifficultyId = 'easy' | 'normal' | 'hard';

export type Direction = 'up' | 'down' | 'left' | 'right';

export type TetrominoType = 'I' | 'J' | 'L' | 'O' | 'S' | 'T' | 'Z';

export type ThemeId = 'dark' | 'light';

export type LocaleId = 'ru' | 'en';
```

---

## 3.2 Game input actions (union)

```ts
export type GameInputAction =
  | { type: 'move'; direction: 'left' | 'right' }
  | { type: 'rotate'; direction: 'cw' | 'ccw' }
  | { type: 'softDrop'; active: boolean }
  | { type: 'hardDrop' }
  | { type: 'snakeDirection'; direction: Direction }
  | { type: 'paddleMove'; x: number }
  | { type: 'paddleNudge'; direction: 'left' | 'right' }
  | { type: 'launchBall' };
```

---

## 3.3 Leaderboard

```ts
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
```

Storage key: `rae-leaderboard-v1` (see appendix A).

---

## 3.4 Arcade session & telemetry

```ts
export interface ArcadeTelemetry {
  currentScore: number;
  sessionHighScore: number;
  storedHighScore: number;
  level: number;
  tickIntervalMs: number;
  sessionElapsedMs: number;
  linesCleared?: number;      // Tetris
  snakeLength?: number;       // Snake
  bricksRemaining?: number;   // Breakout
}

export interface ArcadeStoreState {
  activeGameId: GameId;
  phase: ArcadePhase;
  difficultyId: DifficultyId;
  telemetry: ArcadeTelemetry;
  lastGameOverReason: 'lose' | 'win' | null;
}
```

---

## 3.5 Tetris types

```ts
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
```

**Board indexing:** `board[row][col]`, row `0` = top, row `rows-1` = bottom.

---

## 3.6 Snake types

```ts
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
```

**Snake array order:** index `0` = head, last = tail.

---

## 3.7 Breakout types

```ts
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
```

Coordinates in **pixel space** inside canvas logical size (see appendix A canvas logical size).

---

## 3.8 Tetromino shape definition (for constants file)

```ts
export type ShapeMatrix = readonly (readonly (0 | 1)[])[];

export interface TetrominoDefinition {
  type: TetrominoType;
  rotations: readonly ShapeMatrix[];
  colorVar: string;
}
```

7 types × 4 rotations each (O may repeat). Matrices in [appendix-a-defaults.md](appendix-a-defaults.md) §A.4.

---

## 3.9 UI store

```ts
export interface UiStoreState {
  themeId: ThemeId;
  localeId: LocaleId;
  helpOpen: boolean;
  pauseOverlayOpen: boolean;
  gameOverOverlayOpen: boolean;
  playerNameDraft: string;
}
```

---

## 3.10 Type guards (optional but recommended)

```ts
export function isGameId(value: string): value is GameId {
  return value === 'tetris' || value === 'snake' || value === 'breakout';
}
```

---

## 3.11 Единицы

| Величина | Единица | Пояснение |
|----------|---------|-----------|
| Tetris grid | cells | 10 cols × 20 rows |
| Snake grid | cells | cols × rows from constants |
| Breakout | px | logical canvas coordinates |
| Score | points | integer ≥ 0 |
| Level | integer | ≥ 1; Tetris levels up every N lines |
| tickIntervalMs | ms | gravity/step interval |
| sessionElapsedMs | ms | wall clock since Start |
| Brick durability | hits | 1…3 |

---

## 3.12 Immutability rules

1. Engine `state.update` must produce **new** board/snake/bricks arrays when mutating (OnPush + signals).
2. Do not mutate nested arrays in place without cloning row arrays.
3. `GridCell` objects may be reused only if entire row cloned.

---

## 3.13 Serialization (LocalStorage)

Only `LeaderboardState` is persisted. Game states are **not** persisted between reloads.

```ts
export const LEADERBOARD_STORAGE_KEY = 'rae-leaderboard-v1';
export const LEADERBOARD_SCHEMA_VERSION = 1;
```

Parse with validation: ignore corrupt entries, cap at `LEADERBOARD_MAX_ENTRIES` per game after merge sort.
