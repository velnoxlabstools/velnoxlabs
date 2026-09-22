'use client';

import { useCallback, useState } from 'react';
import { searchService } from '../services';
import type { SearchFilters, SearchResponse, SearchSortMode } from '../types';

export function useSearchEngine() {
  const [result, setResult] = useState<SearchResponse | null>(null);
  const [loading, setLoading] = useState(false);

  const search = useCallback(
    (q: string, options?: { filters?: SearchFilters; sort?: SearchSortMode; limit?: number }) => {
      setLoading(true);
      const res = searchService.search(q, options);
      setResult(res);
      setLoading(false);
      return res;
    },
    []
  );

  return {
    search,
    suggest: searchService.suggest.bind(searchService),
    recent: searchService.recent.bind(searchService),
    popular: searchService.popular.bind(searchService),
    result,
    loading,
  };
}
