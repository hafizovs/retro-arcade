import { Injectable, inject, signal } from '@angular/core';
import { SESSION_UI_UPDATE_MS } from '../../core/constants/arcade.constants';
import {
  ArcadePhase,
  ArcadeTelemetry,
  DifficultyId,
  GameId,
} from '../../core/models/arcade.types';
import { LeaderboardService } from '../leaderboard/leaderboard.service';

function createDefaultTelemetry(): ArcadeTelemetry {
  return {
    currentScore: 0,
    sessionHighScore: 0,
    storedHighScore: 0,
    level: 1,
    tickIntervalMs: 500,
    sessionElapsedMs: 0,
    linesCleared: 0,
    snakeLength: 0,
    bricksRemaining: 0,
  };
}

@Injectable({ providedIn: 'root' })
export class ArcadeStore {
  private readonly leaderboard = inject(LeaderboardService);

  readonly activeGameId = signal<GameId>('tetris');
  readonly phase = signal<ArcadePhase>('idle');
  readonly difficultyId = signal<DifficultyId>('normal');
  readonly telemetry = signal<ArcadeTelemetry>(createDefaultTelemetry());
  readonly lastGameOverReason = signal<'lose' | 'win' | null>(null);

  private sessionStartedAt: number | null = null;
  private sessionAccumulatedMs = 0;
  private sessionClockHandle: ReturnType<typeof setInterval> | null = null;
  private readonly sessionHighByGame: Record<GameId, number> = {
    tetris: 0,
    snake: 0,
    breakout: 0,
  };

  constructor() {
    this.syncStoredHighScore('tetris');
  }

  selectGame(id: GameId): void {
    if (this.activeGameId() === id) {
      return;
    }
    this.activeGameId.set(id);
    this.phase.set('idle');
    this.lastGameOverReason.set(null);
    this.resetSessionClock();
    this.telemetry.set({
      ...createDefaultTelemetry(),
      sessionHighScore: this.sessionHighByGame[id],
      storedHighScore: this.leaderboard.getHighScore(id),
    });
  }

  setPhase(phase: ArcadePhase): void {
    this.phase.set(phase);
  }

  setDifficulty(id: DifficultyId): void {
    if (this.phase() === 'running') {
      return;
    }
    this.difficultyId.set(id);
  }

  updateTelemetry(partial: Partial<ArcadeTelemetry>): void {
    this.telemetry.update((current) => {
      const next = { ...current, ...partial };
      const gameId = this.activeGameId();
      if (typeof partial.currentScore === 'number') {
        this.sessionHighByGame[gameId] = Math.max(
          this.sessionHighByGame[gameId],
          partial.currentScore,
        );
        next.sessionHighScore = this.sessionHighByGame[gameId];
      }
      return next;
    });
  }

  syncStoredHighScore(gameId: GameId = this.activeGameId()): void {
    const score = this.leaderboard.getHighScore(gameId);
    this.telemetry.update((t) => ({ ...t, storedHighScore: score }));
  }

  beginSessionClock(): void {
    this.sessionStartedAt = performance.now();
    if (this.sessionClockHandle !== null) {
      clearInterval(this.sessionClockHandle);
    }
    this.sessionClockHandle = setInterval(() => {
      if (this.sessionStartedAt === null) {
        return;
      }
      const elapsed =
        this.sessionAccumulatedMs +
        (performance.now() - this.sessionStartedAt);
      this.telemetry.update((t) => ({
        ...t,
        sessionElapsedMs: elapsed,
      }));
    }, SESSION_UI_UPDATE_MS);
  }

  pauseSessionClock(): void {
    if (this.sessionStartedAt !== null) {
      this.sessionAccumulatedMs +=
        performance.now() - this.sessionStartedAt;
      this.sessionStartedAt = null;
    }
    if (this.sessionClockHandle !== null) {
      clearInterval(this.sessionClockHandle);
      this.sessionClockHandle = null;
    }
    this.telemetry.update((t) => ({
      ...t,
      sessionElapsedMs: this.sessionAccumulatedMs,
    }));
  }

  resetSessionClock(): void {
    if (this.sessionClockHandle !== null) {
      clearInterval(this.sessionClockHandle);
      this.sessionClockHandle = null;
    }
    this.sessionStartedAt = null;
    this.sessionAccumulatedMs = 0;
    this.telemetry.update((t) => ({ ...t, sessionElapsedMs: 0 }));
  }

  setGameOverReason(reason: 'lose' | 'win'): void {
    this.lastGameOverReason.set(reason);
  }

  resetTelemetryForNewGame(): void {
    const gameId = this.activeGameId();
    this.telemetry.set({
      ...createDefaultTelemetry(),
      sessionHighScore: this.sessionHighByGame[gameId],
      storedHighScore: this.leaderboard.getHighScore(gameId),
    });
  }
}
