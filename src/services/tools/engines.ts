import type { ToolConfig, ToolSortKey } from '@/types/tool-engine';
import { isPublicStatus } from '@/validation/tool';

export function onlyPublic(tools: ToolConfig[]): ToolConfig[] {
  return tools.filter((t) => isPublicStatus(t.status));
}

export function sortTools(tools: ToolConfig[], sort: ToolSortKey = 'usage'): ToolConfig[] {
  const list = [...tools];
  switch (sort) {
    case 'name':
      return list.sort((a, b) => a.name.localeCompare(b.name));
    case 'newest':
      return list.sort((a, b) => +new Date(b.createdAt) - +new Date(a.createdAt));
    case 'updated':
      return list.sort((a, b) => +new Date(b.updatedAt) - +new Date(a.updatedAt));
    case 'featured':
      return list.sort((a, b) => Number(b.featured) - Number(a.featured) || b.usageCount - a.usageCount);
    case 'usage':
    default:
      return list.sort((a, b) => b.usageCount - a.usageCount);
  }
}

export function getFeaturedTools(tools: ToolConfig[], limit: number): ToolConfig[] {
  return sortTools(onlyPublic(tools).filter((t) => t.featured), 'usage').slice(0, limit);
}

export function getTrendingTools(tools: ToolConfig[], limit: number): ToolConfig[] {
  return sortTools(onlyPublic(tools).filter((t) => t.trending), 'usage').slice(0, limit);
}

export function getPopularTools(tools: ToolConfig[], limit: number): ToolConfig[] {
  return sortTools(onlyPublic(tools).filter((t) => t.popular), 'usage').slice(0, limit);
}

export function getNewTools(tools: ToolConfig[], limit: number): ToolConfig[] {
  return sortTools(onlyPublic(tools).filter((t) => t.isNew), 'newest').slice(0, limit);
}

export function getRecentlyUpdatedTools(tools: ToolConfig[], limit: number): ToolConfig[] {
  return sortTools(onlyPublic(tools), 'updated').slice(0, limit);
}

export function getRecommendedTools(tools: ToolConfig[], limit: number): ToolConfig[] {
  return onlyPublic(tools)
    .map((t) => ({
      tool: t,
      score:
        (t.featured ? 4 : 0) +
        (t.trending ? 3 : 0) +
        (t.popular ? 2 : 0) +
        (t.isNew ? 1 : 0) +
        t.usageCount / 10000,
    }))
    .sort((a, b) => b.score - a.score)
    .slice(0, limit)
    .map((x) => x.tool);
}
