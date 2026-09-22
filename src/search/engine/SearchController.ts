import type { SearchFilters, SearchResponse, SearchSortMode } from '../types';
import { searchEngine } from './SearchEngine';
import { recentSearchManager } from '../history';

export class SearchController {
  private last: SearchResponse | null = null;

  run(
    q: string,
    options?: { filters?: SearchFilters; sort?: SearchSortMode; limit?: number; saveHistory?: boolean }
  ): SearchResponse {
    const result = searchEngine.search({
      q,
      filters: options?.filters,
      sort: options?.sort,
      limit: options?.limit,
    });
    this.last = result;
    if (options?.saveHistory !== false && result.query) {
      recentSearchManager.add(result.query);
    }
    return result;
  }

  getLast(): SearchResponse | null {
    return this.last;
  }
}

export const searchController = new SearchController();
