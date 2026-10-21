import { DestroyRef, inject, Injectable, signal } from '@angular/core';
import {
  MAX_TICK_MS,
  MAX_TICKS_PER_FRAME,
  MIN_TICK_MS,
} from '../../core/constants/arcade.constants';
import { clamp } from '../../domain/math/clamp';

@Injectable({ providedIn: 'root' })
export class ArcadeTimerService {
  readonly frameId = signal(0);
  readonly isRunning = signal(false);

  private rafHandle: number | null = null;
  private lastTimestamp = 0;
  private accumulatedMs = 0;
  private tickCallback: ((deltaMs: number) => void) | null = null;
  private tickIntervalMs = 500;

  constructor() {
    inject(DestroyRef).onDestroy(() => this.stop());
  }

  setTickIntervalMs(ms: number): void {
    this.tickIntervalMs = clamp(ms, MIN_TICK_MS, MAX_TICK_MS);
  }

  getTickIntervalMs(): number {
    return this.tickIntervalMs;
  }

  start(tickCallback: (deltaMs: number) => void): void {
    if (this.isRunning() && this.tickCallback === tickCallback) {
      return;
    }
    if (this.isRunning()) {
      this.pause();
    }
    this.tickCallback = tickCallback;
    this.isRunning.set(true);
    this.lastTimestamp = 0;
    this.rafHandle = requestAnimationFrame((now) => this.loop(now));
  }

  pause(): void {
    this.isRunning.set(false);
    if (this.rafHandle !== null) {
      cancelAnimationFrame(this.rafHandle);
      this.rafHandle = null;
    }
  }

  stop(): void {
    this.pause();
    this.accumulatedMs = 0;
    this.lastTimestamp = 0;
    this.tickCallback = null;
  }

  private loop(now: DOMHighResTimeStamp): void {
    if (!this.isRunning()) {
      return;
    }

    if (this.lastTimestamp === 0) {
      this.lastTimestamp = now;
    }
    const delta = now - this.lastTimestamp;
    this.lastTimestamp = now;

    this.frameId.update((v) => v + 1);

    this.accumulatedMs += delta;
    const interval = this.tickIntervalMs;

    let ticks = 0;
    while (
      this.accumulatedMs >= interval &&
      ticks < MAX_TICKS_PER_FRAME &&
      this.tickCallback
    ) {
      this.tickCallback(interval);
      this.accumulatedMs -= interval;
      ticks += 1;
    }

    if (this.accumulatedMs >= interval) {
      this.accumulatedMs = interval - 1;
    }

    this.rafHandle = requestAnimationFrame((t) => this.loop(t));
  }
}
