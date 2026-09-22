import type { UserPreferences } from '../types';
import { localStorageAdapter } from '../storage';
import { preferenceValidator } from '../settings';
import { safeParsePreferences, withDefaults } from '../utils';

const STORAGE_KEY = 'velnox_preferences_v1';

export class PreferenceLoader {
  load(): UserPreferences {
    const raw = localStorageAdapter.get(STORAGE_KEY);
    const parsed = safeParsePreferences(raw);
    const safe = preferenceValidator.sanitize(parsed ?? {});
    return withDefaults(safe);
  }

  save(prefs: UserPreferences): void {
    const safe = preferenceValidator.sanitize(prefs);
    localStorageAdapter.set(STORAGE_KEY, JSON.stringify(withDefaults(safe)));
  }

  clear(): void {
    localStorageAdapter.remove(STORAGE_KEY);
  }
}

export const preferenceLoader = new PreferenceLoader();
