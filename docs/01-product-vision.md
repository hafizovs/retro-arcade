# 01 — Product Vision & UX

Документ обязателен к исполнению целиком. Генератор кода не имеет права упрощать сценарии или выкидывать панели.

---

## 1.1 Продукт

| Поле | Значение |
|------|----------|
| Название | **Retro-Arcade Engine** |
| Подзаголовок (RU) | Три игры на Signals |
| Подзаголовок (EN) | Three Games on Signals |
| Тип | SPA, интерактивный аркадный игровой центр |
| Платформа | Современный desktop Chrome/Firefox/Edge; mobile — usable (колонки stacked), desktop — primary |
| Рендер игр | HTML5 Canvas 2D |
| UI | DOM-оболочка «Arcade Cabinet», Cyberpunk Retro Arcade |

**Ценность:** дать зрелищный, полностью клиентский аркадный автомат с тремя классическими играми, реализованными на чистых Angular Signals без Zone.js — с прозрачной телеметрией, leaderboard и CRT-эстетикой.

**Аудитория:** любители ретро-игр, frontend-разработчики, изучающие zoneless Angular + Canvas game loops.

---

## 1.2 Информационная архитектура экрана

Один главный экран (без роутинга), композиция через `CabinetRootComponent`:

```
┌──────────────────────────────────────────────────────────────────────────────┐
│ Toolbar: Retro-Arcade Engine | theme | lang | help                           │
├──────────────┬───────────────────────────────────────────┬───────────────────┤
│ LEFT         │ CENTER                                    │ RIGHT             │
│              │                                           │                   │
│ Game Cards   │  ┌─────────────────────────────────────┐  │ Telemetry Panel   │
│ [Tetris]     │  │ CRT bezel + scanlines               │  │ Score: 1250       │
│ [Snake]      │  │                                     │  │ High: 4800        │
│ [Breakout]   │  │      HTML5 CANVAS 2D                │  │ Level: 3          │
│              │  │      (active game render)           │  │ Tick: 500 ms      │
│ Leaderboard  │  │                                     │  │ Session: 04:32    │
│ top-N/game   │  └─────────────────────────────────────┘  │ Difficulty select │
│              │  [Start] [Pause] [Reset]                  │                   │
├──────────────┴───────────────────────────────────────────┴───────────────────┤
│ Status: active game | phase (idle/running/paused/gameover) | hint           │
└──────────────────────────────────────────────────────────────────────────────┘
│ Overlays (z-index 30+): Pause menu | Game Over + name form | Help            │
```

- **Left column** фиксированная ширина ~280px на desktop (`≥ 1200px`); на узких экранах — accordion/stack сверху.
- **Center** — flex-grow; Canvas aspect ratio сохраняется (letterbox внутри CRT frame).
- **Right column** ~240px; telemetry всегда видна на desktop.
- Z-index: canvas (0) < panels (10) < CRT overlay pseudo-elements (15) < modals (30).

---

## 1.3 Визуальный язык — Cyberpunk Retro Arcade

Тема по умолчанию: **dark**. Светлая тема панелей — опциональный toggle (Canvas bezel остаётся тёмным).

CSS variables (обязательные имена в `styles.scss` или `@theme` / `:root` при Tailwind):

```scss
:root,
[data-theme='dark'] {
  --rae-bg-deep: #05060c;
  --rae-bg-panel: #0c0e18;
  --rae-bg-panel-elevated: #141828;
  --rae-bg-crt: #080a12;
  --rae-border: #2a3050;
  --rae-border-neon: #00f0ff;
  --rae-text: #e8f0ff;
  --rae-text-muted: #7a849c;
  --rae-neon-cyan: #00f0ff;
  --rae-neon-magenta: #ff00aa;
  --rae-neon-lime: #b8ff00;
  --rae-neon-amber: #ffaa00;
  --rae-accent: #00f0ff;
  --rae-accent-2: #ff00aa;
  --rae-danger: #ff3355;
  --rae-success: #39ff88;
  --rae-tetris-i: #00f0ff;
  --rae-tetris-o: #ffaa00;
  --rae-tetris-t: #b066ff;
  --rae-snake-head: #39ff88;
  --rae-snake-body: #1a8844;
  --rae-snake-apple: #ff3355;
  --rae-breakout-brick-1: #00f0ff;
  --rae-breakout-brick-2: #ff00aa;
  --rae-breakout-brick-3: #b8ff00;
  --rae-crt-scanline: rgba(0, 0, 0, 0.25);
  --rae-crt-vignette: rgba(0, 0, 0, 0.45);
  --rae-glow-cyan: rgba(0, 240, 255, 0.35);
  --rae-glow-magenta: rgba(255, 0, 170, 0.3);
  --rae-grid: rgba(0, 240, 255, 0.08);
  --rae-font-display: 'Orbitron', 'Segoe UI', sans-serif;
  --rae-font-ui: 'Rajdhani', 'Segoe UI', sans-serif;
  --rae-font-mono: 'JetBrains Mono', 'Consolas', monospace;
}

[data-theme='light'] {
  --rae-bg-deep: #e4e8f0;
  --rae-bg-panel: #f0f2f8;
  --rae-bg-panel-elevated: #ffffff;
  --rae-border: #b8c0d8;
  --rae-text: #0a0c14;
  --rae-text-muted: #5a6480;
  --rae-accent: #0088aa;
  --rae-accent-2: #cc0077;
}
```

Шрифты подключить через Google Fonts (Orbitron + Rajdhani + JetBrains Mono) в `index.html`.

**Game selector cards:** neon border glow on hover/active; мини-превью иконка/ASCII-art каждой игры; active card — `--rae-neon-cyan` pulse.

**CRT frame:** rounded bezel, inset shadow, `::before` scanlines (repeating-linear-gradient), `::after` vignette radial-gradient. Лёгкая анимация «roll» (optional subtle translateY 1px loop 8s) — см. [06-arcade-canvas.md](06-arcade-canvas.md).

**Запрещено:** generic purple SaaS dashboard, Inter/Roboto-only stack, emoji в кнопках (SVG/CSS glyphs OK).

Brand в toolbar: **Retro-Arcade Engine** крупнее соседних контролов.

---

## 1.4 User Journeys (обязательные сценарии)

### J1 — Первый запуск
1. Пользователь открывает приложение.
2. Тема: **dark**. Locale: **ru**.
3. Активная игра по умолчанию: **tetris**. Phase: **idle**.
4. Canvas показывает пустой/ready state Tetris (preview grid или «Press Start»).
5. Leaderboard пуст или загружен из LocalStorage.
6. Session timer: 00:00 (не идёт до Start).

### J2 — Выбор игры
1. Клик по card **Snake** / **Breakout** / **Tetris**.
2. Если phase `running` — auto-pause, затем switch.
3. Активный движок сбрасывается (`reset()`); Canvas перерисовывает новую игру.
4. Telemetry обнуляет session score (high score session max сохраняется per game в store).
5. Leaderboard фильтруется по выбранной игре.

### J3 — Старт и игровой цикл
1. **Старт** → phase `running`; `ArcadeTimerService.start()`; session timer tick.
2. rAF вызывает engine `tick(accumulatedMs)` по interval difficulty.
3. Canvas `effect` перерисовывает каждый frame signal.
4. Telemetry обновляет score, level, tick ms в реальном времени через Signals.

### J4 — Пауза и сброс
1. **Пауза** → phase `paused`; timer pause; ввод игры блокируется (кроме unpause).
2. Pause overlay показывает «Paused» + кнопки Resume / Reset.
3. **Сброс** → engine `reset()`, score session = 0, phase `idle`, timer stop.
4. Hotkey `P` — toggle pause; `R` — reset (если не в input).

### J5 — Game Over и leaderboard
1. Engine выставляет `gameOver = true` (Tetris stack top, Snake collision, Breakout ball lost / win).
2. Phase → `gameover`; timer pause.
3. Overlay **Game Over** (или **You Win** для Breakout win): показ финального счёта, input **имя игрока** (max 16 chars), кнопка **Save Score**.
4. Если score попадает в top-N (`LEADERBOARD_MAX_ENTRIES`) — запись в LocalStorage через `LeaderboardService`.
5. Leaderboard left column обновляется мгновенно.
6. Кнопки: **Play Again** (reset + start), **Back to Menu** (reset + idle).

### J6 — Сложность
1. Select **Easy / Normal / Hard** в правой колонке (disabled во время running — **канон:** disabled while running; hint «Pause first»).
2. Меняет `tickIntervalMs` base для активной игры (см. appendix A).
3. Tetris также влияет на gravity interval; Snake на step ms; Breakout на ball speed multiplier.

### J7 — Breakout mouse control
1. Pointer move над Canvas (или cabinet center) двигает paddle X (clamped).
2. Стрелки Left/Right — альтернативное управление платформой.
3. Space — launch ball if stuck to paddle (initial serve state).

### J8 — Смена языка и темы
1. Lang RU↔EN через `t(key)`.
2. Theme dark↔light меняет панели; CRT bezel остаётся тёмным.

### J9 — Help
1. `H` или кнопка Help — overlay с hotkeys и правилами трёх игр (кратко).

---

## 1.5 Горячие клавиши

| Клавиша | Действие |
|---------|----------|
| `Enter` / `Space` | Start (idle) / Resume (paused) / Tetris hard drop (running) |
| `P` | Pause toggle |
| `R` | Reset game |
| `1` | Select Tetris |
| `2` | Select Snake |
| `3` | Select Breakout |
| `ArrowLeft` / `ArrowRight` | Tetris move / Snake turn / Breakout paddle |
| `ArrowUp` | Tetris rotate / Snake up |
| `ArrowDown` | Tetris soft drop / Snake down |
| `T` | Theme toggle |
| `G` | Language RU↔EN |
| `H` | Help overlay |
| `Esc` | Close overlay / unpause menu |

Хоткеи не срабатывают, если фокус в `<input>`, `<select>`, `<textarea>`.

Игровые стрелки и Space **должны** вызывать `preventDefault` (директива `raeKeyboardCapture`).

---

## 1.6 Accessibility

- Кнопки Start/Pause/Reset: `aria-label` через i18n.
- Game cards: `role="button"`, `aria-pressed` для active.
- Canvas: `role="img"`, `aria-label` с названием активной игры и phase.
- Telemetry: live region `aria-live="polite"` для score updates (throttle 500ms).
- Game Over form: label + `aria-required` на name input.
- Focus visible на интерактивных элементах.
- Контраст неон-текста на `--rae-bg-panel` ≥ WCAG AA для основного UI.

---

## 1.7 Состояния приложения (product-level)

| Phase | Описание |
|-------|----------|
| `idle` | Игра выбрана, не запущена |
| `running` | Timer + engine ticks активны |
| `paused` | Timer остановлен, state сохранён |
| `gameover` | Конец партии; overlay |

Переходы через `ArcadeStore` + `ArcadeTimerService` — UI только вызывает команды.

---

## 1.8 Что запрещено в UX

- Скрытый leaderboard «для экономии места» на desktop ≥ 1200px.
- Canvas без CRT frame на desktop.
- Игры без Pause/Reset.
- Tetris без rotate или line clear.
- Snake с разворотом на 180° в один tick.
- Breakout с фиксированным отскоком без учёта позиции на платформе.
- Заглушки «Game 1 / Game 2» без имён Tetris/Snake/Breakout.
