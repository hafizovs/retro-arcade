# 07 — UI Panels

Все панели — standalone components, Signals, control flow `@if`/`@for`. Строки UI — через `I18nService.t(...)`. Стили — Tailwind **или** SCSS + CSS variables из [01-product-vision.md](01-product-vision.md).

---

## 7.1 Toolbar (`rae-toolbar`)

Элементы слева направо:

1. Brand: **Retro-Arcade Engine** (Orbitron, крупнее контролов).
2. Spacer.
3. Button **Theme** (`T`).
4. Button **Lang** (`G`) — `RU`/`EN`.
5. Button **Help** (`H`).

Высота 52px; sticky top. `aria-label` через i18n.

---

## 7.2 Cabinet Root (`rae-cabinet-root`)

Корневой компонент приложения (кроме thin `AppComponent`).

### Layout (CSS Grid)

```scss
.cabinet {
  display: grid;
  grid-template-columns: 280px 1fr 240px;
  grid-template-rows: auto 1fr auto;
  min-height: 100dvh;
  gap: 12px;
  padding: 12px;
  background: var(--rae-bg-deep);
}

@media (max-width: 1199px) {
  .cabinet {
    grid-template-columns: 1fr;
    grid-template-areas:
      'toolbar'
      'selector'
      'canvas'
      'telemetry'
      'controls'
      'leaderboard';
  }
}
```

### Ответственность
- Inject: `ArcadeStore`, `UiStore`, `ArcadeTimerService`, three engines, `LeaderboardService`, `HotkeysService`.
- Host `[raeKeyboardCapture]` + `(gameInput)`.
- Wire Start/Pause/Reset to timer + store.
- On game switch → pause, reset engine, update store.
- Compose child components (см. template ниже).

### Template structure

```html
<rae-toolbar />
<div class="cabinet" [raeKeyboardCapture]="..." (gameInput)="onGameInput($event)">
  <aside class="cabinet__left">
    <rae-game-selector />
    <rae-leaderboard />
  </aside>
  <main class="cabinet__center">
    <rae-arcade-canvas [gameId]="activeGameId()" [phase]="phase()" />
    <rae-game-controls />
  </main>
  <aside class="cabinet__right">
    <rae-telemetry-panel />
  </aside>
  <rae-status-bar />
</div>
@if (pauseOverlayOpen()) { <rae-pause-overlay /> }
@if (gameOverOverlayOpen()) { <rae-game-over-overlay /> }
@if (helpOpen()) { <rae-help-overlay /> }
```

Не содержать tetromino math.

---

## 7.3 Game Selector (`rae-game-selector`)

Три neon cards:

| Card | gameId | Accent |
|------|--------|--------|
| Tetris | `tetris` | cyan |
| Snake | `snake` | lime |
| Breakout | `breakout` | magenta |

Each card:
- Title + subtitle i18n.
- Mini ASCII/SVG icon.
- `@if (activeGameId() === id)` → active border glow.
- Click → `arcadeStore.selectGame(id)` (pauses + resets per J2).

Hotkeys `1`/`2`/`3` duplicate selection via `HotkeysService`.

---

## 7.4 Telemetry Panel (`rae-telemetry-panel`)

Display (read `arcadeStore.telemetry()`):

| Label | Source |
|-------|--------|
| Current Score | `currentScore` |
| Session High | `sessionHighScore` |
| All-time High | `storedHighScore` (max from leaderboard for active game) |
| Level | `level` |
| Tick / Speed | `tickIntervalMs` + «ms» |
| Session Time | format `mm:ss` from `sessionElapsedMs` |
| Extra | lines / snake length / bricks remaining per game |

**Difficulty** `<select>` easy/normal/hard:
- Disabled when `phase() === 'running'` (show hint `telemetry.pauseToChangeDifficulty`).
- On change → `arcadeStore.setDifficulty(id)` + update timer interval if idle/paused.

Use `@if (activeGameId() === 'tetris')` for conditional rows.

`aria-live="polite"` on score block.

---

## 7.5 Game Controls (`rae-game-controls`)

Three buttons centered under canvas:

1. **Start** — enabled `idle` or `paused`; calls `startGame()`.
2. **Pause** — enabled `running`; calls `pauseGame()`.
3. **Reset** — always enabled except maybe during overlay confirm; calls `resetGame()`.

Icons: CSS shapes, not emoji. `aria-pressed` for pause when paused.

i18n: `controls.start`, `controls.pause`, `controls.reset`.

---

## 7.6 Leaderboard (`rae-leaderboard`)

### Display
- Title i18n `leaderboard.title`.
- Filter: entries where `entry.gameId === activeGameId()`.
- Sort: score desc, then date asc.
- Top `LEADERBOARD_MAX_ENTRIES` (10).
- Columns: rank, name, score, difficulty badge, date short.

### Empty state
«No records yet» i18n.

### Data
Read `leaderboardService.entries()` signal. No write here — Game Over overlay writes.

---

## 7.7 Pause Overlay (`rae-pause-overlay`)

Full-screen semi-transparent backdrop `z-index: 30`.

Content:
- Title «Paused».
- Buttons: **Resume** (same as Start), **Reset**.
- **Esc** closes → resume optional (канon: Esc = resume).

Visible when `phase === 'paused'` AND user opened pause OR auto on Pause key.

---

## 7.8 Game Over Overlay (`rae-game-over-overlay`)

Visible when `phase === 'gameover'`.

Content:
- Title: `gameover.lose` or `gameover.win` (Breakout win).
- Final score large display.
- `<input>` player name max 16, pattern `[a-zA-Z0-9 _-]`, default «Player».
- **Save Score** → `leaderboardService.addEntry(...)` if qualifies.
- **Play Again** → reset + start.
- **Menu** → reset + idle.

On open, focus name input.

Validation: trim name; if empty use `Player`.

---

## 7.9 Help Overlay (`rae-help-overlay`)

Scrollable panel:
- Hotkeys table from 01-product-vision §1.5.
- Brief rules per game (3–5 bullets each).
- Close button + Esc.

---

## 7.10 Status Bar (`rae-status-bar`)

Footer strip:
- Active game name.
- Phase badge (idle/running/paused/game over).
- Hint text contextual («Arrow keys to play»).

---

## 7.11 ArcadeStore public API (for panels)

```ts
readonly activeGameId = signal<GameId>('tetris');
readonly phase = signal<ArcadePhase>('idle');
readonly difficultyId = signal<DifficultyId>('normal');
readonly telemetry = signal<ArcadeTelemetry>({...});

selectGame(id: GameId): void;
setPhase(phase: ArcadePhase): void;
setDifficulty(id: DifficultyId): void;
updateTelemetry(partial: Partial<ArcadeTelemetry>): void;
syncStoredHighScore(gameId: GameId, score: number): void;
```

---

## 7.12 Visual requirements

- Game cards: `box-shadow: 0 0 12px var(--rae-glow-cyan)` on hover.
- Buttons: neon outline, hover fill 10% accent.
- Leaderboard rows: zebra subtle on `--rae-bg-panel-elevated`.
- Mobile: leaderboard below canvas, collapsible.

---

## 7.13 Запрещено

- Hidden telemetry on desktop.
- Game Over without name input.
- Start button that doesn't start timer.
- Leaderboard global unsorted mix of games without filter.
