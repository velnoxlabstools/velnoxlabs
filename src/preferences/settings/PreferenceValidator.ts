import type { UserPreferences } from '../types';
import { clampFontScale } from '../utils';

const THEMES = new Set(['light', 'dark', 'system']);
const LANGS = new Set(['en', 'es', 'fr', 'de', 'hi', 'ja', 'zh']);
const VIEWS = new Set(['comfortable', 'compact']);
const EXPORTS = new Set(['text', 'json', 'csv', 'txt', 'markdown']);
const RESULTS = new Set(['split', 'stacked', 'tabs']);
const LAYOUTS = new Set(['default', 'focus', 'wide']);
const ANIMS = new Set(['full', 'reduced', 'none']);
const HOMES = new Set(['default', 'dense', 'minimal']);

export class PreferenceValidator {
  sanitize(partial: Partial<UserPreferences>): Partial<UserPreferences> {
    const out: Partial<UserPreferences> = {};

    if (partial.theme && THEMES.has(partial.theme)) out.theme = partial.theme;
    if (partial.language && LANGS.has(partial.language)) out.language = partial.language;
    if (partial.defaultToolView && VIEWS.has(partial.defaultToolView)) {
      out.defaultToolView = partial.defaultToolView;
    }
    if (partial.defaultExportFormat && EXPORTS.has(partial.defaultExportFormat)) {
      out.defaultExportFormat = partial.defaultExportFormat;
    }
    if (partial.resultDisplayMode && RESULTS.has(partial.resultDisplayMode)) {
      out.resultDisplayMode = partial.resultDisplayMode;
    }
    if (partial.toolLayout && LAYOUTS.has(partial.toolLayout)) out.toolLayout = partial.toolLayout;
    if (partial.animation && ANIMS.has(partial.animation)) out.animation = partial.animation;
    if (typeof partial.reducedMotion === 'boolean') out.reducedMotion = partial.reducedMotion;
    if (typeof partial.accessibilityHighContrast === 'boolean') {
      out.accessibilityHighContrast = partial.accessibilityHighContrast;
    }
    if (typeof partial.fontScale === 'number') out.fontScale = clampFontScale(partial.fontScale);
    if (partial.homepageLayout && HOMES.has(partial.homepageLayout)) {
      out.homepageLayout = partial.homepageLayout;
    }
    if (partial.lastToolSlug === null || typeof partial.lastToolSlug === 'string') {
      out.lastToolSlug = partial.lastToolSlug ?? null;
    }
    if (partial.lastCategorySlug === null || typeof partial.lastCategorySlug === 'string') {
      out.lastCategorySlug = partial.lastCategorySlug ?? null;
    }
    if (partial.lastSearchQuery === null || typeof partial.lastSearchQuery === 'string') {
      out.lastSearchQuery = partial.lastSearchQuery ?? null;
    }
    if (Array.isArray(partial.favoriteToolIds)) {
      out.favoriteToolIds = partial.favoriteToolIds.filter((x) => typeof x === 'string').slice(0, 100);
    }
    if (Array.isArray(partial.favoriteCategoryIds)) {
      out.favoriteCategoryIds = partial.favoriteCategoryIds
        .filter((x) => typeof x === 'string')
        .slice(0, 100);
    }

    return out;
  }
}

export const preferenceValidator = new PreferenceValidator();
