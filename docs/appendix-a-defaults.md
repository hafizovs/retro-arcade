# Appendix A — Defaults, Ranges & Seed Data

Справочник чисел. Реализации копируют значения в `core/constants/*` **без округления «на глаз»**.

---

## A.1 Arcade / timer

| Константа | Значение |
|-----------|----------|
| `MIN_TICK_MS` | 16 |
| `MAX_TICK_MS` | 2000 |
| `MAX_TICKS_PER_FRAME` | 5 |
| `SESSION_UI_UPDATE_MS` | 250 |
| `LEADERBOARD_MAX_ENTRIES` | 10 |
| `LEADERBOARD_STORAGE_KEY` | `rae-leaderboard-v1` |
| `LEADERBOARD_SCHEMA_VERSION` | 1 |
| `PLAYER_NAME_MAX_LEN` | 16 |
| Default `activeGameId` | `tetris` |
| Default `difficultyId` | `normal` |
| Default `phase` | `idle` |

---

## A.2 Difficulty — Tetris gravity base (ms)

| Difficulty | `TETRIS_GRAVITY_MS` |
|------------|---------------------|
| easy | 800 |
| normal | 500 |
| hard | 300 |

| Константа | Значение |
|-----------|----------|
| `SOFT_DROP_MULTIPLIER` | 0.05 (divide interval → 20× faster) |
| `LOCK_DELAY_MS` | 500 |
| `LINES_PER_LEVEL` | 10 |
| `LEVEL_SPEED_STEP` | 0.05 |
| `MIN_LEVEL_FACTOR` | 0.2 |
| `TETRIS_ROWS` | 20 |
| `TETRIS_COLS` | 10 |

---

## A.3 Difficulty — Snake step (ms)

| Difficulty | `SNAKE_STEP_MS` |
|------------|-----------------|
| easy | 180 |
| normal | 120 |
| hard | 80 |

| Константа | Значение |
|-----------|----------|
| `SNAKE_COLS` | 24 |
| `SNAKE_ROWS` | 18 |
| `SNAKE_INITIAL_LENGTH` | 4 |
| `SNAKE_APPLE_SCORE` | 10 |
| `SNAKE_SPEED_BONUS_EVERY_APPLES` | 5 |
| `SNAKE_SPEED_BONUS_PERCENT` | 0.05 |
| `SNAKE_MIN_STEP_MS` | 50 |

---

## A.4 Difficulty — Breakout

| Difficulty | `BREAKOUT_BALL_SPEED_MULT` |
|------------|----------------------------|
| easy | 0.85 |
| normal | 1.0 |
| hard | 1.2 |

| Константа | Значение |
|-----------|----------|
| `BREAKOUT_PHYSICS_TICK_MS` | 16 |
| `BREAKOUT_WIDTH` | 480 |
| `BREAKOUT_HEIGHT` | 360 |
| `BREAKOUT_BALL_SPEED` | 4.5 (px per tick at normal) |
| `BREAKOUT_BALL_RADIUS` | 6 |
| `BREAKOUT_PADDLE_WIDTH` | 80 |
| `BREAKOUT_PADDLE_HEIGHT` | 12 |
| `BREAKOUT_PADDLE_Y_OFFSET` | 32 (from bottom) |
| `BREAKOUT_PADDLE_NUDGE_PX` | 18 |
| `BREAKOUT_PADDLE_SPEED` | 12 (keyboard nudge per tick optional) |
| `BREAKOUT_LIVES` | 3 |
| `BREAKOUT_BRICK_ROWS` | 6 |
| `BREAKOUT_BRICK_COLS` | 10 |
| `BREAKOUT_BRICK_PADDING` | 4 |
| `BREAKOUT_BRICK_TOP_OFFSET` | 48 |
| `BREAKOUT_BRICK_SCORE` | 10 (× durability on destroy) |

### Brick durability by row (0 = top)

| Row | Durability |
|-----|------------|
| 0 | 3 |
| 1 | 3 |
| 2 | 2 |
| 3 | 2 |
| 4 | 1 |
| 5 | 1 |

`colorIndex = row % 3` → maps to CSS brick colors 1…3.

---

## A.5 Tetris scoring (at level L)

| Lines cleared | Points |
|---------------|--------|
| 1 (single) | `100 * L` |
| 2 (double) | `300 * L` |
| 3 (triple) | `500 * L` |
| 4 (tetris) | `800 * L` |

| Action | Points |
|--------|--------|
| Soft drop (per cell) | 1 |
| Hard drop (per cell) | 2 |

---

## A.6 Tetromino colors (hex for renderer)

| Type | Hex |
|------|-----|
| I | `#00f0ff` |
| O | `#ffaa00` |
| T | `#b066ff` |
| S | `#39ff88` |
| Z | `#ff3355` |
| J | `#3366ff` |
| L | `#ff8800` |

---

## A.7 Tetromino rotation matrices

Each shape: 4 rotations as `0/1` matrices. Implement **exactly** in `tetromino-shapes.ts`.

### I

```
R0:          R1:          R2:          R3:
....         ..0.         ....         .0..
0000         ..0.         ....         .0..
....         ..0.         0000         .0..
....         ..0.         ....         .0..
```

Matrix R0 (4×4):
```
[0,0,0,0]
[1,1,1,1]
[0,0,0,0]
[0,0,0,0]
```

R1:
```
[0,0,1,0]
[0,0,1,0]
[0,0,1,0]
[0,0,1,0]
```

R2 = R0, R3 = R1 (I piece symmetry).

### O (all rotations identical 2×2 effective)

```
R0..R3:
.00.
.00.
....   (pad to 4×4 with zeros)
```

```
[0,1,1,0]
[0,1,1,0]
[0,0,0,0]
[0,0,0,0]
```

### T

R0:
```
[0,1,0,0]
[1,1,1,0]
[0,0,0,0]
[0,0,0,0]
```

R1:
```
[0,1,0,0]
[0,1,1,0]
[0,1,0,0]
[0,0,0,0]
```

R2:
```
[0,0,0,0]
[1,1,1,0]
[0,1,0,0]
[0,0,0,0]
```

R3:
```
[0,1,0,0]
[1,1,0,0]
[0,1,0,0]
[0,0,0,0]
```

### S

R0:
```
[0,1,1,0]
[1,1,0,0]
[0,0,0,0]
[0,0,0,0]
```

R1:
```
[0,1,0,0]
[0,1,1,0]
[0,0,1,0]
[0,0,0,0]
```

R2/R3: mirror rotations of R0/R1 similarly to T pattern.

### Z

R0:
```
[1,1,0,0]
[0,1,1,0]
[0,0,0,0]
[0,0,0,0]
```

R1:
```
[0,0,1,0]
[0,1,1,0]
[0,1,0,0]
[0,0,0,0]
```

### J

R0:
```
[1,0,0,0]
[1,1,1,0]
[0,0,0,0]
[0,0,0,0]
```

R1:
```
[0,1,1,0]
[0,1,0,0]
[0,1,0,0]
[0,0,0,0]
```

R2:
```
[0,0,0,0]
[1,1,1,0]
[0,0,1,0]
[0,0,0,0]
```

R3:
```
[0,1,0,0]
[0,1,0,0]
[1,1,0,0]
[0,0,0,0]
```

### L

R0:
```
[0,0,1,0]
[1,1,1,0]
[0,0,0,0]
[0,0,0,0]
```

R1:
```
[0,1,0,0]
[0,1,0,0]
[0,1,1,0]
[0,0,0,0]
```

R2:
```
[0,0,0,0]
[1,1,1,0]
[1,0,0,0]
[0,0,0,0]
```

R3:
```
[1,1,0,0]
[0,1,0,0]
[0,1,0,0]
[0,0,0,0]
```

> **Генератор:** для S/Z/J/L напиши все 4 матрицы явно в TS — не ссылаться на appendix в runtime.

---

## A.8 Wall kick offsets (test order)

```ts
export const WALL_KICK_OFFSETS = [
  { row: 0, col: 0 },
  { row: 0, col: -1 },
  { row: 0, col: 1 },
  { row: -1, col: 0 },
  { row: 0, col: -2 },
  { row: 0, col: 2 },
];
```

---

## A.9 Spawn position

```ts
export const SPAWN_COL = Math.floor(TETRIS_COLS / 2) - 2;
export const SPAWN_ROW = 0;
```

Adjust piece col after spawn so bounding box centered (engine may add per-type offset).

---

## A.10 Snake initial state

Head at `{ x: floor(cols/2), y: floor(rows/2) }`, body extends left, direction `right`.

---

## A.11 Breakout initial ball

Ball center: `(paddle.x + paddle.width/2, paddle.y - BALL_RADIUS - 1)`, `dx=0`, `dy=0`, `ballAttached=true`.

Launch angles: `dx = sin(angle) * speed`, `dy = -cos(angle) * speed`, angle from paddle hit or default `-π/2`.

---

## A.12 UI layout constants

| Константа | Value |
|-----------|-------|
| `TOOLBAR_HEIGHT_PX` | 52 |
| `LEFT_COLUMN_PX` | 280 |
| `RIGHT_COLUMN_PX` | 240 |
| `CABINET_GAP_PX` | 12 |
| `DESKTOP_BREAKPOINT_PX` | 1200 |

---

## A.13 Default player name

```ts
export const DEFAULT_PLAYER_NAME = 'Player';
```

---

## A.14 RNG default seed (tests)

```ts
export const DEFAULT_TEST_RNG_SEED = 42;
```
