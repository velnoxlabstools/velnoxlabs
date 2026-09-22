import { tools as seedTools } from '@/data/tools';
import type { RecommendationItem } from '../types';

export class RelatedToolScorer {
  score(toolIdOrSlug: string, limit = 6): RecommendationItem[] {
    const source = seedTools.find((t) => t.id === toolIdOrSlug || t.slug === toolIdOrSlug);
    if (!source) return [];

    return seedTools
      .filter((t) => t.status === 'published' && t.id !== source.id)
      .map((t) => {
        let score = 0;
        if (t.categoryId === source.categoryId) score += 50;
        const shared = t.tags.filter((tag) => source.tags.includes(tag)).length;
        score += shared * 10;
        if (t.featured) score += 5;
        score += Math.min(10, t.usageCount / 5000);
        return {
          id: t.id,
          slug: t.slug,
          name: t.name,
          score,
          reason: 'related' as const,
        };
      })
      .filter((x) => x.score > 0)
      .sort((a, b) => b.score - a.score)
      .slice(0, limit);
  }
}

export const relatedToolScorer = new RelatedToolScorer();
