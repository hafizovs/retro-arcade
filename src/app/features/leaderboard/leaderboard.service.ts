import { effect, Injectable, signal } from '@angular/core';
import {
  LEADERBOARD_MAX_ENTRIES,
  LEADERBOARD_SCHEMA_VERSION,
  LEADERBOARD_STORAGE_KEY,
} from '../../core/constants/arcade.constants';
import {
  GameId,
  LeaderboardEntry,
  LeaderboardState,
} from '../../core/models/arcade.types';

@Injectable({ providedIn: 'root' })
export class LeaderboardService {
  readonly entries = signal<LeaderboardEntry[]>([]);

  private skipPersist = false;

  constructor() {
    this.load();
    effect(() => {
      const current = this.entries();
      if (this.skipPersist) {
        return;
      }
      this.persist(current);
    });
  }

  load(): void {
    this.skipPersist = true;
    try {
      if (typeof localStorage === 'undefined') {
        this.entries.set([]);
        return;
      }
      const raw = localStorage.getItem(LEADERBOARD_STORAGE_KEY);
      if (!raw) {
        this.entries.set([]);
        return;
      }
      const parsed = JSON.parse(raw) as LeaderboardState;
      if (
        !parsed ||
        parsed.version !== LEADERBOARD_SCHEMA_VERSION ||
        !Array.isArray(parsed.entries)
      ) {
        this.entries.set([]);
        return;
      }
      const valid = parsed.entries.filter(
        (e) =>
          e &&
          typeof e.id === 'string' &&
          typeof e.playerName === 'string' &&
          typeof e.score === 'number' &&
          (e.gameId === 'tetris' ||
            e.gameId === 'snake' ||
            e.gameId === 'breakout'),
      );
      this.entries.set(this.trimAllGames(valid));
    } catch {
      this.entries.set([]);
    } finally {
      queueMicrotask(() => {
        this.skipPersist = false;
      });
    }
  }

  persist(entries: LeaderboardEntry[]): void {
    try {
      const payload: LeaderboardState = {
        version: LEADERBOARD_SCHEMA_VERSION,
        entries,
      };
      localStorage.setItem(LEADERBOARD_STORAGE_KEY, JSON.stringify(payload));
    } catch {
      // ignore quota / private mode errors
    }
  }

  addEntry(entry: Omit<LeaderboardEntry, 'id'>): boolean {
    if (!this.qualifies(entry.gameId, entry.score)) {
      return false;
    }
    const id =
      typeof crypto !== 'undefined' && 'randomUUID' in crypto
        ? crypto.randomUUID()
        : `${Date.now()}-${Math.random().toString(16).slice(2)}`;
    const next = this.trimAllGames([
      ...this.entries(),
      { ...entry, id },
    ]);
    this.entries.set(next);
    return true;
  }

  getTopForGame(gameId: GameId, limit: number): LeaderboardEntry[] {
    return this.entries()
      .filter((e) => e.gameId === gameId)
      .sort((a, b) => {
        if (b.score !== a.score) {
          return b.score - a.score;
        }
        return a.achievedAtIso.localeCompare(b.achievedAtIso);
      })
      .slice(0, limit);
  }

  qualifies(gameId: GameId, score: number): boolean {
    const top = this.getTopForGame(gameId, LEADERBOARD_MAX_ENTRIES);
    if (top.length < LEADERBOARD_MAX_ENTRIES) {
      return true;
    }
    const lowest = top[top.length - 1]?.score ?? 0;
    return score > lowest;
  }

  getHighScore(gameId: GameId): number {
    const top = this.getTopForGame(gameId, 1);
    return top[0]?.score ?? 0;
  }

  private trimAllGames(entries: LeaderboardEntry[]): LeaderboardEntry[] {
    const games: GameId[] = ['tetris', 'snake', 'breakout'];
    const result: LeaderboardEntry[] = [];
    for (const gameId of games) {
      const top = entries
        .filter((e) => e.gameId === gameId)
        .sort((a, b) => {
          if (b.score !== a.score) {
            return b.score - a.score;
          }
          return a.achievedAtIso.localeCompare(b.achievedAtIso);
        })
        .slice(0, LEADERBOARD_MAX_ENTRIES);
      result.push(...top);
    }
    return result;
  }
}
