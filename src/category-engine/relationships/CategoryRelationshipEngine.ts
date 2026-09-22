import type { CategoryRelationGraph } from '../types';
import { categoryRegistry } from '../registry';
import { relatedCategoryEngine } from './RelatedCategoryEngine';
import { relatedToolEngine } from './RelatedToolEngine';
import { toolCategoryMapper } from '../mapping';

/**
 * Unified relationship graph for a category or tool.
 */
export class CategoryRelationshipEngine {
  forCategory(categoryId: string): CategoryRelationGraph | null {
    const cat = categoryRegistry.get(categoryId);
    if (!cat) return null;

    const relatedCategories = relatedCategoryEngine.forCategory(categoryId);
    const toolIds = toolCategoryMapper.getTools(categoryId);

    return {
      categoryId: cat.id,
      toolIds,
      relatedCategoryIds: relatedCategories.map((c) => c.id),
      relatedToolIds: relatedToolEngine.rankedForCategory(categoryId),
    };
  }

  forTool(toolId: string): CategoryRelationGraph | null {
    const cat = toolCategoryMapper.getCategoryForTool(toolId);
    if (!cat) return null;

    const graph = this.forCategory(cat.id);
    if (!graph) return null;

    return {
      ...graph,
      relatedToolIds: relatedToolEngine.forTool(toolId),
    };
  }
}

export const categoryRelationshipEngine = new CategoryRelationshipEngine();
