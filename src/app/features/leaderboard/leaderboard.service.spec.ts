import { TestBed } from '@angular/core/testing';
import { beforeEach, describe, expect, it } from 'vitest';
import { LeaderboardService } from './leaderboard.service';

class MemoryStorage implements Storage {
  private readonly map = new Map<string, string>();

  get length(): number {
    return this.map.size;
  }

  clear(): void {
    this.map.clear();
  }

  getItem(key: string): string | null {
    return this.map.has(key) ? this.map.get(key)! : null;
  }

  key(index: number): string | null {
    return [...this.map.keys()][index] ?? null;
  }

  removeItem(key: string): void {
    this.map.delete(key);
  }

  setItem(key: string, value: string): void {
    this.map.set(key, value);
  }
}

describe('LeaderboardService', () => {
  let service: LeaderboardService;
  let storage: MemoryStorage;

  beforeEach(() => {
    storage = new MemoryStorage();
    Object.defineProperty(globalThis, 'localStorage', {
      value: storage,
      configurable: true,
      writable: true,
    });
    TestBed.resetTestingModule();
    TestBed.configureTestingModule({});
    service = TestBed.inject(LeaderboardService);
  });

  it('qualifies when board has free slots', () => {
    expect(service.qualifies('tetris', 10)).toBe(true);
  });

  it('trims to top N per game', () => {
    for (let i = 0; i < 12; i += 1) {
      service.addEntry({
        gameId: 'tetris',
        playerName: `P${i}`,
        score: i * 10,
        achievedAtIso: new Date(2026, 0, i + 1).toISOString(),
        difficulty: 'normal',
      });
    }
    const top = service.getTopForGame('tetris', 20);
    expect(top.length).toBe(10);
    expect(top[0].score).toBe(110);
    expect(top[9].score).toBe(20);
  });
});
