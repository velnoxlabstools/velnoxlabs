import type { ScoredSearchHit, SearchSortMode } from '../types';

export class SearchSortEngine {
  sort(hits: ScoredSearchHit[], mode: SearchSortMode = 'relevance'): ScoredSearchHit[] {
    const list = [...hits];
    switch (mode) {
      case 'popularity':
        return list.sort((a, b) => b.popularity - a.popularity);
      case 'alphabetical':
        return list.sort((a, b) => a.title.localeCompare(b.title));
      case 'updated':
        return list.sort(
          (a, b) => +new Date(b.updatedAt ?? 0) - +new Date(a.updatedAt ?? 0)
        );
      case 'newest':
        return list.sort(
          (a, b) => +new Date(b.createdAt ?? 0) - +new Date(a.createdAt ?? 0)
        );
      case 'relevance':
      default:
        return list.sort((a, b) => b.score - a.score);
    }
  }
}

export const searchSortEngine = new SearchSortEngine();
