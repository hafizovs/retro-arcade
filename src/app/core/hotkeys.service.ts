import {
  DestroyRef,
  Injectable,
  inject,
} from '@angular/core';
import { ArcadeStore } from '../features/cabinet/arcade.store';
import { UiStore } from './ui/ui.store';

export type HotkeyCommand =
  | 'start'
  | 'pause'
  | 'reset'
  | 'selectTetris'
  | 'selectSnake'
  | 'selectBreakout'
  | 'theme'
  | 'locale'
  | 'help'
  | 'escape';

@Injectable({ providedIn: 'root' })
export class HotkeysService {
  private readonly arcade = inject(ArcadeStore);
  private readonly ui = inject(UiStore);
  private readonly destroyRef = inject(DestroyRef);

  private handler: ((command: HotkeyCommand) => void) | null = null;
  private bound = false;

  start(onCommand: (command: HotkeyCommand) => void): void {
    this.handler = onCommand;
    if (this.bound) {
      return;
    }
    const listener = (ev: KeyboardEvent) => this.onKeyDown(ev);
    window.addEventListener('keydown', listener);
    this.bound = true;
    this.destroyRef.onDestroy(() => {
      window.removeEventListener('keydown', listener);
      this.bound = false;
    });
  }

  private onKeyDown(ev: KeyboardEvent): void {
    if (this.isFormFocus(ev.target)) {
      if (ev.key === 'Escape') {
        this.handler?.('escape');
      }
      return;
    }

    const key = ev.key.length === 1 ? ev.key.toLowerCase() : ev.key;

    switch (key) {
      case 'p':
        ev.preventDefault();
        this.handler?.('pause');
        break;
      case 'r':
        ev.preventDefault();
        this.handler?.('reset');
        break;
      case 'Enter':
        if (
          this.arcade.phase() === 'idle' ||
          this.arcade.phase() === 'paused'
        ) {
          ev.preventDefault();
          this.handler?.('start');
        }
        break;
      case ' ':
      case 'Spacebar':
        if (
          this.arcade.phase() === 'idle' ||
          this.arcade.phase() === 'paused'
        ) {
          ev.preventDefault();
          this.handler?.('start');
        }
        break;
      case '1':
        ev.preventDefault();
        this.handler?.('selectTetris');
        break;
      case '2':
        ev.preventDefault();
        this.handler?.('selectSnake');
        break;
      case '3':
        ev.preventDefault();
        this.handler?.('selectBreakout');
        break;
      case 't':
        ev.preventDefault();
        this.ui.toggleTheme();
        this.handler?.('theme');
        break;
      case 'g':
        ev.preventDefault();
        this.ui.toggleLocale();
        this.handler?.('locale');
        break;
      case 'h':
        ev.preventDefault();
        this.ui.toggleHelp();
        this.handler?.('help');
        break;
      case 'Escape':
        ev.preventDefault();
        this.handler?.('escape');
        break;
      default:
        break;
    }

    void this.arcade;
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
