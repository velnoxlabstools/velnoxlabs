import { contentManager } from './ContentManager';
import type { ToolContentDocument } from '../types';

export class ContentLoader {
  load(idOrSlug: string): ToolContentDocument | null {
    return contentManager.get(idOrSlug);
  }

  loadOrDefault(
    toolId: string,
    slug: string,
    name: string,
    description: string
  ): ToolContentDocument {
    return contentManager.ensureDefault(toolId, slug, name, description);
  }
}

export const contentLoader = new ContentLoader();
