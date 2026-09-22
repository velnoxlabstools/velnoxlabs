import type { RelatedToolsResult, ToolConfig } from '@/types/tool-engine';
import { onlyPublic } from './engines';

/**
 * Related tool engine: explicit IDs → same category → shared tags.
 */
export function getRelatedTools(
  tool: ToolConfig,
  all: ToolConfig[],
  limit = 6
): RelatedToolsResult {
  const publicTools = onlyPublic(all).filter((t) => t.id !== tool.id);
  const selected: ToolConfig[] = [];
  const seen = new Set<string>();

  const push = (items: ToolConfig[]) => {
    for (const t of items) {
      if (seen.has(t.id) || selected.length >= limit) continue;
      seen.add(t.id);
      selected.push(t);
    }
  };

  // 1. Explicit related IDs
  if (tool.relatedToolIds?.length) {
    push(
      tool.relatedToolIds
        .map((id) => publicTools.find((t) => t.id === id))
        .filter(Boolean) as ToolConfig[]
    );
  }

  // 2. Same category
  if (selected.length < limit) {
    push(publicTools.filter((t) => t.categoryId === tool.categoryId));
  }

  // 3. Shared tags
  if (selected.length < limit && tool.tags.length) {
    const tagSet = new Set(tool.tags.map((t) => t.toLowerCase()));
    push(
      publicTools
        .map((t) => ({
          t,
          overlap: t.tags.filter((x) => tagSet.has(x.toLowerCase())).length,
        }))
        .filter((x) => x.overlap > 0)
        .sort((a, b) => b.overlap - a.overlap)
        .map((x) => x.t)
    );
  }

  let reason: RelatedToolsResult['reason'] = 'mixed';
  if (tool.relatedToolIds?.length && selected.every((t) => tool.relatedToolIds?.includes(t.id))) {
    reason = 'explicit';
  } else if (selected.every((t) => t.categoryId === tool.categoryId)) {
    reason = 'same-category';
  } else if (selected.some((t) => t.tags.some((tag) => tool.tags.includes(tag)))) {
    reason = 'shared-tags';
  }

  return { tools: selected.slice(0, limit), reason };
}
