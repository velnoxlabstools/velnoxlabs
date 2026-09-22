import type {
  SearchDocument,
  SearchHit,
  SearchParams,
  SearchResult,
  SearchIndexStats,
  SearchResultType,
} from '@/types/search';
import { buildSearchIndex } from './index-builder';

let index: SearchDocument[] | null = null;
let indexBuiltAt = 0;
const INDEX_TTL_MS = 60_000;

function getIndex(): SearchDocument[] {
  if (!index || Date.now() - indexBuiltAt > INDEX_TTL_MS) {
    index = buildSearchIndex();
    indexBuiltAt = Date.now();
  }
  return index;
}

export function rebuildSearchIndex(): number {
  index = buildSearchIndex();
  indexBuiltAt = Date.now();
  return index.length;
}

export function getSearchIndexStats(): SearchIndexStats {
  const docs = getIndex();
  return {
    documents: docs.length,
    tools: docs.filter((d) => d.type === 'tool').length,
    categories: docs.filter((d) => d.type === 'category').length,
    pages: docs.filter((d) => d.type === 'page').length,
  };
}

function scoreDocument(doc: SearchDocument, terms: string[]): number {
  let score = 0;
  const title = doc.title.toLowerCase();
  const desc = doc.description.toLowerCase();
  const href = doc.href.toLowerCase();
  const tags = doc.tags.map((t) => t.toLowerCase());
  const keywords = doc.keywords.map((k) => k.toLowerCase());

  for (const term of terms) {
    if (title === term) score += 50;
    else if (title.startsWith(term)) score += 30;
    else if (title.includes(term)) score += 20;

    if (keywords.some((k) => k === term)) score += 15;
    if (tags.some((t) => t.includes(term))) score += 10;
    if (desc.includes(term)) score += 5;
    if (href.includes(term)) score += 3;
  }

  score += doc.weight;
  return score;
}

function rank(docs: SearchDocument[], query: string): SearchHit[] {
  const terms = query
    .toLowerCase()
    .trim()
    .split(/\s+/)
    .filter(Boolean);

  if (terms.length === 0) return [];

  return docs
    .map((doc) => ({ ...doc, score: scoreDocument(doc, terms) }))
    .filter((h) => h.score > h.weight)
    .sort((a, b) => b.score - a.score || a.title.localeCompare(b.title));
}

export function search(params: SearchParams): SearchResult {
  const start = Date.now();
  const query = params.query?.trim() ?? '';
  const limit = params.limit ?? 20;

  if (!query) {
    return { query, hits: [], total: 0, tookMs: 0, suggestions: [] };
  }

  let docs = getIndex();
  if (params.type && params.type !== 'all') {
    docs = docs.filter((d) => d.type === params.type);
  }

  let hits = rank(docs, query);

  if (params.sort === 'title') {
    hits = [...hits].sort((a, b) => a.title.localeCompare(b.title));
  } else if (params.sort === 'type') {
    hits = [...hits].sort((a, b) => a.type.localeCompare(b.type) || b.score - a.score);
  }

  const sliced = hits.slice(0, limit);

  return {
    query,
    hits: sliced,
    total: hits.length,
    tookMs: Date.now() - start,
    suggestions: getSuggestions(query, 5),
  };
}

export function getSuggestions(prefix: string, limit = 5): string[] {
  const q = prefix.toLowerCase().trim();
  if (!q) return [];

  const seen = new Set<string>();
  const out: string[] = [];

  for (const doc of getIndex()) {
    for (const kw of [doc.title, ...doc.keywords, ...doc.tags]) {
      const lower = kw.toLowerCase();
      if (lower.startsWith(q) && !seen.has(lower)) {
        seen.add(lower);
        out.push(kw);
        if (out.length >= limit) return out;
      }
    }
  }
  return out;
}

export function searchByType(query: string, type: SearchResultType, limit = 10) {
  return search({ query, type, limit });
}
