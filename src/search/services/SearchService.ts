import { searchEngine } from '../engine';
import { searchController } from '../engine';
import { recentSearchManager, popularSearchManager } from '../history';
import type { SearchFilters, SearchSortMode } from '../types';

export class SearchService {
  search(
    q: string,
    options?: { filters?: SearchFilters; sort?: SearchSortMode; limit?: number }
  ) {
    return searchController.run(q, options);
  }

  suggest(prefix: string, limit?: number) {
    return searchEngine.suggest(prefix, limit);
  }

  recent() {
    return recentSearchManager.list();
  }

  popular() {
    return popularSearchManager.list();
  }

  rebuild() {
    return searchEngine.rebuildIndex();
  }
}

export const searchService = new SearchService();
