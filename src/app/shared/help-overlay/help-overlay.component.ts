import {
  ChangeDetectionStrategy,
  Component,
  inject,
  output,
} from '@angular/core';
import { I18nService } from '../../core/i18n.service';

@Component({
  selector: 'rae-help-overlay',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './help-overlay.component.html',
  styleUrl: './help-overlay.component.scss',
})
export class HelpOverlayComponent {
  readonly i18n = inject(I18nService);
  readonly close = output<void>();

  readonly hotkeys = [
    { key: 'Enter / Space', action: 'Start / Resume / Hard drop' },
    { key: 'P', action: 'Pause toggle' },
    { key: 'R', action: 'Reset' },
    { key: '1 / 2 / 3', action: 'Select Tetris / Snake / Breakout' },
    { key: 'Arrows', action: 'Game controls' },
    { key: 'T', action: 'Theme' },
    { key: 'G', action: 'Language' },
    { key: 'H', action: 'Help' },
    { key: 'Esc', action: 'Close overlay / Resume' },
  ];
}
