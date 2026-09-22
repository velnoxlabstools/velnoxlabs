import type { ToolManifest } from '../types/registration';
import { toolRegistry } from '../registry/ToolRegistry';

/**
 * Discover registered tools by filters (kind, category, visibility).
 */
export class ToolDiscovery {
  byCategory(categoryId: string): ToolManifest[] {
    return toolRegistry.list().filter((m) => m.categoryId === categoryId);
  }

  byKind(kind: ToolManifest['kind']): ToolManifest[] {
    return toolRegistry.list().filter((m) => m.kind === kind);
  }

  byTag(tag: string): ToolManifest[] {
    const q = tag.toLowerCase();
    return toolRegistry.list().filter((m) => m.tags?.some((t) => t.toLowerCase() === q));
  }

  all(): ToolManifest[] {
    return toolRegistry.list();
  }
}

export const toolDiscovery = new ToolDiscovery();
