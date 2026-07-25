import {
  afterNextRender,
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  ElementRef,
  effect,
  inject,
  input,
  viewChild,
} from '@angular/core';
import { ArcadePhase, GameId } from '../../models/arcade.types';
import { ArcadeTimerService } from '../../services/arcade-timer.service';
import { BreakoutEngineService } from '../../services/breakout-engine.service';
import { I18nService } from '../../services/i18n.service';
import { SnakeEngineService } from '../../services/snake-engine.service';
import { TetrisEngineService } from '../../services/tetris-engine.service';
import {
  clearCanvas,
  drawBreakout,
  drawIdleOverlay,
  drawPausedOverlay,
  drawSnake,
  drawTetris,
  mapPointerToBreakoutX,
} from './arcade-renderer';

@Component({
  selector: 'rae-arcade-canvas',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './arcade-canvas.component.html',
  styleUrl: './arcade-canvas.component.scss',
})
export class ArcadeCanvasComponent {
  readonly gameId = input.required<GameId>();
  readonly phase = input.required<ArcadePhase>();

  private readonly canvasRef =
    viewChild<ElementRef<HTMLCanvasElement>>('canvas');
  private readonly timer = inject(ArcadeTimerService);
  private readonly tetris = inject(TetrisEngineService);
  private readonly snake = inject(SnakeEngineService);
  private readonly breakout = inject(BreakoutEngineService);
  private readonly i18n = inject(I18nService);
  private readonly destroyRef = inject(DestroyRef);

  private ctx: CanvasRenderingContext2D | null = null;
  private logicalWidth = 0;
  private logicalHeight = 0;
  private resizeObserver: ResizeObserver | null = null;

  constructor() {
    afterNextRender(() => {
      this.setupCanvas();
    });

    effect(() => {
      this.timer.frameId();
      this.gameId();
      this.phase();
      this.tetris.state();
      this.snake.state();
      this.breakout.state();
      this.i18n.t('canvas.pressStart');
      this.drawFrame();
    });
  }

  onPointerMove(ev: PointerEvent): void {
    if (this.gameId() !== 'breakout' || this.phase() !== 'running') {
      return;
    }
    const canvas = this.canvasRef()?.nativeElement;
    if (!canvas) {
      return;
    }
    const rect = canvas.getBoundingClientRect();
    const mapped = mapPointerToBreakoutX(
      ev.clientX,
      rect,
      this.logicalWidth,
      this.logicalHeight,
      this.breakout.state().paddle.width,
    );
    this.breakout.handleInput({ type: 'paddleMove', x: mapped });
  }

  ariaLabel(): string {
    return `${this.gameId()} — ${this.phase()}`;
  }

  private setupCanvas(): void {
    const canvas = this.canvasRef()?.nativeElement;
    if (!canvas) {
      return;
    }
    this.ctx = canvas.getContext('2d', { alpha: false });
    const host = canvas.parentElement;
    if (!host) {
      return;
    }
    this.resizeObserver = new ResizeObserver(() => this.resizeCanvas());
    this.resizeObserver.observe(host);
    this.resizeCanvas();
    this.destroyRef.onDestroy(() => {
      this.resizeObserver?.disconnect();
      this.resizeObserver = null;
    });
  }

  private resizeCanvas(): void {
    const canvas = this.canvasRef()?.nativeElement;
    if (!canvas || !this.ctx) {
      return;
    }
    const host = canvas.parentElement;
    if (!host) {
      return;
    }
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

  private drawFrame(): void {
    const ctx = this.ctx;
    const w = this.logicalWidth;
    const h = this.logicalHeight;
    if (!ctx || w === 0 || h === 0) {
      return;
    }

    clearCanvas(ctx, w, h);
    switch (this.gameId()) {
      case 'tetris':
        drawTetris(ctx, this.tetris.state(), w, h);
        break;
      case 'snake':
        drawSnake(ctx, this.snake.state(), w, h);
        break;
      case 'breakout':
        drawBreakout(ctx, this.breakout.state(), w, h);
        break;
    }

    if (this.phase() === 'idle') {
      drawIdleOverlay(ctx, w, h, this.i18n.t('canvas.pressStart'));
    }
    if (this.phase() === 'paused') {
      drawPausedOverlay(ctx, w, h, this.i18n.t('canvas.paused'));
    }
  }
}
