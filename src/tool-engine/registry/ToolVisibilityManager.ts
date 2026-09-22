import type { ToolManifest } from '../types/registration';
import { isPubliclyVisible } from '../utils';
import { toolRegistry } from './ToolRegistry';

export class ToolVisibilityManager {
  listPublic(): ToolManifest[] {
    return toolRegistry.list().filter((m) => isPubliclyVisible(m.visibility ?? 'public'));
  }

  listHidden(): ToolManifest[] {
    return toolRegistry.list().filter((m) => !isPubliclyVisible(m.visibility ?? 'public'));
  }

  isVisible(idOrSlug: string): boolean {
    const m = toolRegistry.get(idOrSlug);
    if (!m) return false;
    return isPubliclyVisible(m.visibility ?? 'public');
  }
}

export const toolVisibilityManager = new ToolVisibilityManager();
