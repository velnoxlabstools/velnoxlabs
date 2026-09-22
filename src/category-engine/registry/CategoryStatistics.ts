import type { CategoryStats } from '../types';
import { categoryRegistry } from './CategoryRegistry';
import { tools as seedTools } from '@/data/tools';

export class CategoryStatistics {
  forCategory(categoryId: string): CategoryStats {
    const cat = categoryRegistry.get(categoryId);
    const toolIds = cat?.toolIds ?? [];
    const tools = seedTools.filter((t) => toolIds.includes(t.id));
    const children = categoryRegistry.childrenOf(categoryId);

    return {
      toolCount: toolIds.length,
      publishedToolCount: tools.filter((t) => t.status === 'published').length,
      featuredToolCount: tools.filter((t) => t.featured).length,
      childCount: children.length,
    };
  }

  totals() {
    const cats = categoryRegistry.list();
    return {
      categories: cats.length,
      toolsMapped: cats.reduce((sum, c) => sum + c.toolIds.length, 0),
    };
  }
}

export const categoryStatistics = new CategoryStatistics();
