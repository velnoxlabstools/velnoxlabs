import type { ExportFormat, ExportRequest, ExportResult } from '../types';
import { ensureFilename, mimeFor, toExportText } from '../utils';

type Exporter = (req: ExportRequest) => ExportResult;

const exporters = new Map<ExportFormat, Exporter>();

function defaultExporter(req: ExportRequest): ExportResult {
  const format = req.format;
  const text = toExportText(req.data, format);
  const mime = mimeFor(format);
  const filename = ensureFilename(req.filename, format);
  return {
    ok: true,
    text,
    blob: new Blob([text], { type: mime }),
    filename,
    mime,
  };
}

for (const f of ['text', 'json', 'csv', 'txt', 'html', 'markdown'] as ExportFormat[]) {
  exporters.set(f, defaultExporter);
}

// Architecture-ready placeholders
exporters.set('png', (req) => ({
  ok: false,
  filename: ensureFilename(req.filename, 'png'),
  mime: mimeFor('png'),
  error: 'PNG export not implemented yet',
}));
exporters.set('svg', defaultExporter);
exporters.set('pdf', (req) => ({
  ok: false,
  filename: ensureFilename(req.filename, 'pdf'),
  mime: mimeFor('pdf'),
  error: 'PDF export architecture only',
}));

export class ExportManager {
  register(format: ExportFormat, fn: Exporter): void {
    exporters.set(format, fn);
  }

  export(req: ExportRequest): ExportResult {
    const fn = exporters.get(req.format) ?? defaultExporter;
    try {
      return fn(req);
    } catch (e) {
      return {
        ok: false,
        filename: ensureFilename(req.filename, req.format),
        mime: mimeFor(req.format),
        error: e instanceof Error ? e.message : 'Export failed',
      };
    }
  }

  listFormats(): ExportFormat[] {
    return [...exporters.keys()];
  }
}

export const exportManager = new ExportManager();
