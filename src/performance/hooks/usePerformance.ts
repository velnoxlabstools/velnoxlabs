'use client';

import { useCallback, useEffect, useState } from 'react';
import { performanceService } from '../services';
import type { WebVitalsSnapshot } from '../types';

export function usePerformance() {
  const [vitals, setVitals] = useState<WebVitalsSnapshot>({});

  useEffect(() => {
    setVitals(performanceService.vitals.getSnapshot());
  }, []);

  const reportVital = useCallback((name: string, value: number, path?: string) => {
    performanceService.reportVital(name, value, path);
    setVitals(performanceService.vitals.getSnapshot());
  }, []);

  return {
    vitals,
    reportVital,
    cache: performanceService.cache,
    snapshot: () => performanceService.snapshot(),
    budget: performanceService.budget,
  };
}

export function useCachedValue<T>(
  ns: Parameters<typeof performanceService.getCached>[0],
  key: string,
  factory: () => T,
  ttlMs?: number
): T {
  const cached = performanceService.getCached<T>(ns, key);
  if (cached != null) return cached;
  const value = factory();
  performanceService.setCached(ns, key, value, ttlMs);
  return value;
}
