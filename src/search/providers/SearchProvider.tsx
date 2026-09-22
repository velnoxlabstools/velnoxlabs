'use client';

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import type { SearchFilters, SearchResponse, SearchSortMode } from '../types';
import { searchService } from '../services';
import { debounce } from '../utils';

interface SearchContextValue {
  query: string;
  setQuery: (q: string) => void;
  result: SearchResponse | null;
  suggestions: string[];
  isOpen: boolean;
  loading: boolean;
  open: () => void;
  close: () => void;
  search: (q?: string) => void;
  filters: SearchFilters;
  setFilters: (f: SearchFilters) => void;
  sort: SearchSortMode;
  setSort: (s: SearchSortMode) => void;
  activeIndex: number;
  setActiveIndex: (i: number) => void;
}

const SearchContext = createContext<SearchContextValue | null>(null);

export function SearchExperienceProvider({ children }: { children: ReactNode }) {
  const [query, setQueryState] = useState('');
  const [result, setResult] = useState<SearchResponse | null>(null);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [isOpen, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [filters, setFilters] = useState<SearchFilters>({ type: 'all' });
  const [sort, setSort] = useState<SearchSortMode>('relevance');
  const [activeIndex, setActiveIndex] = useState(-1);

  const runSearch = useCallback(
    (q: string) => {
      setLoading(true);
      const res = searchService.search(q, { filters, sort });
      setResult(res);
      setSuggestions(res.suggestions);
      setLoading(false);
      setActiveIndex(-1);
    },
    [filters, sort]
  );

  const debouncedSuggest = useMemo(
    () =>
      debounce((q: string) => {
        setSuggestions(searchService.suggest(q));
      }, 150),
    []
  );

  const setQuery = useCallback(
    (q: string) => {
      setQueryState(q);
      if (q.trim()) debouncedSuggest(q);
      else setSuggestions([]);
    },
    [debouncedSuggest]
  );

  const value = useMemo<SearchContextValue>(
    () => ({
      query,
      setQuery,
      result,
      suggestions,
      isOpen,
      loading,
      open: () => setOpen(true),
      close: () => setOpen(false),
      search: (q) => runSearch(q ?? query),
      filters,
      setFilters,
      sort,
      setSort,
      activeIndex,
      setActiveIndex,
    }),
    [query, setQuery, result, suggestions, isOpen, loading, runSearch, filters, sort, activeIndex]
  );

  return <SearchContext.Provider value={value}>{children}</SearchContext.Provider>;
}

export function useSearchExperience(): SearchContextValue {
  const ctx = useContext(SearchContext);
  if (!ctx) throw new Error('useSearchExperience must be used within SearchExperienceProvider');
  return ctx;
}
