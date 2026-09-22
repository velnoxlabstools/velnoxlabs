import type { ExportFormat } from '../types';

export function createId(): string {
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
}

export function ensureFilename(name: string | undefined, format: ExportFormat): string {
  const base = (name ?? 'velnox-export').replace(/[^\w.\-]+/g, '_');
  const ext = format === 'text' || format === 'txt' ? 'txt' : format === 'markdown' ? 'md' : format;
  if (base.toLowerCase().endsWith(`.${ext}`)) return base;
  return `${base}.${ext}`;
}

export function mimeFor(format: ExportFormat): string {
  switch (format) {
    case 'json': return 'application/json';
    case 'csv': return 'text/csv';
    case 'html': return 'text/html';
    case 'markdown': return 'text/markdown';
    case 'png': return 'image/png';
    case 'svg': return 'image/svg+xml';
    case 'pdf': return 'application/pdf';
    default: return 'text/plain';
  }
}

export function toExportText(data: string | unknown, format: ExportFormat): string {
  if (typeof data === 'string') {
    if (format === 'json') {
      try { return JSON.stringify(JSON.parse(data), null, 2); }
      catch { return data; }
    }
    return data;
  }
  if (format === 'json') return JSON.stringify(data, null, 2);
  if (format === 'csv' && Array.isArray(data)) {
    const rows = data as unknown[];
    if (rows.length && Array.isArray(rows[0])) {
      return (rows as string[][]).map((r) => r.map((c) => `"${String(c).replace(/"/g, '""')}"`).join(',')).join('\n');
    }
    if (rows.length && typeof rows[0] === 'object') {
      const keys = Object.keys(rows[0] as object);
      const lines = [keys.join(',')];
      for (const row of rows) {
        lines.push(keys.map((k) => `"${String((row as Record<string, unknown>)[k] ?? '').replace(/"/g, '""')}"`).join(','));
      }
      return lines.join('\n');
    }
  }
  return String(data ?? '');
}
