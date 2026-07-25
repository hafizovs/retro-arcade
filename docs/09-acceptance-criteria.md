# 09 — Acceptance Criteria & Definition of Done

Чеклист приёмки. Генератор после завершения работ **обязан** пройти каждый пункт. Пункт провален → доработать код, не оправдываться.

---

## 9.1 Build & Run

- [ ] `npm install` завершается без ошибок
- [ ] `npm start` / `ng serve` поднимает приложение
- [ ] Консоль браузера без ошибок runtime при старте
- [ ] Нет красных ошибок Angular (NG0xxx) в консоли
- [ ] Zoneless: Start/Pause/Score обновляют UI без Zone.js
- [ ] В зависимостях нет phaser / three / ngrx / pixi.js
- [ ] Tailwind или SCSS тема полностью настроена

---

## 9.2 Arcade Cabinet UI

- [ ] Трёхколоночный layout на desktop ≥ 1200px
- [ ] Brand **Retro-Arcade Engine** виден в toolbar
- [ ] CRT frame + scanlines на canvas area
- [ ] Cyberpunk neon theme (cyan/magenta/lime accents)
- [ ] Mobile layout usable (stacked columns)

---

## 9.3 Game selection & controls

- [ ] Три game cards переключают tetris/snake/breakout
- [ ] При switch — pause + engine reset
- [ ] Start запускает timer + phase running
- [ ] Pause останавливает timer; state сохранён
- [ ] Reset обнуляет score session и phase idle
- [ ] Hotkeys P/R/1/2/3 работают (вне input focus)

---

## 9.4 Tetris

- [ ] Стакан 10×20 отображается
- [ ] Все 7 фигур (I,J,L,O,S,T,Z) появляются (7-bag)
- [ ] Move left/right работает
- [ ] Rotate CW (Up или mapped key) с wall kick
- [ ] Soft drop (Down hold) ускоряет падение
- [ ] Hard drop (Space) фиксирует + очки за distance
- [ ] Заполненные линии удаляются; score увеличивается
- [ ] Level растёт после N линий; gravity ускоряется
- [ ] Game over при переполнении сверху

---

## 9.5 Snake

- [ ] Змейка движется по сетке по timer tick
- [ ] Arrow keys меняют направление
- [ ] Разворот на 180° за один input отклонён
- [ ] Яблоко спawns не на теле змейки
- [ ] Съедание яблока увеличивает длину и score
- [ ] Game over при ударе в стену
- [ ] Game over при ударе в своё тело

---

## 9.6 Breakout

- [ ] Мяч движется с dx/dy
- [ ] Отскок от левой/правой/верхней стены корректен
- [ ] Paddle управляется мышью над canvas
- [ ] Paddle управляется стрелками
- [ ] Угол отскока от paddle зависит от точки удара
- [ ] Кирпичи имеют прочность; цвет/alpha отражает damage
- [ ] Мёртвые кирпичи исчезают; score растёт
- [ ] Потеря жизни при падении мяча вниз
- [ ] Win когда все кирпичи уничтожены
- [ ] Game over когда lives = 0
- [ ] Space launch ball from paddle

---

## 9.7 Telemetry & difficulty

- [ ] Отображаются: score, session high, stored high, level, tick ms, session time
- [ ] Tetris показывает lines cleared; Snake — length; Breakout — bricks remaining
- [ ] Difficulty easy/normal/hard меняет скорость (disabled while running)
- [ ] Session timer стартует с Start и останавливается на Pause

---

## 9.8 Leaderboard & Game Over

- [ ] Game Over overlay показывает финальный score
- [ ] Форма имени игрока работает
- [ ] Save записывает в LocalStorage top-N per game
- [ ] Leaderboard обновляется без reload
- [ ] Reload страницы сохраняет leaderboard
- [ ] Play Again / Menu работают

---

## 9.9 Keyboard & a11y

- [ ] Arrow keys / Space не скроллят страницу (preventDefault)
- [ ] aria-labels на основных кнопках
- [ ] Canvas имеет aria-label с игрой и phase
- [ ] Focus visible на интерактивах

---

## 9.10 i18n & theme

- [ ] Default locale RU
- [ ] Переключение EN переводит UI через t()
- [ ] Theme toggle меняет panel colors
- [ ] Help overlay показывает hotkeys и правила

---

## 9.11 Tests

- [ ] `npm test` проходит
- [ ] Tetris line clear specs pass
- [ ] Snake opposite / collision specs pass
- [ ] Breakout paddle bounce spec pass
- [ ] Leaderboard qualifies spec pass

---

## 9.12 Code quality (hard rules)

- [ ] Нет `// TODO`, `// ...`, `/* rest */` в src/
- [ ] Нет `*ngIf`, `*ngFor` в templates
- [ ] Нет BehaviorSubject для game/UI state
- [ ] Минимальные 8 файлов брифа существуют и полны
- [ ] [09-file-checklist.md](09-file-checklist.md) выполнен на 100%

---

## 9.13 Manual smoke script

1. Open app → Tetris selected → Start → play 30s → clear a line → Pause → Reset.
2. Switch Snake → Start → eat apple → die on wall → enter name → Save → see leaderboard.
3. Switch Breakout → Start → launch ball → break bricks → win or lose life.
4. Set difficulty Hard on idle → Start → verify faster gameplay.
5. Toggle EN + light theme → UI updates.
6. Refresh page → leaderboard persists.

Все шаги без console errors = **принято**.
