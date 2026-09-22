'use client';

import { createContext, useContext, type ReactNode } from 'react';
import { useCategoryEngine } from '../hooks/useCategoryEngine';

type Value = ReturnType<typeof useCategoryEngine>;

const CategoryContext = createContext<Value | null>(null);

export function CategoryProvider({ children }: { children: ReactNode }) {
  const value = useCategoryEngine();
  return (
    <CategoryContext.Provider value={value}>{children}</CategoryContext.Provider>
  );
}

export function useCategoryContext(): Value {
  const ctx = useContext(CategoryContext);
  if (!ctx) throw new Error('useCategoryContext must be used within CategoryProvider');
  return ctx;
}
