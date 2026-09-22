'use client';

import {
  createContext,
  useContext,
  useMemo,
  type ReactNode,
} from 'react';
import type { LayoutVariant } from '@/types/layout';

interface LayoutContextValue {
  variant: LayoutVariant;
}

const LayoutContext = createContext<LayoutContextValue | undefined>(undefined);

interface LayoutProviderProps {
  children: ReactNode;
  variant?: LayoutVariant;
}

export function LayoutProvider({
  children,
  variant = 'default',
}: LayoutProviderProps) {
  const value = useMemo(() => ({ variant }), [variant]);

  return (
    <LayoutContext.Provider value={value}>{children}</LayoutContext.Provider>
  );
}

export function useLayout(): LayoutContextValue {
  const context = useContext(LayoutContext);
  if (!context) {
    return { variant: 'default' };
  }
  return context;
}
