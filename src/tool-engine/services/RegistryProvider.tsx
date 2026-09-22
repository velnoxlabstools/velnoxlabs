'use client';

import { createContext, useContext, type ReactNode } from 'react';
import { useRegistry } from '../hooks/useRegistry';

type RegistryContextValue = ReturnType<typeof useRegistry>;

const RegistryContext = createContext<RegistryContextValue | null>(null);

export function RegistryProvider({ children }: { children: ReactNode }) {
  const value = useRegistry();
  return (
    <RegistryContext.Provider value={value}>{children}</RegistryContext.Provider>
  );
}

export function useRegistryContext(): RegistryContextValue {
  const ctx = useContext(RegistryContext);
  if (!ctx) {
    throw new Error('useRegistryContext must be used within RegistryProvider');
  }
  return ctx;
}
