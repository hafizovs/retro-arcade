import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
} from '@angular/core';
import { I18nKey } from '../../i18n/i18n.keys';
import { I18nService } from '../../i18n.service';
import { ArcadeStore } from '../../../features/cabinet/arcade.store';

@Component({
  selector: 'rae-status-bar',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './status-bar.component.html',
  styleUrl: './status-bar.component.scss',
})
export class StatusBarComponent {
  readonly i18n = inject(I18nService);
  readonly arcade = inject(ArcadeStore);

  readonly gameTitle = computed(() => {
    switch (this.arcade.activeGameId()) {
      case 'tetris':
        return this.i18n.t('games.tetris.title');
      case 'snake':
        return this.i18n.t('games.snake.title');
      case 'breakout':
        return this.i18n.t('games.breakout.title');
    }
  });

  readonly phaseLabel = computed(() => {
    const key = `status.${this.arcade.phase()}` as I18nKey;
    return this.i18n.t(key);
  });

  readonly hint = computed(() => {
    const phase = this.arcade.phase();
    if (phase === 'idle') {
      return this.i18n.t('status.hint.idle');
    }
    if (phase === 'paused') {
      return this.i18n.t('status.hint.paused');
    }
    if (phase === 'gameover') {
      return this.i18n.t('status.hint.gameover');
    }
    switch (this.arcade.activeGameId()) {
      case 'tetris':
        return this.i18n.t('status.hint.running.tetris');
      case 'snake':
        return this.i18n.t('status.hint.running.snake');
      case 'breakout':
        return this.i18n.t('status.hint.running.breakout');
    }
  });
}
