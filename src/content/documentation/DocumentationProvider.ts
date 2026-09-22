import type { ToolContentDocument } from '../types';
import { contentRegistry } from '../registry';
import { sortBlocks } from '../utils';

export class DocumentationProvider {
  get(idOrSlug: string): ToolContentDocument | null {
    const doc = contentRegistry.get(idOrSlug);
    if (!doc) return null;
    return { ...doc, blocks: sortBlocks(doc.blocks) };
  }

  register(doc: ToolContentDocument): void {
    contentRegistry.set({
      ...doc,
      locale: doc.locale ?? 'en',
      blocks: sortBlocks(doc.blocks),
    });
  }
}

export const documentationProvider = new DocumentationProvider();
