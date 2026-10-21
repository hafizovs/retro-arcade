import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
} from '@angular/core';
import { LEADERBOARD_MAX_ENTRIES } from '../../../core/constants/arcade.constants';
import { I18nService } from '../../../core/i18n.service';
import { LeaderboardService } from '../leaderboard.service';
import { ArcadeStore } from '../../cabinet/arcade.store';

@Component({
  selector: 'rae-leaderboard',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './leaderboard.component.html',
  styleUrl: './leaderboard.component.scss',
})
export class LeaderboardComponent {
  readonly i18n = inject(I18nService);
  private readonly leaderboard = inject(LeaderboardService);
  private readonly arcade = inject(ArcadeStore);

  readonly entries = computed(() =>
    this.leaderboard.getTopForGame(
      this.arcade.activeGameId(),
      LEADERBOARD_MAX_ENTRIES,
    ),
  );

  formatDate(iso: string): string {
    try {
      const d = new Date(iso);
      return d.toLocaleDateString(undefined, {
        month: 'short',
        day: 'numeric',
      });
    } catch {
      return '';
    }
  }
}
