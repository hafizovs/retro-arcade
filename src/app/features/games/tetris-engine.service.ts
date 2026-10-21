import { computed, Injectable, signal } from '@angular/core';
import {
  LOCK_DELAY_MS,
  LINES_PER_LEVEL,
  MIN_LEVEL_FACTOR,
  LEVEL_SPEED_STEP,
  SOFT_DROP_MULTIPLIER,
  SPAWN_COL,
  SPAWN_ROW,
  TETRIS_COLS,
  TETRIS_ROWS,
  TETROMINO_BAG,
  WALL_KICK_OFFSETS,
} from '../../core/constants/tetris.constants';
import { TETRIS_GRAVITY_MS } from '../../core/constants/difficulty.constants';
import { MIN_TICK_MS } from '../../core/constants/arcade.constants';
import {
  ActivePiece,
  DifficultyId,
  GameInputAction,
  TetrisState,
  TetrominoType,
} from '../../core/models/arcade.types';
import { createMulberry32, Rng, shuffleInPlace } from '../../domain/math/rng';
import {
  collides,
  createEmptyBoard,
  dropDistance,
  mergePiece,
} from '../../domain/tetris/tetris.collision';
import { clearLines } from '../../domain/tetris/tetris.lines';
import {
  scoreForLines,
  scoreHardDrop,
  scoreSoftDrop,
} from '../../domain/tetris/tetris.scoring';

function createInitialState(rng: Rng): TetrisState {
  const bag = shuffleInPlace([...TETROMINO_BAG], rng);
  const first = bag.pop()!;
  const next = bag.pop()!;
  return {
    rows: TETRIS_ROWS,
    cols: TETRIS_COLS,
    board: createEmptyBoard(),
    activePiece: null,
    nextPieceType: next,
    score: 0,
    lines: 0,
    level: 1,
    gameOver: false,
    softDropActive: false,
    lockDelayMs: LOCK_DELAY_MS,
    lockTimerMs: 0,
    bag,
  };
}

@Injectable({ providedIn: 'root' })
export class TetrisEngineService {
  private rng: Rng = createMulberry32(Date.now());
  private gravityAccumulatorMs = 0;
  private difficulty: DifficultyId = 'normal';

  readonly state = signal<TetrisState>(createInitialState(this.rng));
  readonly score = computed(() => this.state().score);
  readonly level = computed(() => this.state().level);
  readonly isGameOver = computed(() => this.state().gameOver);
  readonly isWin = computed(() => false);

  init(): void {
    this.reset();
  }

  reset(): void {
    this.rng = createMulberry32(Date.now());
    this.gravityAccumulatorMs = 0;
    const initial = createInitialState(this.rng);
    const withPiece = this.spawnPiece(initial, initial.nextPieceType);
    this.state.set(withPiece);
  }

  setDifficulty(difficulty: DifficultyId): void {
    this.difficulty = difficulty;
  }

  tick(deltaMs: number): void {
    const current = this.state();
    if (current.gameOver || !current.activePiece) {
      return;
    }

    let interval = this.getTickIntervalMs(this.difficulty);
    if (current.softDropActive) {
      interval = Math.max(MIN_TICK_MS, Math.floor(interval * SOFT_DROP_MULTIPLIER));
    }

    this.gravityAccumulatorMs += deltaMs;

    let next = current;
    while (this.gravityAccumulatorMs >= interval) {
      this.gravityAccumulatorMs -= interval;
      next = this.stepGravity(next);
      if (next.gameOver || !next.activePiece) {
        break;
      }
      if (next.softDropActive) {
        next = {
          ...next,
          score: next.score + scoreSoftDrop(1),
        };
      }
      interval = this.getTickIntervalMs(this.difficulty);
      if (next.softDropActive) {
        interval = Math.max(
          MIN_TICK_MS,
          Math.floor(interval * SOFT_DROP_MULTIPLIER),
        );
      }
    }

    this.state.set(next);
  }

  handleInput(action: GameInputAction): void {
    const current = this.state();
    if (current.gameOver || !current.activePiece) {
      return;
    }

    switch (action.type) {
      case 'move': {
        const colDelta = action.direction === 'left' ? -1 : 1;
        if (
          !collides(
            current.board,
            current.activePiece,
            0,
            colDelta,
            current.activePiece.rotationIndex,
          )
        ) {
          this.state.set({
            ...current,
            activePiece: {
              ...current.activePiece,
              col: current.activePiece.col + colDelta,
            },
            lockTimerMs: 0,
          });
        }
        break;
      }
      case 'rotate': {
        if (action.direction === 'cw') {
          this.tryRotate(current);
        }
        break;
      }
      case 'softDrop': {
        this.state.set({ ...current, softDropActive: action.active });
        break;
      }
      case 'hardDrop': {
        this.performHardDrop(current);
        break;
      }
      default:
        break;
    }
  }

  getTickIntervalMs(difficulty: DifficultyId): number {
    const base = TETRIS_GRAVITY_MS[difficulty];
    const level = this.state().level;
    const levelFactor = Math.max(
      MIN_LEVEL_FACTOR,
      1 - (level - 1) * LEVEL_SPEED_STEP,
    );
    return Math.max(MIN_TICK_MS, Math.floor(base * levelFactor));
  }

  private stepGravity(state: TetrisState): TetrisState {
    if (!state.activePiece || state.gameOver) {
      return state;
    }

    if (
      !collides(
        state.board,
        state.activePiece,
        1,
        0,
        state.activePiece.rotationIndex,
      )
    ) {
      return {
        ...state,
        activePiece: {
          ...state.activePiece,
          row: state.activePiece.row + 1,
        },
        lockTimerMs: 0,
      };
    }

    const lockTimerMs = state.lockTimerMs + this.getTickIntervalMs(this.difficulty);
    if (lockTimerMs < state.lockDelayMs) {
      return { ...state, lockTimerMs };
    }

    return this.lockPiece(state);
  }

  private performHardDrop(state: TetrisState): void {
    if (!state.activePiece) {
      return;
    }
    const distance = dropDistance(state.board, state.activePiece);
    const dropped: TetrisState = {
      ...state,
      activePiece: {
        ...state.activePiece,
        row: state.activePiece.row + distance,
      },
      score: state.score + scoreHardDrop(distance),
      lockTimerMs: state.lockDelayMs,
    };
    this.state.set(this.lockPiece(dropped));
  }

  private tryRotate(state: TetrisState): void {
    if (!state.activePiece) {
      return;
    }
    const nextRotation = (state.activePiece.rotationIndex + 1) % 4;
    for (const offset of WALL_KICK_OFFSETS) {
      if (
        !collides(
          state.board,
          state.activePiece,
          offset.row,
          offset.col,
          nextRotation,
        )
      ) {
        this.state.set({
          ...state,
          activePiece: {
            ...state.activePiece,
            rotationIndex: nextRotation,
            row: state.activePiece.row + offset.row,
            col: state.activePiece.col + offset.col,
          },
          lockTimerMs: 0,
        });
        return;
      }
    }
  }

  private lockPiece(state: TetrisState): TetrisState {
    if (!state.activePiece) {
      return state;
    }

    let board = mergePiece(state.board, state.activePiece);
    const cleared = clearLines(board);
    board = cleared.board;
    const lines = state.lines + cleared.count;
    const level = Math.floor(lines / LINES_PER_LEVEL) + 1;
    const score = state.score + scoreForLines(cleared.count, state.level);

    let next: TetrisState = {
      ...state,
      board,
      activePiece: null,
      score,
      lines,
      level,
      lockTimerMs: 0,
      softDropActive: state.softDropActive,
    };

    next = this.spawnPiece(next, next.nextPieceType);
    return next;
  }

  private spawnPiece(state: TetrisState, type: TetrominoType): TetrisState {
    let bag = [...state.bag];
    if (bag.length === 0) {
      bag = shuffleInPlace([...TETROMINO_BAG], this.rng);
    }
    const nextType = bag.pop()!;

    const piece: ActivePiece = {
      type,
      rotationIndex: 0,
      row: SPAWN_ROW,
      col: SPAWN_COL,
    };

    if (collides(state.board, piece, 0, 0, 0)) {
      return {
        ...state,
        bag,
        nextPieceType: nextType,
        activePiece: piece,
        gameOver: true,
      };
    }

    return {
      ...state,
      bag,
      nextPieceType: nextType,
      activePiece: piece,
      lockTimerMs: 0,
    };
  }
}
