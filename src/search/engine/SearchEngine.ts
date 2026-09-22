import type { SearchQuery, SearchResponse } from '../types';
import { searchIndex } from '../index/SearchIndex';
import { searchCache } from '../index/SearchCache';
import { searchRankingEngine } from '../ranking';
import { searchFilterEngine } from '../filters';
import { searchSortEngine } from '../filters';
import { searchSuggestionEngine } from '../suggestions';
import { sanitizeQuery } from '../utils';

export class SearchEngine {
  search(query: SearchQuery): SearchResponse {
    const start = Date.now();
    const q = sanitizeQuery(query.q ?? '');
    const limit = query.limit ?? 20;
    const cacheKey = JSON.stringify({ q, f: query.filters, s: query.sort, limit });

    if (!q) {
      return { query: q, hits: [], total: 0, tookMs: 0, suggestions: [] };
    }

    const cached = searchCache.get(cacheKey);
    if (cached) return cached;

    let docs = searchIndex.getDocuments();
    docs = searchFilterEngine.apply(docs, query.filters);

    let hits = searchRankingEngine.rank(docs, q);
    hits = searchSortEngine.sort(hits, query.sort ?? 'relevance');

    const total = hits.length;
    hits = hits.slice(0, limit);

    const suggestions =
      total === 0
        ? searchSuggestionEngine.noResultSuggestions(q)
        : searchSuggestionEngine.suggest(q, 5);

    const response: SearchResponse = {
      query: q,
      hits,
      total,
      tookMs: Date.now() - start,
      suggestions,
    };

    searchCache.set(cacheKey, response);
    return response;
  }

  suggest(prefix: string, limit = 6): string[] {
    return searchSuggestionEngine.suggest(prefix, limit);
  }

  rebuildIndex(): number {
    searchCache.clear();
    return searchIndex.rebuild();
  }
}

export const searchEngine = new SearchEngine();
