import type { ToolContentDocument } from '../types';

const docs = new Map<string, ToolContentDocument>();

export class ContentRegistry {
  set(doc: ToolContentDocument): void {
    docs.set(doc.toolId, doc);
    docs.set(doc.slug, doc);
  }

  get(idOrSlug: string): ToolContentDocument | undefined {
    return docs.get(idOrSlug);
  }

  delete(idOrSlug: string): boolean {
    const d = docs.get(idOrSlug);
    if (!d) return false;
    docs.delete(d.toolId);
    docs.delete(d.slug);
    return true;
  }

  list(): ToolContentDocument[] {
    const seen = new Set<string>();
    const out: ToolContentDocument[] = [];
    for (const d of docs.values()) {
      if (seen.has(d.toolId)) continue;
      seen.add(d.toolId);
      out.push(d);
    }
    return out;
  }

  clear(): void {
    docs.clear();
  }
}

export const contentRegistry = new ContentRegistry();
