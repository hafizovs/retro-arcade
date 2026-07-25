import { Injectable, signal } from '@angular/core';
import {
  LOCALE_STORAGE_KEY,
  THEME_STORAGE_KEY,
} from '../core/constants/arcade.constants';
import { DEFAULT_PLAYER_NAME } from '../core/constants/arcade.constants';
import { LocaleId, ThemeId, UiStoreState } from '../models/arcade.types';

function readTheme(): ThemeId {
  try {
    const value = sessionStorage.getItem(THEME_STORAGE_KEY);
    return value === 'light' ? 'light' : 'dark';
  } catch {
    return 'dark';
  }
}

function readLocale(): LocaleId {
  try {
    const value = sessionStorage.getItem(LOCALE_STORAGE_KEY);
    return value === 'en' ? 'en' : 'ru';
  } catch {
    return 'ru';
  }
}

@Injectable({ providedIn: 'root' })
export class UiStore {
  readonly themeId = signal<ThemeId>(readTheme());
  readonly localeId = signal<LocaleId>(readLocale());
  readonly helpOpen = signal(false);
  readonly pauseOverlayOpen = signal(false);
  readonly gameOverOverlayOpen = signal(false);
  readonly playerNameDraft = signal(DEFAULT_PLAYER_NAME);

  constructor() {
    this.applyTheme(this.themeId());
  }

  snapshot(): UiStoreState {
    return {
      themeId: this.themeId(),
      localeId: this.localeId(),
      helpOpen: this.helpOpen(),
      pauseOverlayOpen: this.pauseOverlayOpen(),
      gameOverOverlayOpen: this.gameOverOverlayOpen(),
      playerNameDraft: this.playerNameDraft(),
    };
  }

  setTheme(themeId: ThemeId): void {
    this.themeId.set(themeId);
    this.applyTheme(themeId);
    try {
      sessionStorage.setItem(THEME_STORAGE_KEY, themeId);
    } catch {
      // ignore
    }
  }

  toggleTheme(): void {
    this.setTheme(this.themeId() === 'dark' ? 'light' : 'dark');
  }

  setLocale(localeId: LocaleId): void {
    this.localeId.set(localeId);
    try {
      sessionStorage.setItem(LOCALE_STORAGE_KEY, localeId);
    } catch {
      // ignore
    }
  }

  toggleLocale(): void {
    this.setLocale(this.localeId() === 'ru' ? 'en' : 'ru');
  }

  openHelp(): void {
    this.helpOpen.set(true);
  }

  closeHelp(): void {
    this.helpOpen.set(false);
  }

  toggleHelp(): void {
    this.helpOpen.update((v) => !v);
  }

  setPauseOverlayOpen(open: boolean): void {
    this.pauseOverlayOpen.set(open);
  }

  setGameOverOverlayOpen(open: boolean): void {
    this.gameOverOverlayOpen.set(open);
  }

  setPlayerNameDraft(name: string): void {
    this.playerNameDraft.set(name);
  }

  private applyTheme(themeId: ThemeId): void {
    document.documentElement.dataset['theme'] = themeId;
  }
}
