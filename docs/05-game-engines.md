# 05 — Game Engines (Tetris, Snake, Breakout)

Три отдельных сервиса с полной математикой. Формулы — [appendix-b-formulas.md](appendix-b-formulas.md). Константы — [appendix-a-defaults.md](appendix-a-defaults.md). **Никаких заглушек.**

| Service | File |
|---------|------|
| Tetris | `src/app/services/tetris-engine.service.ts` |
| Snake | `src/app/services/snake-engine.service.ts` |
| Breakout | `src/app/services/breakout-engine.service.ts` |

Domain helpers в `src/app/domain/**` — pure functions, покрыты тестами.

---

## 5.1 Общий контракт engine service

Каждый сервис:

```ts
@Injectable({ providedIn: 'root' })
export class TetrisEngineService {
  readonly state = signal<TetrisState>(createInitialState());
  readonly score = computed(() => this.state().score);
  readonly level = computed(() => this.state().level);
  readonly isGameOver = computed(() => this.state().gameOver);
  readonly isWin = computed(() => false);

  init(): void;
  reset(): void;
  tick(deltaMs: number): void;
  handleInput(action: GameInputAction): void;
  getTickIntervalMs(difficulty: DifficultyId): number;
}
```

Snake/Breakout — аналогично (`isWin` только Breakout).

---

## 5.2 Tetris Engine

### 5.2.1 Init / Reset

1. Board `20×10` empty cells.
2. 7-bag randomizer: shuffle `[I,J,L,O,S,T,Z]`, pop for `activePiece` and `nextPieceType`; refill bag when empty.
3. Spawn piece at `{ row: 0, col: floor(cols/2)-2 }` (adjust per shape width); if spawn collision → `gameOver = true`.
4. `score = 0`, `lines = 0`, `level = 1`, lock timers zeroed.

### 5.2.2 Shapes & rotation

- Store in `domain/tetris/tetromino-shapes.ts`: `TETROMINO_DEFINITIONS[type].rotations[0..3]`.
- `rotationIndex` 0…3; rotate CW increments index mod 4.
- **Wall kick (simplified SRS):** on rotate, test offsets `[0,0], [-1,0], [1,0], [0,-1], [-2,0], [2,0]` in order; first valid wins; else revert rotation.

### 5.2.3 Collision test

```ts
function collides(board, piece, rowOffset, colOffset, rotationIndex): boolean
```

For each cell `1` in shape matrix at `(sr, sc)`:
- map to board `(piece.row + sr + rowOffset, piece.col + sc + colOffset)`
- OOB wall/floor OR `board[r][c].filled` → collision.

### 5.2.4 Movement (handleInput)

| Action | Behavior |
|--------|----------|
| `move left/right` | try col ±1 if no collision |
| `rotate cw` | wall kick attempt |
| `softDrop active true` | mark `softDropActive`; faster gravity in tick |
| `hardDrop` | drop until collision, lock immediately, score drop distance |

### 5.2.5 Tick (gravity)

1. If `gameOver` return.
2. Determine gravity interval: base from `getTickIntervalMs(difficulty)` × level factor (appendix A); if `softDropActive` divide by `SOFT_DROP_MULTIPLIER`.
3. On gravity step: try move down 1 row; if collision → start/continue lock delay (`LOCK_DELAY_MS`); when lock timer expires → **lock piece**:
   - Merge cells into board.
   - Clear full lines (`domain/tetris/tetris.lines.ts`).
   - Add score (`tetris.scoring.ts`).
   - Spawn next piece; check game over on spawn.
4. Level up every `LINES_PER_LEVEL` lines cleared.

### 5.2.6 Line clear

Row full if every cell `filled`. Remove rows, insert empty rows at top. Count `cleared` 1…4 → scoring table (single/double/triple/tetris).

### 5.2.7 getTickIntervalMs

```
base = TETRIS_GRAVITY_MS[difficulty]
levelFactor = max(MIN_LEVEL_FACTOR, 1 - (level - 1) * LEVEL_SPEED_STEP)
return floor(base * levelFactor)
```

---

## 5.3 Snake Engine

### 5.3.1 Init / Reset

1. Grid `SNAKE_COLS × SNAKE_ROWS`.
2. Snake length `SNAKE_INITIAL_LENGTH` centered horizontally, facing `right`.
3. Spawn apple via `spawnApple(snakeBody)` — uniform random empty cell.
4. `score = 0`, `gameOver = false`, `queuedDirection = null`.

### 5.3.2 Direction input

On `snakeDirection`:
1. Proposed direction must not be **opposite** to current (`isOpposite` — appendix B).
2. If no queued direction, queue if valid; else queue replaces if valid (max 1 queued — **канон:** `queuedDirection` single slot; ignore further until consumed).

### 5.3.3 Tick

1. If `gameOver` return.
2. Every `getTickIntervalMs(difficulty)` ms:
   - Apply `queuedDirection` to `direction` if set; clear queue.
   - Compute new head cell from direction.
   - **Wall collision:** head OOB → game over.
   - **Self collision:** head equals any body segment → game over.
   - **Eat apple:** if head equals apple → score += `SNAKE_APPLE_SCORE`; grow (don't pop tail); spawn new apple.
   - **Else:** move — push head, pop tail.
3. Update `state` immutably.

### 5.3.4 getTickIntervalMs

Return `SNAKE_STEP_MS[difficulty]` from constants (optionally decrease slightly every N apples — optional bonus speed every 5 apples −5% min 50ms).

---

## 5.4 Breakout Engine

### 5.4.1 Init / Reset

1. Canvas logical size `BREAKOUT_WIDTH × BREAKOUT_HEIGHT`.
2. Paddle centered bottom; ball on paddle center, `ballAttached = true`, velocity zero.
3. Brick grid `BRICK_ROWS × BRICK_COLS` with durability pattern row-wise (appendix A).
4. `lives = BREAKOUT_LIVES`, `score = 0`, `gameOver = false`, `win = false`.

### 5.4.2 Input

| Action | Behavior |
|--------|----------|
| `paddleMove x` | set paddle.x clamped `[0, width - paddle.width]` |
| `paddleNudge left/right` | x ± `PADDLE_NUDGE_PX` clamped |
| `launchBall` | if attached: set dx/dy from `BREAKOUT_BALL_SPEED * difficultyMult`, `ballAttached = false` |

### 5.4.3 Tick (when ball moving)

1. Update ball position: `x += dx`, `y += dy`.
2. **Wall bounce:** left/right/top — invert dx or dy (appendix B).
3. **Paddle collision:** AABB ball vs paddle; if overlap from above → angle bounce from hit position on paddle (appendix B.4).
4. **Brick collision:** iterate bricks; on first hit reduce durability; if 0 mark dead, add score, invert dy (or compute reflection); break inner loop.
5. **Bottom miss:** if ball.y - r > height → lose life; reset ball attached or game over if lives 0.
6. **Win:** all bricks dead → `win = true`, `gameOver = true`.

### 5.4.4 Paddle follow mouse

`CabinetRoot` passes pointer X mapped to canvas coords → `handleInput({ type: 'paddleMove', x })` each move event (throttle optional 16ms).

### 5.4.5 getTickIntervalMs

Breakout uses **per-frame** physics (every timer tick at ~16ms logical) OR fixed `BREAKOUT_PHYSICS_STEP_MS`. **Канон:** `tickIntervalMs = 16` (60 updates/sec) independent of difficulty; difficulty scales `BALL_SPEED_MULTIPLIER[difficulty]`.

---

## 5.5 Domain file map

| File | Functions |
|------|-----------|
| `tetromino-shapes.ts` | `TETROMINO_DEFINITIONS`, `getShapeMatrix(type, rotIndex)` |
| `tetris.collision.ts` | `collides`, `mergePiece`, `dropDistance` |
| `tetris.lines.ts` | `findFullRows`, `clearLines` |
| `tetris.scoring.ts` | `scoreForLines`, `scoreHardDrop` |
| `snake.movement.ts` | `nextHead`, `isOpposite`, `moveSnake` |
| `snake.collision.ts` | `hitsWall`, `hitsSelf` |
| `snake.apple.ts` | `spawnApple` |
| `breakout.physics.ts` | `moveBall`, `reflectWall`, `reflectPaddle`, `reflectBrick` |
| `breakout.collision.ts` | `ballPaddleHit`, `ballBrickHit` |
| `breakout.bricks.ts` | `createBrickGrid`, `countAliveBricks` |

---

## 5.6 Randomness

Use `domain/math/rng.ts` — mulberry32 seeded per session (`Date.now()` on reset OK) for reproducible tests with fixed seed.

7-bag Tetris: Fisher-Yates shuffle.

---

## 5.7 Engine tests (minimum)

| Test | Assert |
|------|--------|
| `tetris.lines.spec` | 1/2/3/4 line clears remove correct rows |
| `tetris.scoring.spec` | tetris = 800 × level (or table A) |
| `snake.collision.spec` | opposite turn rejected |
| `snake.collision.spec` | head into body → true |
| `breakout.physics.spec` | center paddle hit → ~vertical; edge → steep angle |

---

## 5.8 Запрещено

- Empty `tick()` body.
- Tetris without all 7 piece types.
- Snake teleport through self.
- Breakout uniform bounce ignoring paddle X.
- Storing engine state only in component fields without signals.
