import { toolCategoryMapper } from '../mapping';
import { tools as seedTools } from '@/data/tools';

export class RelatedToolEngine {
  /**
   * Tools related by shared category, excluding the source tool.
   */
  forTool(toolId: string, limit = 6): string[] {
    const category = toolCategoryMapper.getCategoryForTool(toolId);
    if (!category) return [];

    return category.toolIds.filter((id) => id !== toolId).slice(0, limit);
  }

  forCategory(categoryId: string, limit = 12): string[] {
    const ids = toolCategoryMapper.getTools(categoryId);
    return ids.slice(0, limit);
  }

  /** Rank by usage when seed data available */
  rankedForCategory(categoryId: string, limit = 12): string[] {
    const ids = this.forCategory(categoryId, 1000);
    const ranked = ids
      .map((id) => {
        const t = seedTools.find((x) => x.id === id);
        return { id, usage: t?.usageCount ?? 0 };
      })
      .sort((a, b) => b.usage - a.usage)
      .slice(0, limit)
      .map((x) => x.id);
    return ranked;
  }
}

export const relatedToolEngine = new RelatedToolEngine();
