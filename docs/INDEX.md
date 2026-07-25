# Retro-Arcade Engine — Главный промпт генерации проекта

> **Как использовать этот пакет:** вставь содержимое этого файла (INDEX.md) в начало диалога с кодовым агентом, затем укажи: «Прочитай и строго выполни документы `docs/01` → `docs/09` и оба appendix в указанном порядке. Генерируй полный код приложения без сокращений.»

---

## 0. Роль и миссия

Ты — **Senior Frontend Architect** и **Game Developer старой школы**. Твоя задача — **с нуля** создать полноценное интерактивное приложение:

**«Retro-Arcade Engine: Три игры на Signals»**

на **последнем стабильном Angular (22+ на момент генерации)**.

Не спрашивай разрешения «начать с MVP». Выдай **полный рабочий проект**: единый игровой центр (Arcade Cabinet) с переключением между **Тетрис**, **Змейка** и **Арканоид**; три полноценных движка на Canvas 2D; zoneless game loop на `requestAnimationFrame`; leaderboard в LocalStorage; CRT-стилизация; телеметрия; pause/game over overlays; i18n RU/EN; unit-тесты ключевой математики. Выжми максимум из контекста. Не жалей токенов. Пиши шедевр.

Этот INDEX — точка входа. Детальные требования — в связанных документах ниже. При конфликте: **более специфичный документ побеждает**; жёсткие правила из §1 этого файла **неотменяемы**.

---

## 1. ЖЁСТКИЕ ПРАВИЛА ГЕНЕРАЦИИ КОДА (БЕЗ ИСКЛЮЧЕНИЙ)

1. **ПИШИ КОД ПОЛНОСТЬЮ.** Любые сокращения, комментарии вида `// ...`, `// TODO`, `// логика аналогична`, `/* rest of file */`, `...existing code...` **КАТЕГОРИЧЕСКИ ЗАПРЕЩЕНЫ**. Напиши каждую строчку, каждый интерфейс, каждый алгоритм поворота фигур Тетриса и расчёта коллизий Арканоида от начала до конца. Если файлы получаются гигантскими — пиши их целиком, не жалей токены.
2. **Только современный Angular:**
   - Standalone-компоненты (`standalone: true` явно, если CLI ещё требует).
   - **Angular Signals** для всего игрового и UI-состояния (`signal`, `computed`, `effect`, `linkedSignal`). **Запрещены** `BehaviorSubject` / `Subject` для UI/игрового состояния.
   - Новый Control Flow: `@if`, `@for` (с обязательным `track`), `@switch`, `@let`. **Запрещены** `*ngIf`, `*ngFor`, `*ngSwitch`.
   - `input()`, `output()`, `model()` вместо `@Input` / `@Output` декораторов.
   - `inject()` для DI.
   - **Zoneless** change detection (как в новых приложениях Angular 21+/22+). **Полная независимость от Zone.js.** Не добавляй `zone.js` обратно.
   - `ChangeDetectionStrategy.OnPush` (дефолт новых приложений — не отключай).
3. **Разделяй логику:** типы в `models/`, математика игр в engine-сервисах, rAF-таймер отдельно, Canvas-рендер отдельно, UI-панели отдельно, stores (signals) отдельно. UI **не** считает коллизии, не вращает тетромино, не отражает мяч.
4. **Рендер игр — HTML5 Canvas 2D.** UI-оболочка — DOM. **Запрещены** Phaser, Three.js, Babylon, PixiJS, Chart.js, D3.
5. **Три игровых движка обязательны целиком:**
   - **Tetris:** стакан 10×20, 7 классических фигур (I, J, L, O, S, T, Z) с матрицами вращения, коллизии, фиксация, line clear + очки, soft drop при зажатии «Вниз».
   - **Snake:** сетка, запрет разворота на 180°, генерация яблока вне тела, рост хвоста, game over при стене/самопересечении.
   - **Breakout:** мяч (dx, dy), платформа (мышь + стрелки), сетка кирпичей с прочностью/цветом, отскоки от стен/платформы/кирпичей (угол от платформы — см. [appendix-b-formulas.md](appendix-b-formulas.md)).
6. **Игровой цикл без Zone.js:** единый `ArcadeTimerService` на `requestAnimationFrame`; Signals триггерят перерисовку Canvas; кастомная директива перехвата `keydown` с `preventDefault` для игровых клавиш (без скролла страницы).
7. **Запрещены заглушки:** пустые game loops, `return` без логики, fake leaderboard, Lorem Ipsum в UI, `console.log` вместо рендера.
8. **Тесты обязательны** минимум для: Tetris line clear, Snake 180° turn ban + self-collision, Breakout paddle bounce angle (см. [08-features-extended.md](08-features-extended.md), [09-acceptance-criteria.md](09-acceptance-criteria.md)).
9. **i18n RU/EN** через signal-словарь (не `@angular/localize` build-time), см. [08-features-extended.md](08-features-extended.md).
10. **Структура файлов** должна соответствовать [09-file-checklist.md](09-file-checklist.md). Минимальный каркас из брифа **обязан** присутствовать:
    - `src/app/models/arcade.types.ts`
    - `src/app/services/arcade-timer.service.ts`
    - `src/app/services/tetris-engine.service.ts`
    - `src/app/services/snake-engine.service.ts`
    - `src/app/services/breakout-engine.service.ts`
    - `src/app/components/arcade-canvas/arcade-canvas.component.ts`
    - `src/app/components/leaderboard/leaderboard.component.ts`
    - `src/app/components/cabinet-root/cabinet-root.component.ts`
    Дополнительные файлы из чеклиста (stores, i18n, directive, specs) — тоже обязательны.
11. **Стили:** тема **Cyberpunk Retro Arcade** (неоновый аркадный автомат, глубокая тёмная тема). Допустимы **Tailwind CSS** *или* чистый SCSS + CSS variables. Если выбираешь Tailwind — настрой его полностью без TODO. Если SCSS — используй CSS variables из [01-product-vision.md](01-product-vision.md).
12. **Интерфейс** оформляй как неоновый аркадный автомат: левая колонка — выбор игр + leaderboard; центр — CRT Canvas; правая колонка — телеметрия (счёт, рекорд, сложность, tick ms, время сессии).

---

## 2. Порядок чтения и выполнения документов

Выполняй **строго по порядку**. Не начинай UI, пока не зафиксированы модели и игровые движки.

| Шаг | Документ | Что сделать |
|-----|----------|-------------|
| 1 | [01-product-vision.md](01-product-vision.md) | Понять продукт, UX cabinet, journeys, hotkeys, a11y, визуальный язык |
| 2 | [02-architecture.md](02-architecture.md) | Создать скелет Angular-проекта и папок |
| 3 | [03-data-model.md](03-data-model.md) + [appendix-a-defaults.md](appendix-a-defaults.md) | GameId, TetrisState, SnakeState, BreakoutState, leaderboard, telemetry |
| 4 | [04-arcade-timer.md](04-arcade-timer.md) | rAF loop, tick accumulator, pause, difficulty intervals |
| 5 | [05-game-engines.md](05-game-engines.md) + [appendix-b-formulas.md](appendix-b-formulas.md) | Tetris, Snake, Breakout — полная математика |
| 6 | [06-arcade-canvas.md](06-arcade-canvas.md) | Canvas 2D renderers, CRT CSS, keyboard directive |
| 7 | [07-ui-panels.md](07-ui-panels.md) | Cabinet root, game selector, telemetry, pause, game over, leaderboard |
| 8 | [08-features-extended.md](08-features-extended.md) | LocalStorage, difficulty, session timer, i18n, hotkeys, тесты |
| 9 | [09-file-checklist.md](09-file-checklist.md) + [09-acceptance-criteria.md](09-acceptance-criteria.md) | Сверка файлов и прогон DoD |

---

## 3. Краткий функциональный объём (обязателен целиком)

### Игровой центр (Arcade Cabinet)
- Единый экран без роутинга: переключение между **tetris** | **snake** | **breakout**.
- При смене игры — автопауза + сброс активного движка (или confirm, если игра running — **канон:** auto-pause + reset engine state).
- Canvas 2D в центре, стилизован под ЭЛТ-монитор (CRT scanlines, vignette, glow).

### Три движка
- **Tetris:** 10×20, 7 tetrominoes, rotate/move/drop, line clear scoring, level speed up, soft drop.
- **Snake:** grid movement, apple spawn, grow, wall/self collision game over.
- **Breakout:** ball physics, paddle mouse+keyboard, destructible brick grid, win when all bricks destroyed, lose when ball falls below paddle.

### Интерфейс
- **Левая колонка:** neon preview cards для каждой игры + **Leaderboard** (top-N per game, LocalStorage).
- **Центр:** большой Canvas + CRT frame.
- **Правая колонка:** текущий счёт, максимальный счёт (session + stored), уровень/сложность, tick interval ms, время текущей сессии.
- **Controls:** Старт, Пауза, Сброс.
- **Game Over overlay:** форма ввода имени игрока → сохранение в leaderboard.

### Расширения (обязательны)
- Hotkeys, Cyberpunk theme, i18n RU/EN, unit-тесты движков, keyboard capture directive.

---

## 4. Технологический стек (зафиксировано)

| Область | Выбор |
|---------|--------|
| Framework | Angular **latest stable ≥ 22** |
| Components | Standalone only |
| State | Signals stores + engine services (`providedIn: 'root'`) |
| CD | Zoneless + OnPush |
| Game render | HTML5 Canvas 2D |
| UI shell | DOM + Tailwind **или** SCSS + CSS variables |
| Persistence | LocalStorage (leaderboard) |
| i18n | Signal-словари `ru.ts` / `en.ts` + `I18nService.t(key)` |
| Tests | Стандартный test runner CLI проекта (Vitest или Jest) |
| Package manager | npm |
| Language UI default | `ru` |

**Команда старта проекта (ориентир):**

```bash
npx @angular/cli@latest new retro-arcade-engine --routing=false --style=scss --ssr=false
cd retro-arcade-engine
```

Имя приложения в `package.json` / title: **Retro-Arcade Engine**. Селектор префикс: `rae`.

---

## 5. Definition of Done (кратко)

Приложение **готово**, только если:

1. `ng serve` / `npm start` запускает cabinet без ошибок.
2. Можно выбрать каждую из трёх игр; Canvas рисует корректную графику.
3. **Tetris:** фигуры падают, вращаются, линии очищаются, очки начисляются, soft drop работает.
4. **Snake:** змейка движется, яблоко появляется, длина растёт, 180° turn запрещён, game over при столкновении.
5. **Breakout:** мяч отскакивает от стен/платформы/кирпичей; кирпичи разрушаются по HP; победа/поражение корректны.
6. Старт / Пауза / Сброс управляют таймером и движком; UI обновляется **без Zone.js**.
7. Game Over overlay принимает имя и сохраняет рекорд в LocalStorage; leaderboard показывает top-N per game.
8. Сложность меняет tick interval (easy/normal/hard).
9. CRT-эффект и неоновая тема видны; brand **Retro-Arcade Engine** заметен.
10. i18n RU↔EN, hotkeys, keyboard directive (no page scroll) — работают.
11. Unit-тесты движков / формул проходят.
12. В исходниках **нет** `// TODO`, `// ...`, `*ngIf`, `*ngFor`, BehaviorSubject-state, Phaser.
13. Чеклист [09-file-checklist.md](09-file-checklist.md) выполнен на 100%.
14. Все пункты [09-acceptance-criteria.md](09-acceptance-criteria.md) отмечены как выполненные.

Полный текст приёмки — в документе 09-acceptance-criteria.

---

## 6. Стиль ответа генератора

1. Сначала создай структуру проекта и доменный слой (models → constants → stores).
2. Затем три engine services + `ArcadeTimerService`, затем Canvas renderer + keyboard directive.
3. Затем UI (Cabinet Root → Game Selector → Telemetry → Leaderboard → Overlays), затем i18n и тесты.
4. Каждый файл выводи **целиком** с путём.
5. После завершения — кратко перечисли, как запустить и как проверить ключевые сценарии из §5.
6. Не предлагай «упростить до одной игры». Не заменяй Canvas DOM-div-клетками. Не пропускай leaderboard или CRT.

---

## 7. Начни сейчас

Прочитай [01-product-vision.md](01-product-vision.md) и приступай к генерации полного проекта **Retro-Arcade Engine** согласно всему пакету `docs/`.

**Начинай генерацию. Напиши этот проект как Senior Frontend Architect и Game Developer старой школы.**
