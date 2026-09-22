import { searchIndex } from '../index/SearchIndex';
import { sanitizeQuery } from '../utils';

export class SearchSuggestionEngine {
  suggest(prefix: string, limit = 6): string[] {
    const q = sanitizeQuery(prefix).toLowerCase();
    if (!q) return [];

    const seen = new Set<string>();
    const out: string[] = [];

    for (const doc of searchIndex.getDocuments()) {
      for (const source of [doc.title, ...doc.keywords, ...doc.tags]) {
        const lower = source.toLowerCase();
        if (lower.startsWith(q) && !seen.has(lower)) {
          seen.add(lower);
          out.push(source);
          if (out.length >= limit) return out;
        }
      }
    }
    return out;
  }

  noResultSuggestions(query: string, limit = 5): string[] {
    // Prefix fallback on first token
    const token = sanitizeQuery(query).split(' ')[0] ?? '';
    return this.suggest(token.slice(0, Math.max(1, token.length - 1)), limit);
  }
}

export const searchSuggestionEngine = new SearchSuggestionEngine();
