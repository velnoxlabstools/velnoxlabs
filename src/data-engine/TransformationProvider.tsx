'use client';

import { createContext, useContext, type ReactNode } from 'react';
import { dataEngine } from './services/DataEngine';

const Ctx = createContext(dataEngine);

export function TransformationProvider({ children }: { children: ReactNode }) {
  return <Ctx.Provider value={dataEngine}>{children}</Ctx.Provider>;
}

export function useTransformation() {
  return useContext(Ctx);
}
