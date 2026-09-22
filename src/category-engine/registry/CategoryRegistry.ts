import type { CategoryNode } from '../types';
import { categories as seedCategories } from '@/data/categories';

/**
 * Category registry with parent/child support and tool membership lists.
 * Seeded from existing platform categories.
 */
function seed(): Map<string, CategoryNode> {
  const map = new Map<string, CategoryNode>();
  for (const c of seedCategories) {
    const node: CategoryNode = {
      id: c.id,
      slug: c.slug,
      name: c.name,
      description: c.description,
      parentId: null,
      visibility: c.featured ? 'featured' : c.popular ? 'public' : 'public',
      order: c.order,
      icon: c.icon,
      toolIds: [],
      metadata: {
        title: c.name,
        description: c.description,
      },
    };
    map.set(node.id, node);
    map.set(node.slug, node);
  }
  return map;
}

const store = seed();

export class CategoryRegistry {
  set(node: CategoryNode): void {
    store.set(node.id, node);
    store.set(node.slug, node);
  }

  get(idOrSlug: string): CategoryNode | undefined {
    return store.get(idOrSlug);
  }

  has(idOrSlug: string): boolean {
    return store.has(idOrSlug);
  }

  delete(idOrSlug: string): boolean {
    const node = store.get(idOrSlug);
    if (!node) return false;
    store.delete(node.id);
    store.delete(node.slug);
    return true;
  }

  list(): CategoryNode[] {
    const seen = new Set<string>();
    const out: CategoryNode[] = [];
    for (const n of store.values()) {
      if (seen.has(n.id)) continue;
      seen.add(n.id);
      out.push(n);
    }
    return out.sort((a, b) => a.order - b.order || a.name.localeCompare(b.name));
  }

  childrenOf(parentId: string): CategoryNode[] {
    return this.list().filter((n) => n.parentId === parentId);
  }

  roots(): CategoryNode[] {
    return this.list().filter((n) => !n.parentId);
  }
}

export const categoryRegistry = new CategoryRegistry();
