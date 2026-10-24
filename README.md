## Live demo

https://hafizovs.github.io/retro-arcade/

# Retro-Arcade Engine

An interactive arcade cabinet on **Angular 22+** (zoneless + Signals) with three HTML5 Canvas 2D games: **Tetris**, **Snake**, and **Breakout**.

## About

Retro-Arcade Engine is an interactive arcade cabinet on Angular 22+ (zoneless change detection and Signals) with three Canvas 2D games: Tetris, Snake, and Breakout. Scores go to a LocalStorage leaderboard. The chrome is a Cyberpunk Retro Arcade theme with RU/EN signal dictionaries.

## Capabilities

- Tetris: 10×20 well, 7 pieces, wall kick, line clear, soft/hard drop
- Snake: grid, no 180° turns, apples, growth, and collisions
- Breakout: ball, paddle, bricks with hit points, bounce angle from the impact point
- LocalStorage leaderboard
- RU/EN via signal dictionaries and a Cyberpunk Retro Arcade theme
- Angular standalone components, Signals, OnPush, zoneless change detection

## Functionality

- Pick Tetris, Snake, or Breakout with `1`, `2`, or `3`
- Start, resume, hard-drop (Tetris), or launch (Breakout) with Enter or Space
- Steer the active game with the arrow keys; pause with `P` and reset with `R`
- Toggle theme (`T`) and language (`G`), open help (`H`), and press Esc to close an overlay or resume

## Stack

- Angular standalone components, Signals, OnPush, zoneless CD
- Canvas 2D game renderers
- LocalStorage leaderboard
- i18n RU/EN via signal dictionaries
- Cyberpunk Retro Arcade theme (SCSS + CSS variables)

## Start

```bash
npm install
npm start
```

Open `http://localhost:4200/`.

## Tests

```bash
npm test
```

## Controls

| Key | Action |
|---------|----------|
| Enter / Space | Start / Resume / Hard drop (Tetris) / Launch (Breakout) |
| P | Pause |
| R | Reset |
| 1 / 2 / 3 | Tetris / Snake / Breakout |
| Arrow keys | Control the active game |
| T | Theme |
| G | Language RU↔EN |
| H | Help |
| Esc | Close overlay / Resume |

## Games

- **Tetris** — 10×20 well, 7 pieces, wall kick, line clear, soft/hard drop
- **Snake** — grid, 180° turns banned, apples, growth, collisions
- **Breakout** — ball/paddle/bricks with HP, bounce angle from the impact point
