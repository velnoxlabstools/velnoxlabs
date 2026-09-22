'use client';

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import type { PreferenceKey, UserPreferences } from '../types';
import { preferencesManager } from '../services/PreferencesManager';
import { themeManager } from '../personalization';
import { languageManager } from '../personalization';
import { uiLayoutManager } from '../personalization';
import { DEFAULT_PREFERENCES } from '../schemas';

interface PreferenceContextValue {
  preferences: UserPreferences;
  setPreference: <K extends PreferenceKey>(key: K, value: UserPreferences[K]) => void;
  patchPreferences: (partial: Partial<UserPreferences>) => void;
  resetPreferences: () => void;
}

const PreferenceContext = createContext<PreferenceContextValue | null>(null);

export function PreferenceProvider({ children }: { children: ReactNode }) {
  const [preferences, setPreferences] = useState<UserPreferences>(DEFAULT_PREFERENCES);

  useEffect(() => {
    const loaded = preferencesManager.load();
    setPreferences(loaded);
    themeManager.applyToDocument(loaded.theme);
    languageManager.set(loaded.language);
    uiLayoutManager.applyCssVariables();

    return preferencesManager.subscribe((p) => {
      setPreferences(p);
      themeManager.applyToDocument(p.theme);
      uiLayoutManager.applyCssVariables();
    });
  }, []);

  const setPreference = useCallback(
    <K extends PreferenceKey>(key: K, value: UserPreferences[K]) => {
      preferencesManager.set(key, value);
    },
    []
  );

  const patchPreferences = useCallback((partial: Partial<UserPreferences>) => {
    preferencesManager.patch(partial);
  }, []);

  const resetPreferences = useCallback(() => {
    preferencesManager.reset();
  }, []);

  const value = useMemo(
    () => ({ preferences, setPreference, patchPreferences, resetPreferences }),
    [preferences, setPreference, patchPreferences, resetPreferences]
  );

  return (
    <PreferenceContext.Provider value={value}>{children}</PreferenceContext.Provider>
  );
}

export function usePreferences(): PreferenceContextValue {
  const ctx = useContext(PreferenceContext);
  if (!ctx) throw new Error('usePreferences must be used within PreferenceProvider');
  return ctx;
}
