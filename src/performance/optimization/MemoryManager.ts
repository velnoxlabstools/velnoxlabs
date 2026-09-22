import { cacheManager } from '../cache';

/**
 * Periodic memory hygiene for long-lived client sessions.
 */
export class MemoryManager {
  private timers: ReturnType<typeof setInterval>[] = [];

  start(intervalMs = 5 * 60_000): void {
    if (typeof window === 'undefined') return;
    const id = setInterval(() => {
      this.cleanup();
    }, intervalMs);
    this.timers.push(id);
  }

  cleanup(): void {
    // Drop expired cache entries by probing namespaces
    const namespaces = [
      'homepage',
      'category',
      'tool-meta',
      'search',
      'seo',
      'registry',
      'config',
      'generic',
    ] as const;
    for (const ns of namespaces) {
      // get with dummy key triggers expiry cleanup path for that key only;
      // full sweep:
      void ns;
    }
    // Prefer explicit invalidation of expired via stats keys
    const { keys } = cacheManager.stats();
    for (const key of keys) {
      const [ns, ...rest] = key.split(':');
      if (ns) cacheManager.get(ns as never, rest.join(':'));
    }
  }

  stop(): void {
    for (const t of this.timers) clearInterval(t);
    this.timers = [];
  }
}

export const memoryManager = new MemoryManager();
