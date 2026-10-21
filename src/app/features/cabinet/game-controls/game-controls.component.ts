import {
  ChangeDetectionStrategy,
  Component,
  inject,
  output,
} from '@angular/core';
import { I18nService } from '../../../core/i18n.service';
import { ArcadeStore } from '../arcade.store';

@Component({
  selector: 'rae-game-controls',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './game-controls.component.html',
  styleUrl: './game-controls.component.scss',
})
export class GameControlsComponent {
  readonly i18n = inject(I18nService);
  readonly arcade = inject(ArcadeStore);

  readonly start = output<void>();
  readonly pause = output<void>();
  readonly reset = output<void>();

  canStart(): boolean {
    const phase = this.arcade.phase();
    return phase === 'idle' || phase === 'paused';
  }

  canPause(): boolean {
    return this.arcade.phase() === 'running';
  }
}
