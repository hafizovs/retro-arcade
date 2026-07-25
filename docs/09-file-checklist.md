# 09 — File Checklist

Генератор **обязан** создать каждый файл из списка. Отмечай мысленно ☑. Пропуск файла = провал DoD.

Рядом с путём — краткое содержание. Код внутри файла — **полный**, без сокращений.

---

## 9.1 Project root / Angular scaffold

| # | Path | Content |
|---|------|---------|
| 1 | `package.json` | Имя `retro-arcade-engine`, scripts start/build/test |
| 2 | `angular.json` | project config, styles `src/styles.scss` |
| 3 | `tsconfig.json` | base TS config |
| 4 | `tsconfig.app.json` | app TS config |
| 5 | `tsconfig.spec.json` | spec TS config |
| 6 | `src/index.html` | title Retro-Arcade Engine, fonts Orbitron/Rajdhani/JetBrains Mono |
| 7 | `src/main.ts` | bootstrapApplication |
| 8 | `src/styles.scss` | CSS variables Cyberpunk Arcade, reset, full viewport |
| 9 | `README.md` | install, start, test, hotkeys, overview |
| 10 | `tailwind.config.js` / эквивалент | **только если** выбран Tailwind — полный конфиг |

---

## 9.2 App shell

| # | Path | Content |
|---|------|---------|
| 11 | `src/app/app.config.ts` | zoneless providers |
| 12 | `src/app/app.component.ts` | thin host → cabinet-root |
| 13 | `src/app/app.component.html` | `<rae-cabinet-root />` |
| 14 | `src/app/app.component.scss` | full-height host |

---

## 9.3 Models (канон брифа)

| # | Path | Content |
|---|------|---------|
| 15 | `src/app/models/arcade.types.ts` | GameId, TetrisState, SnakeState, BreakoutState, LeaderboardEntry, telemetry |

---

## 9.4 Core constants

| # | Path | Content |
|---|------|---------|
| 16 | `src/app/core/constants/arcade.constants.ts` | phases, MAX_TICKS, storage keys |
| 17 | `src/app/core/constants/tetris.constants.ts` | grid 10×20, lock delay, bag |
| 18 | `src/app/core/constants/snake.constants.ts` | cols/rows, initial length, apple score |
| 19 | `src/app/core/constants/breakout.constants.ts` | field size, paddle, ball, lives, bricks |
| 20 | `src/app/core/constants/difficulty.constants.ts` | easy/normal/hard tables |
| 21 | `src/app/core/constants/ui.constants.ts` | layout, CRT, session update ms |

---

## 9.5 Core models (modular)

| # | Path | Content |
|---|------|---------|
| 22 | `src/app/core/models/game-id.model.ts` | GameId |
| 23 | `src/app/core/models/arcade-phase.model.ts` | ArcadePhase |
| 24 | `src/app/core/models/difficulty-id.model.ts` | DifficultyId |
| 25 | `src/app/core/models/direction.model.ts` | Direction |
| 26 | `src/app/core/models/tetromino-type.model.ts` | TetrominoType |

---

## 9.6 Domain — Tetris

| # | Path | Content |
|---|------|---------|
| 27 | `src/app/domain/tetris/tetromino-shapes.ts` | 7 types × 4 rotation matrices |
| 28 | `src/app/domain/tetris/tetris.collision.ts` | collides, merge, drop distance |
| 29 | `src/app/domain/tetris/tetris.lines.ts` | find/clear full rows |
| 30 | `src/app/domain/tetris/tetris.scoring.ts` | line/hard drop scoring |
| 31 | `src/app/domain/tetris/tetris.lines.spec.ts` | line clear tests |
| 32 | `src/app/domain/tetris/tetris.scoring.spec.ts` | scoring tests |

---

## 9.7 Domain — Snake

| # | Path | Content |
|---|------|---------|
| 33 | `src/app/domain/snake/snake.movement.ts` | next head, opposite check |
| 34 | `src/app/domain/snake/snake.collision.ts` | wall, self |
| 35 | `src/app/domain/snake/snake.apple.ts` | spawn apple |
| 36 | `src/app/domain/snake/snake.movement.spec.ts` | opposite turn tests |
| 37 | `src/app/domain/snake/snake.collision.spec.ts` | collision tests |

---

## 9.8 Domain — Breakout

| # | Path | Content |
|---|------|---------|
| 38 | `src/app/domain/breakout/breakout.physics.ts` | move, wall/paddle/brick bounce |
| 39 | `src/app/domain/breakout/breakout.collision.ts` | hit tests |
| 40 | `src/app/domain/breakout/breakout.bricks.ts` | grid creation, count alive |
| 41 | `src/app/domain/breakout/breakout.physics.spec.ts` | paddle angle tests |

---

## 9.9 Domain — Math utils

| # | Path | Content |
|---|------|---------|
| 42 | `src/app/domain/math/clamp.ts` | clamp number |
| 43 | `src/app/domain/math/rng.ts` | mulberry32, shuffle |
| 44 | `src/app/domain/math/aabb.ts` | circle-rect overlap |

---

## 9.10 State stores

| # | Path | Content |
|---|------|---------|
| 45 | `src/app/state/arcade.store.ts` | activeGame, phase, difficulty, telemetry |
| 46 | `src/app/state/ui.store.ts` | theme, locale, overlays |

---

## 9.11 Services (канон брифа)

| # | Path | Content |
|---|------|---------|
| 47 | `src/app/services/arcade-timer.service.ts` | rAF loop, frameId, tick accumulator |
| 48 | `src/app/services/tetris-engine.service.ts` | full Tetris engine on signals |
| 49 | `src/app/services/snake-engine.service.ts` | full Snake engine |
| 50 | `src/app/services/breakout-engine.service.ts` | full Breakout engine |
| 51 | `src/app/services/leaderboard.service.ts` | LocalStorage CRUD |
| 52 | `src/app/services/leaderboard.service.spec.ts` | qualifies / top N |
| 53 | `src/app/services/hotkeys.service.ts` | global hotkeys |
| 54 | `src/app/services/i18n.service.ts` | signal dictionaries |

---

## 9.12 Directives

| # | Path | Content |
|---|------|---------|
| 55 | `src/app/directives/keyboard-capture.directive.ts` | keydown/keyup, preventDefault, gameInput output |

---

## 9.13 Components (канон брифа + UI)

| # | Path | Content |
|---|------|---------|
| 56 | `src/app/components/cabinet-root/cabinet-root.component.ts` | корневой wiring |
| 57 | `src/app/components/cabinet-root/cabinet-root.component.html` | 3-column layout |
| 58 | `src/app/components/cabinet-root/cabinet-root.component.scss` | cabinet grid neon |
| 59 | `src/app/components/arcade-canvas/arcade-canvas.component.ts` | canvas host + draw effect |
| 60 | `src/app/components/arcade-canvas/arcade-canvas.component.html` | crt frame + canvas |
| 61 | `src/app/components/arcade-canvas/arcade-canvas.component.scss` | CRT scanlines |
| 62 | `src/app/components/arcade-canvas/arcade-renderer.ts` | drawTetris/Snake/Breakout |
| 63 | `src/app/components/leaderboard/leaderboard.component.ts` | top-N list |
| 64 | `src/app/components/leaderboard/leaderboard.component.html` | entries table |
| 65 | `src/app/components/leaderboard/leaderboard.component.scss` | neon list styles |
| 66 | `src/app/components/game-selector/game-selector.component.ts` | 3 game cards |
| 67 | `src/app/components/game-selector/game-selector.component.html` | cards template |
| 68 | `src/app/components/game-selector/game-selector.component.scss` | card glow |
| 69 | `src/app/components/telemetry-panel/telemetry-panel.component.ts` | stats + difficulty |
| 70 | `src/app/components/telemetry-panel/telemetry-panel.component.html` | telemetry rows |
| 71 | `src/app/components/telemetry-panel/telemetry-panel.component.scss` | panel styles |
| 72 | `src/app/components/game-controls/game-controls.component.ts` | start/pause/reset |
| 73 | `src/app/components/game-controls/game-controls.component.html` | buttons |
| 74 | `src/app/components/game-controls/game-controls.component.scss` | neon buttons |
| 75 | `src/app/components/pause-overlay/pause-overlay.component.ts` | pause menu |
| 76 | `src/app/components/pause-overlay/pause-overlay.component.html` | overlay |
| 77 | `src/app/components/pause-overlay/pause-overlay.component.scss` | backdrop |
| 78 | `src/app/components/game-over-overlay/game-over-overlay.component.ts` | name form + save |
| 79 | `src/app/components/game-over-overlay/game-over-overlay.component.html` | overlay form |
| 80 | `src/app/components/game-over-overlay/game-over-overlay.component.scss` | overlay styles |
| 81 | `src/app/components/toolbar/toolbar.component.ts` | brand + toggles |
| 82 | `src/app/components/toolbar/toolbar.component.html` | toolbar row |
| 83 | `src/app/components/toolbar/toolbar.component.scss` | toolbar styles |
| 84 | `src/app/components/help-overlay/help-overlay.component.ts` | help modal |
| 85 | `src/app/components/help-overlay/help-overlay.component.html` | hotkeys + rules |
| 86 | `src/app/components/help-overlay/help-overlay.component.scss` | overlay styles |
| 87 | `src/app/components/status-bar/status-bar.component.ts` | phase / hints |
| 88 | `src/app/components/status-bar/status-bar.component.html` | status content |
| 89 | `src/app/components/status-bar/status-bar.component.scss` | status styles |

---

## 9.14 i18n

| # | Path | Content |
|---|------|---------|
| 90 | `src/app/i18n/locale.type.ts` | LocaleId |
| 91 | `src/app/i18n/i18n.keys.ts` | keys union/const |
| 92 | `src/app/i18n/ru.ts` | полный русский словарь |
| 93 | `src/app/i18n/en.ts` | полный английский словарь |

---

## 9.15 Правила полноты

- Каждый `.ts` компонент содержит полный template (inline или `.html`) и стили.
- Каждая из 7 tetromino figures имеет 4 rotation matrices в `tetromino-shapes.ts`.
- Breakout brick grid полностью инициализирован с durability.
- Нет пустых файлов-заглушек.
- Если генератор добавляет вспомогательные файлы сверх списка — разрешено; **удалять** файлы из списка — нельзя.
