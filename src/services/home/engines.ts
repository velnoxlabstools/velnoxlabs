import type { Category, Tool, ToolCollection } from '@/types/tools';

function published(tools: Tool[]): Tool[] {
  return tools.filter((t) => t.status === 'published');
}

export function getFeaturedTools(tools: Tool[], limit: number): Tool[] {
  return published(tools)
    .filter((t) => t.featured)
    .sort((a, b) => b.usageCount - a.usageCount)
    .slice(0, limit);
}

export function getTrendingTools(tools: Tool[], limit: number): Tool[] {
  return published(tools)
    .filter((t) => t.trending)
    .sort((a, b) => b.usageCount - a.usageCount)
    .slice(0, limit);
}

export function getPopularTools(tools: Tool[], limit: number): Tool[] {
  return published(tools)
    .filter((t) => t.popular)
    .sort((a, b) => b.usageCount - a.usageCount)
    .slice(0, limit);
}

export function getNewTools(tools: Tool[], limit: number): Tool[] {
  return published(tools)
    .filter((t) => t.isNew)
    .sort((a, b) => +new Date(b.createdAt) - +new Date(a.createdAt))
    .slice(0, limit);
}

export function getRecentlyUpdatedTools(tools: Tool[], limit: number): Tool[] {
  return published(tools)
    .sort((a, b) => +new Date(b.updatedAt) - +new Date(a.updatedAt))
    .slice(0, limit);
}

export function getRecommendedTools(tools: Tool[], limit: number): Tool[] {
  return published(tools)
    .sort((a, b) => {
      const score = (t: Tool) =>
        (t.featured ? 3 : 0) + (t.trending ? 2 : 0) + (t.popular ? 1 : 0) + t.usageCount / 10000;
      return score(b) - score(a);
    })
    .slice(0, limit);
}

export function getPopularCategories(categories: Category[], limit: number): Category[] {
  return [...categories]
    .filter((c) => c.popular)
    .sort((a, b) => b.toolCount - a.toolCount || a.order - b.order)
    .slice(0, limit);
}

export function getFeaturedCategories(categories: Category[], limit: number): Category[] {
  return [...categories]
    .filter((c) => c.featured)
    .sort((a, b) => a.order - b.order)
    .slice(0, limit);
}

export function getCollections(
  collections: ToolCollection[],
  limit: number
): ToolCollection[] {
  return collections.slice(0, limit);
}

export function getToolCount(tools: Tool[]): number {
  return published(tools).length;
}

export function getCategoryCount(categories: Category[]): number {
  return categories.length;
}

export function formatStatValue(n: number): string {
  if (n >= 1000) return `${(n / 1000).toFixed(n >= 10000 ? 0 : 1)}k+`;
  return String(n);
}
