import { computed, Injectable, signal } from '@angular/core';
import {
  SNAKE_APPLE_SCORE,
  SNAKE_COLS,
  SNAKE_INITIAL_LENGTH,
  SNAKE_MIN_STEP_MS,
  SNAKE_ROWS,
  SNAKE_SPEED_BONUS_EVERY_APPLES,
  SNAKE_SPEED_BONUS_PERCENT,
} from '../core/constants/snake.constants';
import { SNAKE_STEP_MS } from '../core/constants/difficulty.constants';
import {
  DifficultyId,
  Direction,
  GameInputAction,
  GridPoint,
  SnakeState,
} from '../models/arcade.types';
import { createMulberry32, Rng } from '../domain/math/rng';
import { spawnApple } from '../domain/snake/snake.apple';
import { hitsSelf, hitsWall, pointsEqual } from '../domain/snake/snake.collision';
import { isOpposite, nextHead } from '../domain/snake/snake.movement';

function createInitialSnake(): GridPoint[] {
  const headX = Math.floor(SNAKE_COLS / 2);
  const headY = Math.floor(SNAKE_ROWS / 2);
  const snake: GridPoint[] = [];
  for (let i = 0; i < SNAKE_INITIAL_LENGTH; i += 1) {
    snake.push({ x: headX - i, y: headY });
  }
  return snake;
}

function createInitialState(rng: Rng): SnakeState {
  const snake = createInitialSnake();
  const apple =
    spawnApple(snake, SNAKE_COLS, SNAKE_ROWS, rng) ?? { x: 0, y: 0 };
  return {
    cols: SNAKE_COLS,
    rows: SNAKE_ROWS,
    snake,
    direction: 'right',
    queuedDirection: null,
    apple,
    score: 0,
    gameOver: false,
    tickAccumulatorMs: 0,
  };
}

@Injectable({ providedIn: 'root' })
export class SnakeEngineService {
  private rng: Rng = createMulberry32(Date.now());
  private difficulty: DifficultyId = 'normal';
  private applesEaten = 0;

  readonly state = signal<SnakeState>(createInitialState(this.rng));
  readonly score = computed(() => this.state().score);
  readonly level = computed(() => Math.floor(this.applesEaten / 5) + 1);
  readonly isGameOver = computed(() => this.state().gameOver);
  readonly isWin = computed(() => false);

  init(): void {
    this.reset();
  }

  reset(): void {
    this.rng = createMulberry32(Date.now());
    this.applesEaten = 0;
    this.state.set(createInitialState(this.rng));
  }

  setDifficulty(difficulty: DifficultyId): void {
    this.difficulty = difficulty;
  }

  tick(_deltaMs: number): void {
    const current = this.state();
    if (current.gameOver) {
      return;
    }

    let direction = current.direction;
    if (current.queuedDirection !== null) {
      direction = current.queuedDirection;
    }

    const head = current.snake[0];
    const newHead = nextHead(head, direction);

    if (
      hitsWall(newHead, current.cols, current.rows) ||
      hitsSelf(newHead, current.snake)
    ) {
      this.state.set({
        ...current,
        direction,
        queuedDirection: null,
        gameOver: true,
      });
      return;
    }

    const ate = pointsEqual(newHead, current.apple);
    let snake: GridPoint[];
    let score = current.score;
    let apple = current.apple;

    if (ate) {
      snake = [newHead, ...current.snake];
      score += SNAKE_APPLE_SCORE;
      this.applesEaten += 1;
      const nextApple = spawnApple(snake, current.cols, current.rows, this.rng);
      if (!nextApple) {
        this.state.set({
          ...current,
          snake,
          direction,
          queuedDirection: null,
          score,
          gameOver: true,
        });
        return;
      }
      apple = nextApple;
    } else {
      snake = [newHead, ...current.snake.slice(0, current.snake.length - 1)];
    }

    this.state.set({
      ...current,
      snake,
      direction,
      queuedDirection: null,
      apple,
      score,
      tickAccumulatorMs: 0,
    });
  }

  handleInput(action: GameInputAction): void {
    if (action.type !== 'snakeDirection') {
      return;
    }
    const current = this.state();
    if (current.gameOver) {
      return;
    }
    const proposed = action.direction;
    if (isOpposite(current.direction, proposed)) {
      return;
    }
    if (current.queuedDirection === null) {
      this.state.set({ ...current, queuedDirection: proposed });
      return;
    }
    if (!isOpposite(current.direction, proposed)) {
      this.state.set({ ...current, queuedDirection: proposed });
    }
  }

  getTickIntervalMs(difficulty: DifficultyId): number {
    const base = SNAKE_STEP_MS[difficulty];
    const bonuses = Math.floor(
      this.applesEaten / SNAKE_SPEED_BONUS_EVERY_APPLES,
    );
    const factor = Math.max(
      0,
      1 - bonuses * SNAKE_SPEED_BONUS_PERCENT,
    );
    return Math.max(SNAKE_MIN_STEP_MS, Math.floor(base * factor));
  }

  getApplesEaten(): number {
    return this.applesEaten;
  }
}
