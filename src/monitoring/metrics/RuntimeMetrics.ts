import { metricsCollector } from "./MetricsCollector";

export class RuntimeMetrics {
  memory(): void {
    try {
      const perf = performance as Performance & { memory?: { usedJSHeapSize: number } };
      if (perf.memory?.usedJSHeapSize != null) {
        metricsCollector.record("memory", perf.memory.usedJSHeapSize);
      }
    } catch {
      /* unsupported */
    }
  }
}

export const runtimeMetrics = new RuntimeMetrics();
