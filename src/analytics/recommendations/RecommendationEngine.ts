import type { RecommendationSet } from '../types';
import { popularToolEngine } from './PopularToolEngine';
import { trendingToolEngine } from './TrendingToolEngine';
import { recentlyUpdatedEngine } from './RecentlyUpdatedEngine';
import { relatedToolScorer } from './RelatedToolScorer';
import { recentlyUsedEngine } from './RecentlyUsedEngine';

export class RecommendationEngine {
  forTool(toolIdOrSlug: string): RecommendationSet {
    const related = relatedToolScorer.score(toolIdOrSlug, 6);
    const popular = popularToolEngine.get(6);
    const trending = trendingToolEngine.get(6);
    const recentlyUpdated = recentlyUpdatedEngine.get(6);
    const recent = recentlyUsedEngine.get(3);

    const suggestedNext = [...related, ...trending, ...recent]
      .filter((item, i, arr) => arr.findIndex((x) => x.id === item.id) === i)
      .slice(0, 6)
      .map((item) => ({ ...item, reason: 'suggested' as const }));

    return { related, popular, trending, recentlyUpdated, suggestedNext };
  }

  forHomepage(): RecommendationSet {
    return {
      related: [],
      popular: popularToolEngine.get(8),
      trending: trendingToolEngine.get(8),
      recentlyUpdated: recentlyUpdatedEngine.get(8),
      suggestedNext: popularToolEngine.get(4),
    };
  }
}

export const recommendationEngine = new RecommendationEngine();
