import { preferencesManager } from './PreferencesManager';
import type { ThemePreference, LanguagePreference, ExportFormatPreference } from '../types';

export class SettingsManager {
  setTheme(theme: ThemePreference) {
    return preferencesManager.set('theme', theme);
  }

  setLanguage(language: LanguagePreference) {
    return preferencesManager.set('language', language);
  }

  setExportFormat(format: ExportFormatPreference) {
    return preferencesManager.set('defaultExportFormat', format);
  }

  setReducedMotion(enabled: boolean) {
    return preferencesManager.patch({
      reducedMotion: enabled,
      animation: enabled ? 'reduced' : 'full',
    });
  }

  getAll() {
    return preferencesManager.get();
  }
}

export const settingsManager = new SettingsManager();
