import type { ImportResult, ImportSource } from '../types';
import { clipboardManager } from '../clipboard';

type Importer = () => Promise<ImportResult>;

const importers = new Map<ImportSource, Importer>();

importers.set('clipboard', async () => {
  const r = await clipboardManager.paste();
  if (!r.ok) return { ok: false, source: 'clipboard', error: r.error };
  const text = clipboardManager.sanitize(r.text ?? '');
  return { ok: true, text, source: 'clipboard' };
});

importers.set('text', async () => ({ ok: false, source: 'text', error: 'Provide text via importText()' }));

export class ImportManager {
  register(source: ImportSource, fn: Importer): void {
    importers.set(source, fn);
  }

  async importFrom(source: ImportSource): Promise<ImportResult> {
    const fn = importers.get(source);
    if (!fn) return { ok: false, source, error: `No importer for ${source}` };
    return fn();
  }

  importText(text: string, source: ImportSource = 'text'): ImportResult {
    const clean = clipboardManager.sanitize(text);
    if (!clean) return { ok: false, source, error: 'Empty input' };
    let data: unknown = clean;
    if (source === 'json') {
      try {
        data = JSON.parse(clean);
      } catch (e) {
        return { ok: false, source, error: e instanceof Error ? e.message : 'Invalid JSON' };
      }
    }
    return { ok: true, text: clean, data, source };
  }

  async fromFile(file: File): Promise<ImportResult> {
    try {
      const text = clipboardManager.sanitize(await file.text());
      const source: ImportSource = file.name.endsWith('.json')
        ? 'json'
        : file.name.endsWith('.csv')
          ? 'csv'
          : 'file';
      return this.importText(text, source);
    } catch (e) {
      return { ok: false, source: 'file', error: e instanceof Error ? e.message : 'File import failed' };
    }
  }
}

export const importManager = new ImportManager();
