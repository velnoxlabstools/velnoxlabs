export type ThemePreference = 'light' | 'dark' | 'system';
export type LanguagePreference = 'en' | 'es' | 'fr' | 'de' | 'hi' | 'ja' | 'zh';
export type ToolViewMode = 'comfortable' | 'compact';
export type ResultDisplayMode = 'split' | 'stacked' | 'tabs';
export type ToolLayoutMode = 'default' | 'focus' | 'wide';
export type ExportFormatPreference = 'text' | 'json' | 'csv' | 'txt' | 'markdown';
export type AnimationPreference = 'full' | 'reduced' | 'none';

export interface UserPreferences {
  theme: ThemePreference;
  language: LanguagePreference;
  defaultToolView: ToolViewMode;
  defaultExportFormat: ExportFormatPreference;
  resultDisplayMode: ResultDisplayMode;
  toolLayout: ToolLayoutMode;
  animation: AnimationPreference;
  reducedMotion: boolean;
  accessibilityHighContrast: boolean;
  fontScale: number;
  homepageLayout: 'default' | 'dense' | 'minimal';
  lastToolSlug: string | null;
  lastCategorySlug: string | null;
  lastSearchQuery: string | null;
  favoriteToolIds: string[];
  favoriteCategoryIds: string[];
}

export type PreferenceKey = keyof UserPreferences;
