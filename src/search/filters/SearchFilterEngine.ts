import type { SearchIndexDocument, SearchFilters } from '../types';

export class SearchFilterEngine {
  apply(docs: SearchIndexDocument[], filters?: SearchFilters): SearchIndexDocument[] {
    if (!filters) return docs;
    let out = docs;

    if (filters.type && filters.type !== 'all') {
      out = out.filter((d) => d.type === filters.type);
    }
    if (filters.categorySlug) {
      out = out.filter(
        (d) => d.categorySlug === filters.categorySlug || d.tags.includes(filters.categorySlug!)
      );
    }
    if (filters.featured != null) {
      out = out.filter((d) => d.featured === filters.featured);
    }
    return out;
  }
}

export const searchFilterEngine = new SearchFilterEngine();
