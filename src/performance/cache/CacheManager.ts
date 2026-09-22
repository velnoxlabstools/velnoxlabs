import type { CacheEntry, CacheNamespace } from '../types';

const DEFAULT_TTL_MS = 60_000;

/**
 * In-memory namespaced cache for homepage, categories, tools, search, SEO, registry.
 */
export class CacheManager {
  private store = new Map<string, CacheEntry<unknown>>();

  private key(ns: CacheNamespace, key: string): string {
    return `${ns}:${key}`;
  }

  get<T>(ns: CacheNamespace, key: string): T | null {
    const entry = this.store.get(this.key(ns, key));
    if (!entry) return null;
    if (Date.now() > entry.expiresAt) {
      this.store.delete(this.key(ns, key));
      return null;
    }
    return entry.value as T;
  }

  set<T>(ns: CacheNamespace, key: string, value: T, ttlMs = DEFAULT_TTL_MS): void {
    this.store.set(this.key(ns, key), {
      value,
      createdAt: Date.now(),
      expiresAt: Date.now() + ttlMs,
    });
  }

  invalidate(ns: CacheNamespace, key?: string): void {
    if (key) {
      this.store.delete(this.key(ns, key));
      return;
    }
    const prefix = `${ns}:`;
    for (const k of this.store.keys()) {
      if (k.startsWith(prefix)) this.store.delete(k);
    }
  }

  invalidateAll(): void {
    this.store.clear();
  }

  stats() {
    return {
      size: this.store.size,
      keys: [...this.store.keys()],
    };
  }
}

export const cacheManager = new CacheManager();
