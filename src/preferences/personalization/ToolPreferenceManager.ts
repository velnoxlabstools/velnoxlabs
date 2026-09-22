import { preferencesManager } from '../services/PreferencesManager';

export class ToolPreferenceManager {
  rememberTool(slug: string): void {
    preferencesManager.set('lastToolSlug', slug);
  }

  rememberCategory(slug: string): void {
    preferencesManager.set('lastCategorySlug', slug);
  }

  rememberSearch(query: string): void {
    preferencesManager.set('lastSearchQuery', query);
  }

  toggleFavoriteTool(id: string): void {
    const prefs = preferencesManager.get();
    const set = new Set(prefs.favoriteToolIds);
    if (set.has(id)) set.delete(id);
    else set.add(id);
    preferencesManager.set('favoriteToolIds', [...set]);
  }

  getLastTool(): string | null {
    return preferencesManager.get().lastToolSlug;
  }
}

export const toolPreferenceManager = new ToolPreferenceManager();
