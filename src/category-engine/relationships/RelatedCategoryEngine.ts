import { categoryRegistry } from '../registry';
import type { CategoryNode } from '../types';

export class RelatedCategoryEngine {
  /**
   * Related categories: siblings (same parent) then other roots by order.
   */
  forCategory(categoryId: string, limit = 4): CategoryNode[] {
    const current = categoryRegistry.get(categoryId);
    if (!current) return [];

    const siblings = current.parentId
      ? categoryRegistry.childrenOf(current.parentId).filter((c) => c.id !== current.id)
      : [];

    const others = categoryRegistry
      .list()
      .filter((c) => c.id !== current.id && !siblings.some((s) => s.id === c.id));

    return [...siblings, ...others].slice(0, limit);
  }

  children(categoryId: string): CategoryNode[] {
    return categoryRegistry.childrenOf(categoryId);
  }

  parent(categoryId: string): CategoryNode | null {
    const current = categoryRegistry.get(categoryId);
    if (!current?.parentId) return null;
    return categoryRegistry.get(current.parentId) ?? null;
  }
}

export const relatedCategoryEngine = new RelatedCategoryEngine();
