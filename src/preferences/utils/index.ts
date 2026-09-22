import type { UserPreferences } from '../types';
import { DEFAULT_PREFERENCES } from '../schemas';

export function clampFontScale(n: number): number {
  if (Number.isNaN(n)) return 1;
  return Math.min(1.5, Math.max(0.85, n));
}

export function mergePreferences(
  base: UserPreferences,
  patch: Partial<UserPreferences>
): UserPreferences {
  return {
    ...base,
    ...patch,
    favoriteToolIds: patch.favoriteToolIds ?? base.favoriteToolIds,
    favoriteCategoryIds: patch.favoriteCategoryIds ?? base.favoriteCategoryIds,
    fontScale: patch.fontScale != null ? clampFontScale(patch.fontScale) : base.fontScale,
  };
}

export function safeParsePreferences(raw: string | null): Partial<UserPreferences> | null {
  if (!raw) return null;
  try {
    const data = JSON.parse(raw) as Partial<UserPreferences>;
    if (!data || typeof data !== 'object') return null;
    return data;
  } catch {
    return null;
  }
}

export function withDefaults(partial?: Partial<UserPreferences> | null): UserPreferences {
  return mergePreferences(DEFAULT_PREFERENCES, partial ?? {});
}
