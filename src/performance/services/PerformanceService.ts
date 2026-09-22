import { cacheManager } from '../cache';
import { memoryManager } from '../optimization';
import { coreWebVitalsTracker } from '../monitoring';
import { performanceLogger } from '../monitoring';
import { routePrefetchManager } from '../prefetch';
import { DEFAULT_PERFORMANCE_BUDGET, type CacheNamespace } from '../types';
import type { PerformanceBudget } from '../types';

export class PerformanceService {
  readonly budget: PerformanceBudget = DEFAULT_PERFORMANCE_BUDGET;

  cache = cacheManager;
  vitals = coreWebVitalsTracker;
  logger = performanceLogger;
  prefetch = routePrefetchManager;

  getCached<T>(ns: CacheNamespace, key: string): T | null {
    return cacheManager.get<T>(ns, key);
  }

  setCached<T>(ns: CacheNamespace, key: string, value: T, ttlMs?: number): void {
    cacheManager.set(ns, key, value, ttlMs);
  }

  invalidateCache(ns?: CacheNamespace): void {
    if (ns) cacheManager.invalidate(ns);
    else cacheManager.invalidateAll();
  }

  startMemoryHygiene(): void {
    memoryManager.start();
  }

  stopMemoryHygiene(): void {
    memoryManager.stop();
  }

  reportVital(name: string, value: number, path?: string): void {
    coreWebVitalsTracker.report(name, value, path);
  }

  snapshot() {
    return {
      vitals: coreWebVitalsTracker.getSnapshot(),
      metrics: performanceLogger.getAll(),
      cache: cacheManager.stats(),
      budget: this.budget,
    };
  }
}

export const performanceService = new PerformanceService();
