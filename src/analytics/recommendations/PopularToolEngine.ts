import { tools as seedTools } from '@/data/tools';
import type { RecommendationItem } from '../types';

export class PopularToolEngine {
  get(limit = 8): RecommendationItem[] {
    return [...seedTools]
      .filter((t) => t.status === 'published')
      .sort((a, b) => b.usageCount - a.usageCount || Number(b.popular) - Number(a.popular))
      .slice(0, limit)
      .map((t, i) => ({
        id: t.id,
        slug: t.slug,
        name: t.name,
        score: t.usageCount + (t.popular ? 1000 : 0) - i,
        reason: 'popular' as const,
      }));
  }
}

export const popularToolEngine = new PopularToolEngine();
