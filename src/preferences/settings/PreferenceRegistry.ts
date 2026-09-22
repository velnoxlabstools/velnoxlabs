import type { PreferenceKey } from '../types';

/** Declarative registry of preference keys for docs / future UI settings screens */
export const PREFERENCE_KEYS: PreferenceKey[] = [
  'theme',
  'language',
  'defaultToolView',
  'defaultExportFormat',
  'resultDisplayMode',
  'toolLayout',
  'animation',
  'reducedMotion',
  'accessibilityHighContrast',
  'fontScale',
  'homepageLayout',
  'lastToolSlug',
  'lastCategorySlug',
  'lastSearchQuery',
  'favoriteToolIds',
  'favoriteCategoryIds',
];

export class PreferenceRegistry {
  keys(): PreferenceKey[] {
    return [...PREFERENCE_KEYS];
  }
}

export const preferenceRegistry = new PreferenceRegistry();
