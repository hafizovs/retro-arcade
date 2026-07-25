import { computed, Injectable, signal } from '@angular/core';
import {
  BREAKOUT_BALL_RADIUS,
  BREAKOUT_BALL_SPEED,
  BREAKOUT_BRICK_COLS,
  BREAKOUT_BRICK_ROWS,
  BREAKOUT_BRICK_SCORE,
  BREAKOUT_HEIGHT,
  BREAKOUT_LIVES,
  BREAKOUT_PADDLE_HEIGHT,
  BREAKOUT_PADDLE_NUDGE_PX,
  BREAKOUT_PADDLE_SPEED,
  BREAKOUT_PADDLE_WIDTH,
  BREAKOUT_PADDLE_Y_OFFSET,
  BREAKOUT_PHYSICS_TICK_MS,
  BREAKOUT_WIDTH,
} from '../core/constants/breakout.constants';
import { BREAKOUT_BALL_SPEED_MULT } from '../core/constants/difficulty.constants';
import {
  BreakoutState,
  DifficultyId,
  GameInputAction,
} from '../models/arcade.types';
import { clamp } from '../domain/math/clamp';
import {
  countAliveBricks,
  createBrickGrid,
  getBrickLayout,
  getBrickRect,
} from '../domain/breakout/breakout.bricks';
import {
  computeLaunchVelocity,
  moveBall,
  reflectBrick,
  reflectPaddle,
  reflectWall,
} from '../domain/breakout/breakout.physics';

function createInitialState(): BreakoutState {
  const paddleWidth = BREAKOUT_PADDLE_WIDTH;
  const paddleX = (BREAKOUT_WIDTH - paddleWidth) / 2;
  const paddleY = BREAKOUT_HEIGHT - BREAKOUT_PADDLE_Y_OFFSET;
  const ballRadius = BREAKOUT_BALL_RADIUS;
  return {
    width: BREAKOUT_WIDTH,
    height: BREAKOUT_HEIGHT,
    paddle: {
      x: paddleX,
      y: paddleY,
      width: paddleWidth,
      height: BREAKOUT_PADDLE_HEIGHT,
    },
    ball: {
      x: paddleX + paddleWidth / 2,
      y: paddleY - ballRadius - 1,
      radius: ballRadius,
      dx: 0,
      dy: 0,
    },
    bricks: createBrickGrid(BREAKOUT_BRICK_ROWS, BREAKOUT_BRICK_COLS),
    brickRows: BREAKOUT_BRICK_ROWS,
    brickCols: BREAKOUT_BRICK_COLS,
    score: 0,
    lives: BREAKOUT_LIVES,
    gameOver: false,
    win: false,
    ballAttached: true,
    paddleSpeed: BREAKOUT_PADDLE_SPEED,
  };
}

@Injectable({ providedIn: 'root' })
export class BreakoutEngineService {
  private difficulty: DifficultyId = 'normal';

  readonly state = signal<BreakoutState>(createInitialState());
  readonly score = computed(() => this.state().score);
  readonly level = computed(() => 1);
  readonly isGameOver = computed(() => this.state().gameOver);
  readonly isWin = computed(() => this.state().win);

  init(): void {
    this.reset();
  }

  reset(): void {
    this.state.set(createInitialState());
  }

  setDifficulty(difficulty: DifficultyId): void {
    this.difficulty = difficulty;
  }

  tick(_deltaMs: number): void {
    const current = this.state();
    if (current.gameOver || current.win) {
      return;
    }

    if (current.ballAttached) {
      this.state.set({
        ...current,
        ball: {
          ...current.ball,
          x: current.paddle.x + current.paddle.width / 2,
          y: current.paddle.y - current.ball.radius - 1,
          dx: 0,
          dy: 0,
        },
      });
      return;
    }

    const prevY = current.ball.y;
    let ball = moveBall(current.ball);
    const wall = reflectWall(ball, current.width, current.height);
    ball = wall.ball;

    if (wall.lostLife) {
      const lives = current.lives - 1;
      if (lives <= 0) {
        this.state.set({
          ...current,
          ball,
          lives: 0,
          gameOver: true,
          win: false,
        });
        return;
      }
      this.state.set(this.resetBallOnPaddle({ ...current, lives }));
      return;
    }

    const paddleHit = reflectPaddle(ball, current.paddle);
    if (paddleHit) {
      ball = paddleHit;
    }

    let bricks = current.bricks.map((row) => row.map((b) => ({ ...b })));
    let score = current.score;
    const layout = getBrickLayout(
      current.width,
      current.height,
      current.brickRows,
      current.brickCols,
    );

    outer: for (let r = 0; r < bricks.length; r += 1) {
      for (let c = 0; c < bricks[r].length; c += 1) {
        const brick = bricks[r][c];
        if (!brick.alive) {
          continue;
        }
        const rect = getBrickRect(r, c, layout);
        const reflected = reflectBrick(ball, rect, prevY);
        if (!reflected) {
          continue;
        }
        ball = reflected;
        const nextDurability = brick.durability - 1;
        if (nextDurability <= 0) {
          bricks[r][c] = {
            ...brick,
            alive: false,
            durability: 0,
          };
          score += BREAKOUT_BRICK_SCORE * brick.maxDurability;
        } else {
          bricks[r][c] = {
            ...brick,
            durability: nextDurability,
          };
          score += Math.floor(BREAKOUT_BRICK_SCORE / 2);
        }
        break outer;
      }
    }

    const alive = countAliveBricks(bricks);
    if (alive === 0) {
      this.state.set({
        ...current,
        ball,
        bricks,
        score,
        win: true,
        gameOver: true,
      });
      return;
    }

    this.state.set({
      ...current,
      ball,
      bricks,
      score,
    });
  }

  handleInput(action: GameInputAction): void {
    const current = this.state();
    if (current.gameOver) {
      return;
    }

    switch (action.type) {
      case 'paddleMove': {
        const x = clamp(
          action.x,
          0,
          current.width - current.paddle.width,
        );
        this.state.set({
          ...current,
          paddle: { ...current.paddle, x },
          ball: current.ballAttached
            ? {
                ...current.ball,
                x: x + current.paddle.width / 2,
                y: current.paddle.y - current.ball.radius - 1,
              }
            : current.ball,
        });
        break;
      }
      case 'paddleNudge': {
        const delta =
          action.direction === 'left'
            ? -BREAKOUT_PADDLE_NUDGE_PX
            : BREAKOUT_PADDLE_NUDGE_PX;
        const x = clamp(
          current.paddle.x + delta,
          0,
          current.width - current.paddle.width,
        );
        this.state.set({
          ...current,
          paddle: { ...current.paddle, x },
          ball: current.ballAttached
            ? {
                ...current.ball,
                x: x + current.paddle.width / 2,
                y: current.paddle.y - current.ball.radius - 1,
              }
            : current.ball,
        });
        break;
      }
      case 'launchBall': {
        if (!current.ballAttached) {
          return;
        }
        const speed =
          BREAKOUT_BALL_SPEED * BREAKOUT_BALL_SPEED_MULT[this.difficulty];
        const velocity = computeLaunchVelocity(speed, -Math.PI / 2 + 0.2);
        this.state.set({
          ...current,
          ballAttached: false,
          ball: {
            ...current.ball,
            dx: velocity.dx,
            dy: velocity.dy,
          },
        });
        break;
      }
      default:
        break;
    }
  }

  getTickIntervalMs(_difficulty: DifficultyId): number {
    return BREAKOUT_PHYSICS_TICK_MS;
  }

  private resetBallOnPaddle(state: BreakoutState): BreakoutState {
    return {
      ...state,
      ballAttached: true,
      ball: {
        ...state.ball,
        x: state.paddle.x + state.paddle.width / 2,
        y: state.paddle.y - state.ball.radius - 1,
        dx: 0,
        dy: 0,
      },
    };
  }
}
