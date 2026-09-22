import { tools as seedTools } from '@/data/tools';
import type { RecommendationItem } from '../types';

export class RecentlyUpdatedEngine {
  get(limit = 8): RecommendationItem[] {
    return [...seedTools]
      .filter((t) => t.status === 'published')
      .sort((a, b) => +new Date(b.updatedAt) - +new Date(a.updatedAt))
      .slice(0, limit)
      .map((t, i) => ({
        id: t.id,
        slug: t.slug,
        name: t.name,
        score: 100 - i,
        reason: 'updated' as const,
      }));
  }
}

export const recentlyUpdatedEngine = new RecentlyUpdatedEngine();
