import type { CategoryNode } from '../types';
import { categoryRegistry } from '../registry';
import { categoryMetadataResolver } from './CategoryMetadataResolver';
import { categoryRouteResolver } from './CategoryRouteResolver';
import { categoryStatistics } from '../registry/CategoryStatistics';
import { relatedCategoryEngine } from '../relationships';
import { relatedToolEngine } from '../relationships';

export interface ResolvedCategory {
  node: CategoryNode;
  path: string;
  metadata: ReturnType<typeof categoryMetadataResolver.resolve>;
  stats: ReturnType<typeof categoryStatistics.forCategory>;
  relatedCategories: CategoryNode[];
  toolIds: string[];
  children: CategoryNode[];
  parent: CategoryNode | null;
}

export class CategoryResolver {
  resolve(idOrSlug: string): ResolvedCategory | null {
    const node = categoryRegistry.get(idOrSlug);
    if (!node) return null;

    const parent = node.parentId ? categoryRegistry.get(node.parentId) ?? null : null;

    return {
      node,
      path: categoryRouteResolver.pathFor(node),
      metadata: categoryMetadataResolver.resolve(node),
      stats: categoryStatistics.forCategory(node.id),
      relatedCategories: relatedCategoryEngine.forCategory(node.id),
      toolIds: relatedToolEngine.rankedForCategory(node.id),
      children: categoryRegistry.childrenOf(node.id),
      parent,
    };
  }
}

export const categoryResolver = new CategoryResolver();
