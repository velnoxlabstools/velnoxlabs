import { tools as seedTools } from '@/data/tools';
import type { RecommendationItem } from '../types';

export class TrendingToolEngine {
  get(limit = 8): RecommendationItem[] {
    return [...seedTools]
      .filter((t) => t.status === 'published' && (t.trending || t.isNew))
      .sort((a, b) => Number(b.trending) - Number(a.trending) || b.usageCount - a.usageCount)
      .slice(0, limit)
      .map((t, i) => ({
        id: t.id,
        slug: t.slug,
        name: t.name,
        score: (t.trending ? 500 : 100) + t.usageCount - i,
        reason: 'trending' as const,
      }));
  }
}

export const trendingToolEngine = new TrendingToolEngine();
