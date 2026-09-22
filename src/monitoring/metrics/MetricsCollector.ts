import type { MetricName } from "../types";
import { metricsRegistry } from "./MetricsRegistry";

export class MetricsCollector {
  record(name: MetricName | string, value: number, tags?: Record<string, string>): void {
    // never throw — monitoring must not break UI
    try {
      metricsRegistry.push({ name, value, tags, timestamp: Date.now() });
    } catch {
      /* ignore */
    }
  }

  timeAsync<T>(name: MetricName | string, fn: () => Promise<T>, tags?: Record<string, string>): Promise<T> {
    const start = Date.now();
    return fn().finally(() => this.record(name, Date.now() - start, tags));
  }
}

export const metricsCollector = new MetricsCollector();
