import { categoryResolver, type ResolvedCategory } from '../resolver';
import { categoryRegistry } from './CategoryRegistry';
import { categoryVisibility } from './CategoryVisibility';
import { categoryOrdering } from './CategoryOrdering';

export class CategoryLoader {
  load(idOrSlug: string): ResolvedCategory | null {
    return categoryResolver.resolve(idOrSlug);
  }

  loadPublic(): ResolvedCategory[] {
    return categoryVisibility
      .listPublic()
      .map((c) => categoryResolver.resolve(c.id))
      .filter(Boolean) as ResolvedCategory[];
  }

  loadOrdered(parentId?: string | null) {
    return categoryOrdering.sorted(parentId);
  }

  loadAll() {
    return categoryRegistry.list();
  }
}

export const categoryLoader = new CategoryLoader();
