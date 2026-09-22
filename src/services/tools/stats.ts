import type { ToolConfig, ToolStats } from '@/types/tool-engine';
import { isPublicStatus } from '@/validation/tool';

export function computeToolStats(tools: ToolConfig[]): ToolStats {
  const byCategory: Record<string, number> = {};
  let published = 0;
  let draft = 0;
  let featured = 0;
  let trending = 0;
  let popular = 0;
  let isNew = 0;

  for (const t of tools) {
    byCategory[t.categoryId] = (byCategory[t.categoryId] ?? 0) + 1;
    if (isPublicStatus(t.status)) published += 1;
    if (t.status === 'draft') draft += 1;
    if (t.featured) featured += 1;
    if (t.trending) trending += 1;
    if (t.popular) popular += 1;
    if (t.isNew) isNew += 1;
  }

  return {
    total: tools.length,
    published,
    draft,
    featured,
    trending,
    popular,
    isNew,
    byCategory,
  };
}
