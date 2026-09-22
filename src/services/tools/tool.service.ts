import type {
  ToolConfig,
  ToolEngineConfig,
  ToolListParams,
  ToolListResult,
  ToolStats,
  RelatedToolsResult,
} from '@/types/tool-engine';
import { findAllTools, findToolBySlug, findToolById, getToolSlugs } from './repository';
import {
  onlyPublic,
  sortTools,
  getFeaturedTools,
  getTrendingTools,
  getPopularTools,
  getNewTools,
  getRecentlyUpdatedTools,
  getRecommendedTools,
} from './engines';
import { getRelatedTools } from './related';
import { computeToolStats } from './stats';
import { buildToolMetadata } from '@/lib/tools';
import { findCategoryById, findAllCategories } from '@/services/categories';
import { getToolRegistry } from './registry';

export const toolEngineConfig: ToolEngineConfig = {
  defaultPageSize: 24,
  relatedLimit: 6,
  cacheTtlMs: 60_000,
  publicStatuses: ['published'],
};

const cache = new Map<string, { data: unknown; ts: number }>();

function getCached<T>(key: string): T | null {
  const entry = cache.get(key);
  if (!entry) return null;
  if (Date.now() - entry.ts > toolEngineConfig.cacheTtlMs) {
    cache.delete(key);
    return null;
  }
  return entry.data as T;
}

function setCache(key: string, data: unknown): void {
  cache.set(key, { data, ts: Date.now() });
}

export function clearToolCache(): void {
  cache.clear();
}

export function listTools(params: ToolListParams = {}): ToolListResult {
  const cacheKey = `list:${JSON.stringify(params)}`;
  const cached = getCached<ToolListResult>(cacheKey);
  if (cached) return cached;

  const pageSize = params.pageSize ?? toolEngineConfig.defaultPageSize;
  const page = Math.max(1, params.page ?? 1);

  let items = findAllTools();

  if (params.status) {
    items = items.filter((t) => t.status === params.status);
  } else {
    items = onlyPublic(items);
  }

  if (params.categoryId) {
    items = items.filter((t) => t.categoryId === params.categoryId);
  }

  if (params.categorySlug) {
    const cat = findAllCategories().find((c) => c.slug === params.categorySlug);
    if (cat) items = items.filter((t) => t.categoryId === cat.id);
    else items = [];
  }

  if (params.tag) {
    const q = params.tag.toLowerCase();
    items = items.filter((t) => t.tags.some((x) => x.toLowerCase() === q));
  }

  if (params.featured != null) items = items.filter((t) => t.featured === params.featured);
  if (params.trending != null) items = items.filter((t) => t.trending === params.trending);
  if (params.popular != null) items = items.filter((t) => t.popular === params.popular);
  if (params.isNew != null) items = items.filter((t) => t.isNew === params.isNew);

  if (params.search?.trim()) {
    const q = params.search.trim().toLowerCase();
    items = items.filter(
      (t) =>
        t.name.toLowerCase().includes(q) ||
        t.description.toLowerCase().includes(q) ||
        t.tags.some((tag) => tag.toLowerCase().includes(q)) ||
        t.slug.includes(q)
    );
  }

  items = sortTools(items, params.sort ?? 'usage');

  const total = items.length;
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const start = (page - 1) * pageSize;
  const result: ToolListResult = {
    items: items.slice(start, start + pageSize),
    total,
    page,
    pageSize,
    totalPages,
  };

  setCache(cacheKey, result);
  return result;
}

export function getTool(slugOrId: string): ToolConfig | null {
  return findToolBySlug(slugOrId) ?? findToolById(slugOrId) ?? null;
}

export function getToolWithMeta(slug: string) {
  const tool = findToolBySlug(slug);
  if (!tool) return null;
  const category = findCategoryById(tool.categoryId);
  return {
    tool,
    metadata: buildToolMetadata(tool),
    category: category ?? null,
  };
}

export function getRelatedForTool(slug: string, limit?: number): RelatedToolsResult | null {
  const tool = findToolBySlug(slug);
  if (!tool) return null;
  return getRelatedTools(tool, findAllTools(), limit ?? toolEngineConfig.relatedLimit);
}

export function getToolStatistics(): ToolStats {
  const cached = getCached<ToolStats>('stats');
  if (cached) return cached;
  const stats = computeToolStats(findAllTools());
  setCache('stats', stats);
  return stats;
}

export function getAllPublicTools(): ToolConfig[] {
  return onlyPublic(findAllTools());
}

export {
  getFeaturedTools,
  getTrendingTools,
  getPopularTools,
  getNewTools,
  getRecentlyUpdatedTools,
  getRecommendedTools,
  getToolSlugs,
  findAllTools,
};

export function incrementToolUsage(slug: string): number {
  const tool = getToolRegistry().find((t) => t.slug === slug);
  if (!tool) return 0;
  tool.usageCount += 1;
  clearToolCache();
  return tool.usageCount;
}
