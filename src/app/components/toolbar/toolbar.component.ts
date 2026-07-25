import {
  ChangeDetectionStrategy,
  Component,
  inject,
} from '@angular/core';
import { I18nService } from '../../services/i18n.service';
import { UiStore } from '../../state/ui.store';

@Component({
  selector: 'rae-toolbar',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './toolbar.component.html',
  styleUrl: './toolbar.component.scss',
})
export class ToolbarComponent {
  readonly i18n = inject(I18nService);
  readonly ui = inject(UiStore);

  toggleTheme(): void {
    this.ui.toggleTheme();
  }

  toggleLang(): void {
    this.ui.toggleLocale();
  }

  openHelp(): void {
    this.ui.openHelp();
  }
}
