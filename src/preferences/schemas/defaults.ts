import type { UserPreferences } from '../types';

export const DEFAULT_PREFERENCES: UserPreferences = {
  theme: 'system',
  language: 'en',
  defaultToolView: 'comfortable',
  defaultExportFormat: 'text',
  resultDisplayMode: 'split',
  toolLayout: 'default',
  animation: 'full',
  reducedMotion: false,
  accessibilityHighContrast: false,
  fontScale: 1,
  homepageLayout: 'default',
  lastToolSlug: null,
  lastCategorySlug: null,
  lastSearchQuery: null,
  favoriteToolIds: [],
  favoriteCategoryIds: [],
};
