import type { ThemePreference } from '../types';
import { preferencesManager } from '../services/PreferencesManager';

/**
 * Bridges preferences.theme to document class / next-themes style consumers.
 */
export class ThemeManager {
  get(): ThemePreference {
    return preferencesManager.get().theme;
  }

  set(theme: ThemePreference): void {
    preferencesManager.set('theme', theme);
    this.applyToDocument(theme);
  }

  applyToDocument(theme: ThemePreference = this.get()): void {
    if (typeof document === 'undefined') return;
    const root = document.documentElement;
    const resolved =
      theme === 'system'
        ? window.matchMedia('(prefers-color-scheme: dark)').matches
          ? 'dark'
          : 'light'
        : theme;
    root.classList.toggle('dark', resolved === 'dark');
    root.style.colorScheme = resolved;
  }
}

export const themeManager = new ThemeManager();
