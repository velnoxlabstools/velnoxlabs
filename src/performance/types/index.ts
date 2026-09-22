export type CacheNamespace =
  | 'homepage'
  | 'category'
  | 'tool-meta'
  | 'search'
  | 'seo'
  | 'registry'
  | 'config'
  | 'generic';

export interface CacheEntry<T> {
  value: T;
  expiresAt: number;
  createdAt: number;
}

export interface PerformanceMetric {
  name: string;
  value: number;
  rating?: 'good' | 'needs-improvement' | 'poor';
  timestamp: number;
  path?: string;
}

export interface WebVitalsSnapshot {
  lcp?: number;
  cls?: number;
  inp?: number;
  fcp?: number;
  ttfb?: number;
}

export interface PerformanceBudget {
  maxJsKb: number;
  maxCssKb: number;
  maxImageKb: number;
  maxLcpMs: number;
  maxCls: number;
  maxInpMs: number;
}

export const DEFAULT_PERFORMANCE_BUDGET: PerformanceBudget = {
  maxJsKb: 200,
  maxCssKb: 50,
  maxImageKb: 150,
  maxLcpMs: 2500,
  maxCls: 0.1,
  maxInpMs: 200,
};
