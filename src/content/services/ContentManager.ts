import type { ToolContentDocument, ContentBlock } from '../types';
import { contentRegistry } from '../registry';
import { documentationProvider } from '../documentation';
import { createDefaultToolContent } from '../templates';
import { sortBlocks } from '../utils';

export class ContentManager {
  register(doc: ToolContentDocument): void {
    documentationProvider.register(doc);
  }

  ensureDefault(toolId: string, slug: string, name: string, description: string): ToolContentDocument {
    const existing = contentRegistry.get(toolId) ?? contentRegistry.get(slug);
    if (existing) return existing;
    const doc = createDefaultToolContent(toolId, slug, name, description);
    this.register(doc);
    return doc;
  }

  get(idOrSlug: string): ToolContentDocument | null {
    return documentationProvider.get(idOrSlug);
  }

  updateBlocks(idOrSlug: string, blocks: ContentBlock[]): ToolContentDocument | null {
    const current = contentRegistry.get(idOrSlug);
    if (!current) return null;
    const next = { ...current, blocks: sortBlocks(blocks) };
    contentRegistry.set(next);
    return next;
  }

  list(): ToolContentDocument[] {
    return contentRegistry.list();
  }
}

export const contentManager = new ContentManager();
