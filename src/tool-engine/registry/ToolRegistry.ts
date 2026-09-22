import type { ToolManifest } from '../types/registration';

/**
 * In-memory catalog of registered tool manifests (metadata + optional handlers).
 */
const manifests = new Map<string, ToolManifest>();

export class ToolRegistry {
  set(manifest: ToolManifest): void {
    manifests.set(manifest.slug, manifest);
    manifests.set(manifest.id, manifest);
  }

  get(idOrSlug: string): ToolManifest | undefined {
    return manifests.get(idOrSlug);
  }

  has(idOrSlug: string): boolean {
    return manifests.has(idOrSlug);
  }

  delete(idOrSlug: string): boolean {
    const m = manifests.get(idOrSlug);
    if (!m) return false;
    manifests.delete(m.slug);
    manifests.delete(m.id);
    return true;
  }

  list(): ToolManifest[] {
    const seen = new Set<string>();
    const out: ToolManifest[] = [];
    for (const m of manifests.values()) {
      if (seen.has(m.id)) continue;
      seen.add(m.id);
      out.push(m);
    }
    return out;
  }

  clear(): void {
    manifests.clear();
  }

  size(): number {
    return this.list().length;
  }
}

export const toolRegistry = new ToolRegistry();
