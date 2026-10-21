import {
  ChangeDetectionStrategy,
  Component,
  inject,
  output,
} from '@angular/core';
import { DIFFICULTY_IDS } from '../../../core/constants/difficulty.constants';
import { DifficultyId } from '../../../core/models/arcade.types';
import { I18nService } from '../../../core/i18n.service';
import { ArcadeStore } from '../arcade.store';

@Component({
  selector: 'rae-telemetry-panel',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './telemetry-panel.component.html',
  styleUrl: './telemetry-panel.component.scss',
})
export class TelemetryPanelComponent {
  readonly i18n = inject(I18nService);
  readonly arcade = inject(ArcadeStore);
  readonly difficultyChange = output<DifficultyId>();

  readonly difficulties = DIFFICULTY_IDS;

  formatSession(ms: number): string {
    const totalSec = Math.floor(ms / 1000);
    const m = Math.floor(totalSec / 60)
      .toString()
      .padStart(2, '0');
    const s = (totalSec % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  }

  onDifficultyChange(ev: Event): void {
    const value = (ev.target as HTMLSelectElement).value as DifficultyId;
    this.difficultyChange.emit(value);
  }

  difficultyLabel(id: DifficultyId): string {
    switch (id) {
      case 'easy':
        return this.i18n.t('difficulty.easy');
      case 'normal':
        return this.i18n.t('difficulty.normal');
      case 'hard':
        return this.i18n.t('difficulty.hard');
    }
  }
}
