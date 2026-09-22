'use client';

import { createContext, useContext, type ReactNode } from 'react';
import { exchangeManager } from './services/ExchangeManager';

const Ctx = createContext(exchangeManager);

export function ExchangeProvider({ children }: { children: ReactNode }) {
  return <Ctx.Provider value={exchangeManager}>{children}</Ctx.Provider>;
}

export function useExchangeManager() {
  return useContext(Ctx);
}
