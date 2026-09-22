import type { CategoryNode, CategoryVisibility as Vis } from '../types';
import { categoryRegistry } from './CategoryRegistry';
import { isCategoryPublic } from '../utils';

export class CategoryVisibilityManager {
  set(idOrSlug: string, visibility: Vis): CategoryNode | null {
    const cat = categoryRegistry.get(idOrSlug);
    if (!cat) return null;
    const next = { ...cat, visibility };
    categoryRegistry.set(next);
    return next;
  }

  listPublic(): CategoryNode[] {
    return categoryRegistry.list().filter((c) => isCategoryPublic(c.visibility));
  }

  feature(idOrSlug: string) {
    return this.set(idOrSlug, 'featured');
  }

  hide(idOrSlug: string) {
    return this.set(idOrSlug, 'hidden');
  }

  archive(idOrSlug: string) {
    return this.set(idOrSlug, 'archived');
  }
}

export const categoryVisibility = new CategoryVisibilityManager();
