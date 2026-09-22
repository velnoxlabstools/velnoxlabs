import type { PreferenceKey, UserPreferences } from '../types';
import { preferenceLoader } from './PreferenceLoader';
import { preferenceValidator } from '../settings';
import { mergePreferences } from '../utils';
import { DEFAULT_PREFERENCES } from '../schemas';

type Listener = (prefs: UserPreferences) => void;

export class PreferencesManager {
  private prefs: UserPreferences = { ...DEFAULT_PREFERENCES };
  private listeners = new Set<Listener>();
  private loaded = false;

  load(): UserPreferences {
    this.prefs = preferenceLoader.load();
    this.loaded = true;
    this.emit();
    return this.prefs;
  }

  get(): UserPreferences {
    if (!this.loaded && typeof window !== 'undefined') {
      return this.load();
    }
    return this.prefs;
  }

  set<K extends PreferenceKey>(key: K, value: UserPreferences[K]): UserPreferences {
    return this.patch({ [key]: value } as Partial<UserPreferences>);
  }

  patch(partial: Partial<UserPreferences>): UserPreferences {
    const safe = preferenceValidator.sanitize(partial);
    this.prefs = mergePreferences(this.prefs, safe);
    preferenceLoader.save(this.prefs);
    this.emit();
    return this.prefs;
  }

  reset(): UserPreferences {
    this.prefs = { ...DEFAULT_PREFERENCES };
    preferenceLoader.save(this.prefs);
    this.emit();
    return this.prefs;
  }

  subscribe(listener: Listener): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  private emit(): void {
    for (const l of this.listeners) l(this.prefs);
  }
}

export const preferencesManager = new PreferencesManager();
