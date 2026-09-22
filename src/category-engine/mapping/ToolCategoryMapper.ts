import type { CategoryNode } from '../types';
import { categoryRegistry } from '../registry';
import { tools as seedTools } from '@/data/tools';

/**
 * Maintains bidirectional tool ↔ category membership.
 */
export class ToolCategoryMapper {
  /** Sync membership from platform tool seed/registry categoryId fields */
  syncFromTools(): void {
    const byCategory = new Map<string, string[]>();

    for (const tool of seedTools) {
      if (tool.status !== 'published') continue;
      const list = byCategory.get(tool.categoryId) ?? [];
      list.push(tool.id);
      byCategory.set(tool.categoryId, list);
    }

    for (const cat of categoryRegistry.list()) {
      const toolIds = byCategory.get(cat.id) ?? [];
      categoryRegistry.set({ ...cat, toolIds: [...new Set(toolIds)] });
    }
  }

  assign(toolId: string, categoryId: string): boolean {
    const cat = categoryRegistry.get(categoryId);
    if (!cat) return false;

    // Remove from other categories (single primary category model; multi ready via toolIds lists)
    for (const c of categoryRegistry.list()) {
      if (c.toolIds.includes(toolId) && c.id !== cat.id) {
        categoryRegistry.set({
          ...c,
          toolIds: c.toolIds.filter((id) => id !== toolId),
        });
      }
    }

    if (!cat.toolIds.includes(toolId)) {
      categoryRegistry.set({ ...cat, toolIds: [...cat.toolIds, toolId] });
    }
    return true;
  }

  unassign(toolId: string, categoryId?: string): void {
    for (const c of categoryRegistry.list()) {
      if (categoryId && c.id !== categoryId) continue;
      if (c.toolIds.includes(toolId)) {
        categoryRegistry.set({
          ...c,
          toolIds: c.toolIds.filter((id) => id !== toolId),
        });
      }
    }
  }

  getTools(categoryId: string): string[] {
    return categoryRegistry.get(categoryId)?.toolIds ?? [];
  }

  getCategoryForTool(toolId: string): CategoryNode | null {
    return categoryRegistry.list().find((c) => c.toolIds.includes(toolId)) ?? null;
  }
}

export const toolCategoryMapper = new ToolCategoryMapper();

// Initial sync from seed tools
toolCategoryMapper.syncFromTools();
