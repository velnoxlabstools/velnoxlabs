import type { ToolRuntimeDefinition } from '../types';

/**
 * Runtime-side registry of executable tool handlers.
 * Separate from metadata registry (services/tools) — this maps slug → execute().
 */
const handlers = new Map<string, ToolRuntimeDefinition>();

export class ToolRegistryConnector {
  register(definition: ToolRuntimeDefinition): void {
    if (!definition.id || !definition.slug || !definition.execute) {
      throw new Error('Invalid tool runtime definition');
    }
    handlers.set(definition.slug, definition);
    handlers.set(definition.id, definition);
  }

  unregister(idOrSlug: string): boolean {
    const def = handlers.get(idOrSlug);
    if (!def) return false;
    handlers.delete(def.slug);
    handlers.delete(def.id);
    return true;
  }

  resolve(idOrSlug: string): ToolRuntimeDefinition | undefined {
    return handlers.get(idOrSlug);
  }

  has(idOrSlug: string): boolean {
    return handlers.has(idOrSlug);
  }

  list(): ToolRuntimeDefinition[] {
    const seen = new Set<string>();
    const out: ToolRuntimeDefinition[] = [];
    for (const def of handlers.values()) {
      if (seen.has(def.id)) continue;
      seen.add(def.id);
      out.push(def);
    }
    return out;
  }

  clear(): void {
    handlers.clear();
  }
}

export const toolRuntimeRegistry = new ToolRegistryConnector();
