import type { ScoredSearchHit } from '../types';

export class SearchResultManager {
  groupByType(hits: ScoredSearchHit[]): Record<string, ScoredSearchHit[]> {
    const groups: Record<string, ScoredSearchHit[]> = {};
    for (const hit of hits) {
      const key = hit.type;
      if (!groups[key]) groups[key] = [];
      groups[key].push(hit);
    }
    return groups;
  }
}

export const searchResultManager = new SearchResultManager();
