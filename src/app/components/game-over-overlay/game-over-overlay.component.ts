import {
  afterNextRender,
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  inject,
  output,
  viewChild,
} from '@angular/core';
import {
  DEFAULT_PLAYER_NAME,
  PLAYER_NAME_MAX_LEN,
} from '../../core/constants/arcade.constants';
import { I18nService } from '../../services/i18n.service';
import { ArcadeStore } from '../../state/arcade.store';
import { UiStore } from '../../state/ui.store';

@Component({
  selector: 'rae-game-over-overlay',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './game-over-overlay.component.html',
  styleUrl: './game-over-overlay.component.scss',
})
export class GameOverOverlayComponent {
  readonly i18n = inject(I18nService);
  readonly arcade = inject(ArcadeStore);
  readonly ui = inject(UiStore);

  readonly save = output<string>();
  readonly playAgain = output<void>();
  readonly menu = output<void>();

  private readonly nameInput =
    viewChild<ElementRef<HTMLInputElement>>('nameInput');

  constructor() {
    afterNextRender(() => {
      this.nameInput()?.nativeElement.focus();
    });
  }

  titleKey(): 'gameover.win' | 'gameover.lose' {
    return this.arcade.lastGameOverReason() === 'win'
      ? 'gameover.win'
      : 'gameover.lose';
  }

  onNameInput(ev: Event): void {
    const value = (ev.target as HTMLInputElement).value.slice(
      0,
      PLAYER_NAME_MAX_LEN,
    );
    this.ui.setPlayerNameDraft(value);
  }

  onSave(): void {
    const name = this.ui.playerNameDraft().trim() || DEFAULT_PLAYER_NAME;
    this.save.emit(name.slice(0, PLAYER_NAME_MAX_LEN));
  }
}
