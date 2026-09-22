import { metricsCollector } from "./MetricsCollector";

export class PerformanceMetrics {
  pageLoad(ms: number): void {
    metricsCollector.record("page_load", ms);
  }

  responseTime(ms: number): void {
    metricsCollector.record("response_time", ms);
  }

  toolExecution(ms: number, toolSlug?: string): void {
    metricsCollector.record("tool_execution", ms, toolSlug ? { tool: toolSlug } : undefined);
  }

  cacheHitRate(rate: number): void {
    metricsCollector.record("cache_hit_rate", rate);
  }
}

export const performanceMetrics = new PerformanceMetrics();
