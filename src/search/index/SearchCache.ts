import type { SearchResponse } from '../types';

const store = new Map<string, { data: SearchResponse; ts: number }>();
const TTL = 30_000;

export class SearchCache {
  get(key: string): SearchResponse | null {
    const hit = store.get(key);
    if (!hit) return null;
    if (Date.now() - hit.ts > TTL) {
      store.delete(key);
      return null;
    }
    return hit.data;
  }

  set(key: string, data: SearchResponse): void {
    store.set(key, { data, ts: Date.now() });
  }

  clear(): void {
    store.clear();
  }
}

export const searchCache = new SearchCache();
