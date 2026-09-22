import type { ToolManifest } from '../types/registration';
import { toolRegistry } from './ToolRegistry';

export class ToolVersionManager {
  getVersion(idOrSlug: string): string | null {
    return toolRegistry.get(idOrSlug)?.version ?? null;
  }

  setVersion(idOrSlug: string, version: string): ToolManifest | null {
    const m = toolRegistry.get(idOrSlug);
    if (!m) return null;
    const updated = { ...m, version };
    toolRegistry.set(updated);
    return updated;
  }
}

export const toolVersionManager = new ToolVersionManager();
