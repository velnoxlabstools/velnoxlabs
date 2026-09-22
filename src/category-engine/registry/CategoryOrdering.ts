import type { CategoryNode } from '../types';
import { categoryRegistry } from './CategoryRegistry';

export class CategoryOrdering {
  setOrder(idOrSlug: string, order: number): CategoryNode | null {
    const cat = categoryRegistry.get(idOrSlug);
    if (!cat) return null;
    const next = { ...cat, order };
    categoryRegistry.set(next);
    return next;
  }

  sorted(parentId?: string | null): CategoryNode[] {
    const list =
      parentId === undefined
        ? categoryRegistry.list()
        : parentId === null
          ? categoryRegistry.roots()
          : categoryRegistry.childrenOf(parentId);
    return [...list].sort((a, b) => a.order - b.order || a.name.localeCompare(b.name));
  }

  move(idOrSlug: string, newOrder: number): CategoryNode | null {
    return this.setOrder(idOrSlug, newOrder);
  }
}

export const categoryOrdering = new CategoryOrdering();
