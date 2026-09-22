import { metricsCollector } from "./MetricsCollector";

export class ErrorMetrics {
  increment(tag?: string): void {
    metricsCollector.record("error_rate", 1, tag ? { tag } : undefined);
  }
}

export const errorMetrics = new ErrorMetrics();
