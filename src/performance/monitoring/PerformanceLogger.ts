import type { PerformanceMetric } from '../types';

export class PerformanceLogger {
  private metrics: PerformanceMetric[] = [];
  private max = 200;

  record(metric: PerformanceMetric): void {
    this.metrics.push(metric);
    if (this.metrics.length > this.max) {
      this.metrics = this.metrics.slice(-this.max);
    }
    if (process.env.NODE_ENV !== 'production') {
      console.debug('[perf]', metric.name, metric.value, metric.rating ?? '');
    }
  }

  getAll(): PerformanceMetric[] {
    return [...this.metrics];
  }

  clear(): void {
    this.metrics = [];
  }
}

export const performanceLogger = new PerformanceLogger();
