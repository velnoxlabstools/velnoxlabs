'use client';

import { createContext, useContext, useEffect, type ReactNode } from 'react';
import { analyticsManager } from '../services/AnalyticsManager';
import type { AnalyticsProviderId } from '../types';

const AnalyticsContext = createContext(analyticsManager);

interface AnalyticsProviderProps {
  children: ReactNode;
  providers?: AnalyticsProviderId[];
}

export function AnalyticsProvider({
  children,
  providers = ['console'],
}: AnalyticsProviderProps) {
  useEffect(() => {
    analyticsManager.configure(providers);
  }, [providers]);

  return (
    <AnalyticsContext.Provider value={analyticsManager}>
      {children}
    </AnalyticsContext.Provider>
  );
}

export function useAnalyticsManager() {
  return useContext(AnalyticsContext);
}
