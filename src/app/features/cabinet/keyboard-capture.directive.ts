import {
  Directive,
  HostListener,
  input,
  output,
} from '@angular/core';
import {
  ArcadePhase,
  Direction,
  GameId,
  GameInputAction,
} from '../../core/models/arcade.types';

@Directive({
  selector: '[raeKeyboardCapture]',
  standalone: true,
})
export class KeyboardCaptureDirective {
  readonly gameId = input.required<GameId>();
  readonly phase = input.required<ArcadePhase>();
  readonly gameInput = output<GameInputAction>();

  @HostListener('window:keydown', ['$event'])
  onKeyDown(ev: KeyboardEvent): void {
    if (this.isFormFocus(ev.target)) {
      return;
    }
    if (this.phase() !== 'running') {
      return;
    }

    const gameId = this.gameId();
    const key = ev.key;

    if (
      key === 'ArrowLeft' ||
      key === 'ArrowRight' ||
      key === 'ArrowUp' ||
      key === 'ArrowDown' ||
      key === ' ' ||
      key === 'Spacebar' ||
      key === 'Enter'
    ) {
      ev.preventDefault();
    }

    switch (gameId) {
      case 'tetris':
        this.handleTetrisKeyDown(key);
        break;
      case 'snake':
        this.handleSnakeKeyDown(key);
        break;
      case 'breakout':
        this.handleBreakoutKeyDown(key);
        break;
    }
  }

  @HostListener('window:keyup', ['$event'])
  onKeyUp(ev: KeyboardEvent): void {
    if (this.isFormFocus(ev.target)) {
      return;
    }
    if (this.phase() !== 'running') {
      return;
    }
    if (this.gameId() !== 'tetris') {
      return;
    }
    if (ev.key === 'ArrowDown') {
      ev.preventDefault();
      this.gameInput.emit({ type: 'softDrop', active: false });
    }
  }

  private handleTetrisKeyDown(key: string): void {
    switch (key) {
      case 'ArrowLeft':
        this.gameInput.emit({ type: 'move', direction: 'left' });
        break;
      case 'ArrowRight':
        this.gameInput.emit({ type: 'move', direction: 'right' });
        break;
      case 'ArrowUp':
        this.gameInput.emit({ type: 'rotate', direction: 'cw' });
        break;
      case 'ArrowDown':
        this.gameInput.emit({ type: 'softDrop', active: true });
        break;
      case ' ':
      case 'Spacebar':
      case 'Enter':
        this.gameInput.emit({ type: 'hardDrop' });
        break;
      default:
        break;
    }
  }

  private handleSnakeKeyDown(key: string): void {
    const map: Record<string, Direction> = {
      ArrowLeft: 'left',
      ArrowRight: 'right',
      ArrowUp: 'up',
      ArrowDown: 'down',
    };
    const direction = map[key];
    if (direction) {
      this.gameInput.emit({ type: 'snakeDirection', direction });
    }
  }

  private handleBreakoutKeyDown(key: string): void {
    switch (key) {
      case 'ArrowLeft':
        this.gameInput.emit({ type: 'paddleNudge', direction: 'left' });
        break;
      case 'ArrowRight':
        this.gameInput.emit({ type: 'paddleNudge', direction: 'right' });
        break;
      case ' ':
      case 'Spacebar':
        this.gameInput.emit({ type: 'launchBall' });
        break;
      default:
        break;
    }
  }

  private isFormFocus(target: EventTarget | null): boolean {
    if (!(target instanceof HTMLElement)) {
      return false;
    }
    const tag = target.tagName;
    return (
      tag === 'INPUT' ||
      tag === 'TEXTAREA' ||
      tag === 'SELECT' ||
      target.isContentEditable
    );
  }
}
