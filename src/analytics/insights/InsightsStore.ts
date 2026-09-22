import type { AnalyticsEvent } from '../types';

const events: AnalyticsEvent[] = [];
const MAX = 300;

export class InsightsStore {
  push(event: AnalyticsEvent): void {
    events.push(event);
    if (events.length > MAX) events.splice(0, events.length - MAX);
  }

  recent(limit = 50): AnalyticsEvent[] {
    return events.slice(-limit);
  }

  countByName(): Record<string, number> {
    const out: Record<string, number> = {};
    for (const e of events) {
      out[e.name] = (out[e.name] ?? 0) + 1;
    }
    return out;
  }
}

export const insightsStore = new InsightsStore();
