export type SearchEntityType = 'tool' | 'category' | 'page';

export type SearchSortMode =
  | 'relevance'
  | 'popularity'
  | 'updated'
  | 'alphabetical'
  | 'newest';

export interface SearchIndexDocument {
  id: string;
  type: SearchEntityType;
  title: string;
  description: string;
  href: string;
  keywords: string[];
  categoryId?: string;
  categorySlug?: string;
  tags: string[];
  popularity: number;
  featured: boolean;
  updatedAt?: string;
  createdAt?: string;
}

export interface SearchFilters {
  type?: SearchEntityType | 'all';
  categorySlug?: string;
  featured?: boolean;
  toolType?: string;
}

export interface SearchQuery {
  q: string;
  filters?: SearchFilters;
  sort?: SearchSortMode;
  limit?: number;
}

export interface ScoredSearchHit extends SearchIndexDocument {
  score: number;
  matchedIn: string[];
}

export interface SearchResponse {
  query: string;
  hits: ScoredSearchHit[];
  total: number;
  tookMs: number;
  suggestions: string[];
}
