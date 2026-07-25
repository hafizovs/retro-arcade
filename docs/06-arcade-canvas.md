# 06 — Arcade Canvas Renderer

Документ обязателен. Canvas 2D — единственный рендер игр. Полный код без сокращений.

---

## 6.1 Файлы

| Path | Content |
|------|---------|
| `components/arcade-canvas/arcade-canvas.component.ts` | Host, rAF hook via timer frameId, resize, wires engines (**RENAME-LOCKED**) |
| `components/arcade-canvas/arcade-canvas.component.html` | `<canvas>` + CRT wrapper div |
| `components/arcade-canvas/arcade-canvas.component.scss` | CRT bezel, scanlines, glow |
| `components/arcade-canvas/arcade-renderer.ts` | Pure draw functions per game |
| `directives/keyboard-capture.directive.ts` | keydown/keyup → GameInputAction |

Selector: `rae-arcade-canvas`. Directive selector: `[raeKeyboardCapture]`.

---

## 6.2 Component API

```ts
@Component({
  selector: 'rae-arcade-canvas',
  standalone: true,
  // ...
})
export class ArcadeCanvasComponent {
  readonly gameId = input.required<GameId>();
  readonly phase = input.required<ArcadePhase>();

  // inject: TetrisEngineService, SnakeEngineService, BreakoutEngineService,
  //         ArcadeTimerService, DestroyRef

  private canvasRef = viewChild<ElementRef<HTMLCanvasElement>>('canvas');
}
```

Parent `CabinetRoot` passes `gameId` and `phase`. Component reads active engine state internally by `gameId`.

---

## 6.3 Bootstrap canvas

In `afterNextRender` or constructor + `effect`:

1. Get canvas 2D context `{ alpha: false }`.
2. `ResizeObserver` on host element → `resizeCanvas()`.
3. `effect(() => { this.timer.frameId(); this.drawFrame(); })` — zoneless repaint.
4. On destroy: disconnect observer (rAF owned by timer service).

### DPR scaling

```ts
private resizeCanvas(): void {
  const canvas = this.canvasRef()?.nativeElement;
  const host = canvas.parentElement!;
  const dpr = window.devicePixelRatio || 1;
  const w = host.clientWidth;
  const h = host.clientHeight;
  canvas.width = Math.floor(w * dpr);
  canvas.height = Math.floor(h * dpr);
  canvas.style.width = `${w}px`;
  canvas.style.height = `${h}px`;
  this.ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  this.logicalWidth = w;
  this.logicalHeight = h;
  this.drawFrame();
}
```

---

## 6.4 Draw pipeline

```ts
private drawFrame(): void {
  const ctx = this.ctx;
  const w = this.logicalWidth;
  const h = this.logicalHeight;
  if (!ctx || w === 0) return;

  clear(ctx, w, h);
  switch (this.gameId()) {
    case 'tetris': drawTetris(ctx, this.tetris.state(), w, h); break;
    case 'snake': drawSnake(ctx, this.snake.state(), w, h); break;
    case 'breakout': drawBreakout(ctx, this.breakout.state(), w, h); break;
  }
  if (this.phase() === 'idle') drawIdleOverlay(ctx, w, h, this.gameId());
  if (this.phase() === 'paused') drawPausedOverlay(ctx, w, h);
}
```

Implement `drawTetris`, `drawSnake`, `drawBreakout` in `arcade-renderer.ts` as exported functions.

---

## 6.5 drawTetris

1. Compute cell size: `cell = min(floor(w/cols), floor(h/rows))`, center board in canvas.
2. Draw background panel rect with `--rae-bg-crt`.
3. Draw faint grid lines optional.
4. For each filled board cell — fill rect with color by `TetrominoType` CSS var mapping (hardcoded hex from theme constants object `TETRIS_COLORS`).
5. Draw active piece matrix at offset with brighter glow (`shadowBlur`).
6. Optional: mini preview of `nextPieceType` in corner.
7. If `gameOver` — red tint overlay 20%.

Colors neon: I=cyan, O=amber, T=purple, etc. (match 01-product-vision).

---

## 6.6 drawSnake

1. Cell size from grid cols/rows same as Tetris centering logic.
2. Draw apple as filled circle (red neon).
3. Draw snake segments: head brighter green, body gradient; rounded rects 2px radius.
4. Empty cells transparent (show CRT bg).

---

## 6.7 drawBreakout

1. Map logical `BREAKOUT_WIDTH/HEIGHT` to scale `scale = min(w/BW, h/BH)`, offset center.
2. `ctx.save(); translate; scale;` then draw in logical coords.
3. Draw bricks as rounded rects colored by `colorIndex` / durability (alpha lower when damaged).
4. Draw paddle (cyan neon bar with glow).
5. Draw ball (white circle, shadow).
6. Draw lives as small icons top-left (in logical space).

---

## 6.8 Idle / Paused overlays

- **Idle:** semi-transparent text «Press START» / i18n key centered, pulsing opacity CSS animation optional on wrapper (not canvas).
- **Paused:** canvas dim 40% + «PAUSED» text via renderer.

Game Over overlay — DOM component, not canvas (see 07-ui-panels).

---

## 6.9 CRT CSS (component.scss)

```scss
.crt-frame {
  position: relative;
  background: var(--rae-bg-crt);
  border: 3px solid var(--rae-border);
  border-radius: 12px;
  box-shadow:
    inset 0 0 60px rgba(0, 0, 0, 0.6),
    0 0 24px var(--rae-glow-cyan);
  overflow: hidden;
}

.crt-frame::before {
  content: '';
  pointer-events: none;
  position: absolute;
  inset: 0;
  background: repeating-linear-gradient(
    0deg,
    var(--rae-crt-scanline),
    var(--rae-crt-scanline) 1px,
    transparent 1px,
    transparent 3px
  );
  z-index: 2;
}

.crt-frame::after {
  content: '';
  pointer-events: none;
  position: absolute;
  inset: 0;
  background: radial-gradient(ellipse at center, transparent 55%, var(--rae-crt-vignette) 100%);
  z-index: 3;
}

@keyframes crtRoll {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(1px); }
}

.crt-frame__scan {
  animation: crtRoll 8s ease-in-out infinite;
}
```

Canvas sits `z-index: 1` inside frame.

---

## 6.10 Keyboard capture directive

```ts
@Directive({
  selector: '[raeKeyboardCapture]',
  standalone: true,
})
export class KeyboardCaptureDirective {
  readonly gameId = input.required<GameId>();
  readonly phase = input.required<ArcadePhase>();
  readonly gameInput = output<GameInputAction>();

  @HostListener('window:keydown', ['$event'])
  onKeyDown(ev: KeyboardEvent): void { /* map keys */ }

  @HostListener('window:keyup', ['$event'])
  onKeyUp(ev: KeyboardEvent): void { /* softDrop release */ }
}
```

### Key mapping (when phase `running`, not in input)

| Key | Tetris | Snake | Breakout |
|-----|--------|-------|----------|
| ArrowLeft | move left | direction left | paddle nudge left |
| ArrowRight | move right | direction right | paddle nudge right |
| ArrowUp | rotate cw | direction up | — |
| ArrowDown | softDrop on | direction down | — |
| Space | hardDrop | — | launchBall |

Always `preventDefault()` for these keys when handled.

Attach directive on `rae-cabinet-root` with `(gameInput)="onGameInput($event)"`.

---

## 6.11 Pointer (Breakout)

On canvas `pointermove` (when gameId breakout and phase running):

```ts
const rect = canvas.getBoundingClientRect();
const x = (ev.clientX - rect.left) * (logicalWidth / rect.width);
// map to breakout logical x via inverse of drawBreakout scale
this.breakout.handleInput({ type: 'paddleMove', x: mappedX });
```

---

## 6.12 Performance

- Avoid `getComputedStyle` per frame.
- Batch brick draws in loops; skip dead bricks.
- No `toDataURL` / readbacks.

---

## 6.13 Запрещено

- Replacing Canvas with DOM div grid for games.
- Missing DPR handling (blurry on retina).
- Game logic inside draw functions (read-only render).
- Global `window.onkeydown` without directive cleanup.
