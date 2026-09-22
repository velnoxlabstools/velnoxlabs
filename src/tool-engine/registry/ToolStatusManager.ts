import type { ToolManifest, ToolVisibility } from '../types/registration';
import { toolRegistry } from './ToolRegistry';

export class ToolStatusManager {
  setVisibility(idOrSlug: string, visibility: ToolVisibility): ToolManifest | null {
    const m = toolRegistry.get(idOrSlug);
    if (!m) return null;
    const updated = { ...m, visibility };
    if (visibility === 'featured') {
      updated.featured = true;
    }
    if (visibility === 'popular' || visibility === 'featured') {
      updated.popular = true;
    }
    toolRegistry.set(updated);
    return updated;
  }

  feature(idOrSlug: string): ToolManifest | null {
    return this.setVisibility(idOrSlug, 'featured');
  }

  hide(idOrSlug: string): ToolManifest | null {
    return this.setVisibility(idOrSlug, 'hidden');
  }

  archive(idOrSlug: string): ToolManifest | null {
    return this.setVisibility(idOrSlug, 'archived');
  }

  publish(idOrSlug: string): ToolManifest | null {
    return this.setVisibility(idOrSlug, 'public');
  }

  deprecate(idOrSlug: string): ToolManifest | null {
    return this.setVisibility(idOrSlug, 'deprecated');
  }
}

export const toolStatusManager = new ToolStatusManager();
