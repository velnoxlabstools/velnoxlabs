import type { MetricSample } from "../types";

const samples: MetricSample[] = [];
const MAX = 500;

export class MetricsRegistry {
  push(sample: MetricSample): void {
    samples.push(sample);
    if (samples.length > MAX) samples.splice(0, samples.length - MAX);
  }

  list(name?: string): MetricSample[] {
    return name ? samples.filter((s) => s.name === name) : [...samples];
  }

  average(name: string): number {
    const list = this.list(name);
    if (!list.length) return 0;
    return list.reduce((s, x) => s + x.value, 0) / list.length;
  }

  clear(): void {
    samples.length = 0;
  }
}

export const metricsRegistry = new MetricsRegistry();
