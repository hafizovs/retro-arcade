import {
  ChangeDetectionStrategy,
  Component,
  inject,
  output,
} from '@angular/core';
import { GameId } from '../../models/arcade.types';
import { I18nService } from '../../services/i18n.service';
import { ArcadeStore } from '../../state/arcade.store';

@Component({
  selector: 'rae-game-selector',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './game-selector.component.html',
  styleUrl: './game-selector.component.scss',
})
export class GameSelectorComponent {
  readonly i18n = inject(I18nService);
  readonly arcade = inject(ArcadeStore);
  readonly gameSelected = output<GameId>();

  readonly games: {
    id: GameId;
    titleKey: 'games.tetris.title' | 'games.snake.title' | 'games.breakout.title';
    subtitleKey:
      | 'games.tetris.subtitle'
      | 'games.snake.subtitle'
      | 'games.breakout.subtitle';
    accent: string;
  }[] = [
    {
      id: 'tetris',
      titleKey: 'games.tetris.title',
      subtitleKey: 'games.tetris.subtitle',
      accent: 'cyan',
    },
    {
      id: 'snake',
      titleKey: 'games.snake.title',
      subtitleKey: 'games.snake.subtitle',
      accent: 'lime',
    },
    {
      id: 'breakout',
      titleKey: 'games.breakout.title',
      subtitleKey: 'games.breakout.subtitle',
      accent: 'magenta',
    },
  ];

  select(id: GameId): void {
    this.gameSelected.emit(id);
  }
}
