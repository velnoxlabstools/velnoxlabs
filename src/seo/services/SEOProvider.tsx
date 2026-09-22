'use client';

import { createContext, useContext, type ReactNode } from 'react';
import { seoService } from './SEOService';

const SEOContext = createContext(seoService);

export function SEOProvider({ children }: { children: ReactNode }) {
  return <SEOContext.Provider value={seoService}>{children}</SEOContext.Provider>;
}

export function useSEOService() {
  return useContext(SEOContext);
}
