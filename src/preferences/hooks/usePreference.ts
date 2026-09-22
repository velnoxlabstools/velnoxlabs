'use client';

import { usePreferences } from '../providers';
import type { PreferenceKey, UserPreferences } from '../types';

export function usePreference<K extends PreferenceKey>(key: K): [
  UserPreferences[K],
  (value: UserPreferences[K]) => void
] {
  const { preferences, setPreference } = usePreferences();
  return [preferences[key], (value) => setPreference(key, value)];
}
