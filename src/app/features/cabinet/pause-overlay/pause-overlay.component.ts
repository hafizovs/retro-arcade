import {
  ChangeDetectionStrategy,
  Component,
  inject,
  output,
} from '@angular/core';
import { I18nService } from '../../../core/i18n.service';

@Component({
  selector: 'rae-pause-overlay',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './pause-overlay.component.html',
  styleUrl: './pause-overlay.component.scss',
})
export class PauseOverlayComponent {
  readonly i18n = inject(I18nService);
  readonly resume = output<void>();
  readonly reset = output<void>();
}
