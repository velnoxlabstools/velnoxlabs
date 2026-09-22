import type { LanguagePreference } from '../types';
import { preferencesManager } from '../services/PreferencesManager';

export class LanguageManager {
  get(): LanguagePreference {
    return preferencesManager.get().language;
  }

  set(language: LanguagePreference): void {
    preferencesManager.set('language', language);
    if (typeof document !== 'undefined') {
      document.documentElement.lang = language;
    }
  }
}

export const languageManager = new LanguageManager();
