import type { RecommendationItem } from '../types';

/** Session-scoped recently used tools (client memory). */
const recent: { id: string; slug: string; name: string; at: number }[] = [];

export class RecentlyUsedEngine {
  push(item: { id: string; slug: string; name: string }): void {
    const filtered = recent.filter((r) => r.id !== item.id);
    filtered.unshift({ ...item, at: Date.now() });
    recent.length = 0;
    recent.push(...filtered.slice(0, 20));
  }

  get(limit = 8): RecommendationItem[] {
    return recent.slice(0, limit).map((r, i) => ({
      id: r.id,
      slug: r.slug,
      name: r.name,
      score: 50 - i,
      reason: 'recent' as const,
    }));
  }
}

export const recentlyUsedEngine = new RecentlyUsedEngine();
