import type { AnalyticsEvent, AnalyticsProviderAdapter } from '../types';
import { sanitizeEvent, eventKey } from '../utils';
import { consoleProvider } from '../providers';

/**
 * Async event queue with de-dupe window and pluggable providers.
 */
export class EventTracker {
  private providers: AnalyticsProviderAdapter[] = [consoleProvider];
  private queue: AnalyticsEvent[] = [];
  private flushing = false;
  private recent = new Map<string, number>();
  private dedupeMs = 1000;

  setProviders(providers: AnalyticsProviderAdapter[]): void {
    this.providers = providers.length ? providers : [consoleProvider];
  }

  track(event: AnalyticsEvent): void {
    const clean = sanitizeEvent(event);
    const key = eventKey(clean);
    const last = this.recent.get(key);
    if (last && Date.now() - last < this.dedupeMs) return;
    this.recent.set(key, Date.now());
    this.queue.push(clean);
    void this.flush();
  }

  private async flush(): Promise<void> {
    if (this.flushing) return;
    this.flushing = true;
    while (this.queue.length) {
      const event = this.queue.shift();
      if (!event) break;
      for (const p of this.providers) {
        try {
          await p.track(event);
        } catch {
          /* never block UI */
        }
      }
    }
    this.flushing = false;
  }
}

export const eventTracker = new EventTracker();
