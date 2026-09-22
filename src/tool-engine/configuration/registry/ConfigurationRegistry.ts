import type { ToolConfiguration } from '../types';

const store = new Map<string, ToolConfiguration>();

export class ConfigurationRegistry {
  set(config: ToolConfiguration): void {
    store.set(config.id, config);
    store.set(config.slug, config);
  }

  get(idOrSlug: string): ToolConfiguration | undefined {
    return store.get(idOrSlug);
  }

  has(idOrSlug: string): boolean {
    return store.has(idOrSlug);
  }

  delete(idOrSlug: string): boolean {
    const c = store.get(idOrSlug);
    if (!c) return false;
    store.delete(c.id);
    store.delete(c.slug);
    return true;
  }

  list(): ToolConfiguration[] {
    const seen = new Set<string>();
    const out: ToolConfiguration[] = [];
    for (const c of store.values()) {
      if (seen.has(c.id)) continue;
      seen.add(c.id);
      out.push(c);
    }
    return out;
  }

  clear(): void {
    store.clear();
  }
}

export const configurationRegistry = new ConfigurationRegistry();
