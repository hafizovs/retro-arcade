import { computed, inject, Injectable } from '@angular/core';
import { I18nKey } from '../i18n/i18n.keys';
import { EN_DICTIONARY } from '../i18n/en';
import { RU_DICTIONARY } from '../i18n/ru';
import { UiStore } from '../state/ui.store';

@Injectable({ providedIn: 'root' })
export class I18nService {
  private readonly ui = inject(UiStore);

  private readonly dictionary = computed(() =>
    this.ui.localeId() === 'en' ? EN_DICTIONARY : RU_DICTIONARY,
  );

  t(key: I18nKey): string {
    return this.dictionary()[key] ?? key;
  }
}
