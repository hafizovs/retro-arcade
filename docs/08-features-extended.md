# 08 — Extended Features

Все фичи этого документа **обязательны**. Не помечай их optional в коде.

---

## 8.1 Leaderboard & LocalStorage

### LeaderboardService

File: `src/app/services/leaderboard.service.ts`

```ts
@Injectable({ providedIn: 'root' })
export class LeaderboardService {
  readonly entries = signal<LeaderboardEntry[]>([]);

  constructor() {
    this.load();
    effect(() => this.persist(this.entries()));
  }

  load(): void;
  persist(entries: LeaderboardEntry[]): void;
  addEntry(entry: Omit<LeaderboardEntry, 'id'>): boolean;
  getTopForGame(gameId: GameId, limit: number): LeaderboardEntry[];
  qualifies(gameId: GameId, score: number): boolean;
}
```

### load()
1. Read `localStorage.getItem('rae-leaderboard-v1')`.
2. JSON parse; validate schema version.
3. On error → empty array (don't throw).

### persist()
1. Serialize `{ version: 1, entries }`.
2. `localStorage.setItem(...)`.
3. Debounce optional 100ms — **канон:** persist synchronously in effect (OK for small data).

### addEntry()
1. Generate `id = crypto.randomUUID()` or `${Date.now()}-${random}`.
2. Push entry; sort all entries by gameId groups internally or filter on read.
3. Per game keep top `LEADERBOARD_MAX_ENTRIES` only (drop lowest scores).
4. Return true if saved.

### qualifies()
True if entries for game < max OR score > lowest in top list.

### Sync with telemetry
When game ends, `ArcadeStore.syncStoredHighScore` reads max score from service for active game → updates `telemetry.storedHighScore`.

---

## 8.2 Difficulty presets

File: `src/app/core/constants/difficulty.constants.ts`

Maps from appendix A:

| Game | easy | normal | hard |
|------|------|--------|------|
| Tetris gravity ms | 800 | 500 | 300 |
| Snake step ms | 180 | 120 | 80 |
| Breakout ball mult | 0.85 | 1.0 | 1.2 |

Engines implement `getTickIntervalMs(difficulty)` using these tables.

---

## 8.3 Session timer

1. On `startGame()` → record `sessionStartedAt = performance.now()`.
2. On pause → accumulate elapsed into `pausedTotal` optional or freeze display.
3. On reset → clear session timer to 0.
4. Display updates every 250ms (not every frame).

Format: `MM:SS` zero-padded.

---

## 8.4 i18n (signal-словари)

### Файлы
- `i18n/locale.type.ts`
- `i18n/i18n.keys.ts`
- `i18n/ru.ts` / `i18n/en.ts`
- `services/i18n.service.ts`

### Требования
1. Default locale: `ru`.
2. All visible strings via `t()`.
3. Game names, controls, telemetry labels, overlays, help text — keyed.
4. `HotkeysService` / toolbar lang toggle → `uiStore.setLocale`.

Минимальные группы ключей: `toolbar.*`, `games.*`, `controls.*`, `telemetry.*`, `leaderboard.*`, `gameover.*`, `pause.*`, `help.*`, `status.*`, `difficulty.*`.

Example keys:

```ts
'games.tetris.title': 'Тетрис',
'games.tetris.subtitle': 'Классический стакан 10×20',
'controls.start': 'Старт',
'telemetry.score': 'Счёт',
'gameover.save': 'Сохранить рекорд',
```

---

## 8.5 Hotkeys

`HotkeysService` + coordination with `KeyboardCaptureDirective`:

| Key | Handler |
|-----|---------|
| P | toggle pause |
| R | reset |
| Enter | start/resume |
| 1/2/3 | select game |
| T | theme |
| G | locale |
| H | help |
| Esc | close overlays |

Ignore when focus in form fields.

Register listeners in service with `DestroyRef` cleanup OR delegate from directive only for game keys; global UI keys in service on `window`.

---

## 8.6 Theme toggle

`UiStore.themeId` → `document.documentElement.dataset.theme = themeId`.

Persist optional in sessionStorage `rae-theme` — **канон:** persist in sessionStorage.

Light theme affects panels only; CRT stays dark (01-product-vision).

---

## 8.7 Unit tests

### Required spec files

| File | Cases |
|------|-------|
| `domain/tetris/tetris.lines.spec.ts` | clear 1 line; clear 4 lines |
| `domain/tetris/tetris.scoring.spec.ts` | single/double/triple/tetris points |
| `domain/snake/snake.movement.spec.ts` | reject opposite direction |
| `domain/snake/snake.collision.spec.ts` | wall; self |
| `domain/breakout/breakout.physics.spec.ts` | paddle center vs edge angle |
| `services/leaderboard.service.spec.ts` | qualifies; trim to top N |

Use fixed RNG seed where random involved.

Run via `npm test`.

---

## 8.8 README

`README.md` at project root:
- Install / start / test commands.
- Hotkeys table.
- Three games overview.
- Tech stack (Angular 22 zoneless signals).

---

## 8.9 Запрещено

- `@angular/localize` XLIFF build pipeline.
- Leaderboard that doesn't persist.
- Hardcoded Russian strings in components (except tests).
- Skipping tests listed above.
