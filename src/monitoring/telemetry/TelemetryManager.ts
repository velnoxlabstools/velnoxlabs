import type { MetricSample } from "../types";
import { metricsRegistry } from "../metrics";

export type TelemetrySink = (batch: MetricSample[]) => void | Promise<void>;

/**
 * Batched async telemetry — replace sink for external APM later.
 */
export class TelemetryManager {
  private queue: MetricSample[] = [];
  private sink: TelemetrySink | null = null;
  private timer: ReturnType<typeof setTimeout> | null = null;

  setSink(sink: TelemetrySink): void {
    this.sink = sink;
  }

  enqueue(sample: MetricSample): void {
    this.queue.push(sample);
    if (!this.timer) {
      this.timer = setTimeout(() => void this.flush(), 2000);
    }
  }

  async flush(): Promise<void> {
    if (this.timer) {
      clearTimeout(this.timer);
      this.timer = null;
    }
    if (!this.queue.length) return;
    const batch = this.queue.splice(0, this.queue.length);
    // always mirror into registry
    for (const s of batch) metricsRegistry.push(s);
    if (this.sink) {
      try {
        await this.sink(batch);
      } catch {
        /* never block */
      }
    }
  }
}

export const telemetryManager = new TelemetryManager();
