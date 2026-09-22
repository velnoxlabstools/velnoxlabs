export type SearchResultType = 'tool' | 'category' | 'page';

export interface SearchDocument {
  id: string;
  type: SearchResultType;
  title: string;
  description: string;
  href: string;
  tags: string[];
  categoryId?: string;
  weight: number;
  keywords: string[];
}

export interface SearchHit extends SearchDocument {
  score: number;
}

export interface SearchResult {
  query: string;
  hits: SearchHit[];
  total: number;
  tookMs: number;
  suggestions: string[];
}

export type SearchSortKey = 'relevance' | 'title' | 'type';

export interface SearchParams {
  query: string;
  type?: SearchResultType | 'all';
  sort?: SearchSortKey;
  limit?: number;
}

export interface SearchIndexStats {
  documents: number;
  tools: number;
  categories: number;
  pages: number;
}
