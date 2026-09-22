'use client';

import {
  createContext,
  useContext,
  useEffect,
  type ReactNode,
} from 'react';
import { performanceService } from './PerformanceService';
import { memoryManager } from '../optimization';

const PerformanceContext = createContext(performanceService);

export function PerformanceProvider({ children }: { children: ReactNode }) {
  useEffect(() => {
    memoryManager.start();
    return () => memoryManager.stop();
  }, []);

  return (
    <PerformanceContext.Provider value={performanceService}>
      {children}
    </PerformanceContext.Provider>
  );
}

export function usePerformanceService() {
  return useContext(PerformanceContext);
}
