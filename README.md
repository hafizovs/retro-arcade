# Retro-Arcade Engine

Интерактивный аркадный кабинет на **Angular 22+** (zoneless + Signals) с тремя играми на HTML5 Canvas 2D: **Тетрис**, **Змейка**, **Арканоид**.

## Стек

- Angular standalone components, Signals, OnPush, zoneless CD
- Canvas 2D game renderers
- LocalStorage leaderboard
- i18n RU/EN через signal-словари
- Cyberpunk Retro Arcade theme (SCSS + CSS variables)

## Запуск

```bash
npm install
npm start
```

Откройте `http://localhost:4200/`.

## Тесты

```bash
npm test
```

## Управление

| Клавиша | Действие |
|---------|----------|
| Enter / Space | Старт / Resume / Hard drop (Tetris) / Launch (Breakout) |
| P | Пауза |
| R | Сброс |
| 1 / 2 / 3 | Tetris / Snake / Breakout |
| Стрелки | Управление активной игрой |
| T | Тема |
| G | Язык RU↔EN |
| H | Справка |
| Esc | Закрыть overlay / Resume |

## Игры

- **Tetris** — стакан 10×20, 7 фигур, wall kick, line clear, soft/hard drop
- **Snake** — сетка, запрет 180°, яблоки, рост, столкновения
- **Breakout** — мяч/платформа/кирпичи с HP, угол отскока от точки удара
