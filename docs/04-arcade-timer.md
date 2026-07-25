# 04 — Arcade Timer (requestAnimationFrame)

Реализуй **единый** игровой таймер без Zone.js. Полный код без сокращений. Файл: `src/app/services/arcade-timer.service.ts`.

---

## 4.1 Назначение

- Драйвер игрового цикла через `requestAnimationFrame`.
- Accumulator pattern: накапливать `deltaMs` между кадрами; когда `accumulated >= tickIntervalMs` — вызывать engine tick (возможно несколько tick за кадр при lag spike, cap ниже).
- `frameSignal` — инкремент каждый rAF для перерисовки Canvas (60fps render, lower tick rate logic).

---

## 4.2 API

```ts
@Injectable({ providedIn: 'root' })
export class ArcadeTimerService {
  readonly frameId = signal(0);
  readonly isRunning = signal(false);

  private rafHandle: number | null = null;
  private lastTimestamp = 0;
  private accumulatedMs = 0;
  private tickCallback: ((deltaMs: number) => void) | null = null;
  private tickIntervalMs = 500;

  setTickIntervalMs(ms: number): void;
  start(tickCallback: (deltaMs: number) => void): void;
  pause(): void;
  stop(): void;
}
```

---

## 4.3 Алгоритм loop

```
function loop(now: DOMHighResTimeStamp):
  if !isRunning: return

  if lastTimestamp == 0:
    lastTimestamp = now
  delta = now - lastTimestamp
  lastTimestamp = now

  frameId.update(v => v + 1)

  accumulatedMs += delta
  interval = tickIntervalMs

  ticks = 0
  while accumulatedMs >= interval AND ticks < MAX_TICKS_PER_FRAME:
    tickCallback(interval)
    accumulatedMs -= interval
    ticks += 1

  if accumulatedMs >= interval:
    accumulatedMs = interval - 1   // prevent spiral of death

  rafHandle = requestAnimationFrame(loop)
```

| Константа | Значение | Файл |
|-----------|----------|------|
| `MAX_TICKS_PER_FRAME` | 5 | `arcade.constants.ts` |

---

## 4.4 Lifecycle

### `start(tickCallback)`
1. If already running with same callback — no-op.
2. If running with different callback — `pause()` first.
3. Store callback; `isRunning.set(true)`; `lastTimestamp = 0`; schedule rAF.

### `pause()`
1. `isRunning.set(false)`.
2. `cancelAnimationFrame(rafHandle)`; `rafHandle = null`.
3. Preserve `accumulatedMs` (resume continues smoothly).

### `stop()`
1. `pause()`.
2. `accumulatedMs = 0`; `lastTimestamp = 0`; `tickCallback = null`.

### `setTickIntervalMs(ms)`
1. Clamp `ms` to `[MIN_TICK_MS, MAX_TICK_MS]` from appendix A.
2. Update field; engines call this when difficulty/level changes.

---

## 4.5 Integration with CabinetRoot / ArcadeStore

```ts
// Pseudocode wiring in cabinet-root or arcade.store facade
startGame(): void {
  const engine = this.activeEngine();
  const difficulty = this.arcadeStore.difficultyId();
  this.timer.setTickIntervalMs(engine.getTickIntervalMs(difficulty));
  this.arcadeStore.setPhase('running');
  this.timer.start((deltaMs) => {
    engine.tick(deltaMs);
    this.syncTelemetry();
    if (engine.isGameOver() || engine.isWin()) {
      this.onGameEnd();
    }
  });
}
```

`syncTelemetry()` reads engine signals → updates `ArcadeStore.telemetry`.

---

## 4.6 Session elapsed clock (UI only)

Session wall time **не** должна зависеть от game tick count.

Option A (recommended): `ArcadeStore` holds `sessionStartedAt: number | null`; computed `sessionElapsedMs` from `performance.now() - sessionStartedAt` updated via:
- `effect` tied to `frameId` throttled every 250ms, **or**
- separate lightweight `setInterval(250)` in `ArcadeStore` only for display clock.

Game simulation timing **only** via accumulator ticks above.

---

## 4.7 Destroy cleanup

```ts
constructor() {
  inject(DestroyRef).onDestroy(() => this.stop());
}
```

---

## 4.8 Zoneless note

- Do **not** call `NgZone.run`.
- Canvas `effect(() => { read frameId(); read engine.state(); draw(); })` repaints on every frame.
- Engine `tick` mutates `signal` state → telemetry `@if` bindings update automatically.

---

## 4.9 Tests

`arcade-timer.service.spec.ts` (optional integration):
- Mock `requestAnimationFrame` / `cancelAnimationFrame`.
- Verify `start` increments frameId.
- Verify accumulator fires tickCallback when interval elapsed.

---

## 4.10 Запрещено

- `setInterval` for game simulation ticks.
- Multiple concurrent rAF loops (one service instance only).
- Timer service containing Tetris/Snake/Breakout rules.
