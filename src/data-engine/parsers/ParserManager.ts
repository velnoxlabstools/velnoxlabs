import type { DataFormat } from '../types';
import { safeJsonParse, asText } from '../utils';

export class ParserManager {
  parse(input: string, format: DataFormat = 'text'): { ok: boolean; data?: unknown; error?: string } {
    const text = asText(input);
    if (format === 'json') {
      const r = safeJsonParse(text);
      return r.ok ? { ok: true, data: r.data } : { ok: false, error: (r as any).error };
    }
    if (format === 'csv' || format === 'tsv') {
      const sep = format === 'tsv' ? '\t' : ',';
      const rows = text.split(/\r?\n/).filter(Boolean).map((line) => line.split(sep));
      return { ok: true, data: rows };
    }
    if (format === 'url') {
      try {
        const u = new URL(text);
        return {
          ok: true,
          data: {
            href: u.href,
            protocol: u.protocol,
            host: u.host,
            pathname: u.pathname,
            search: u.search,
            hash: u.hash,
          },
        };
      } catch (e) {
        return { ok: false, error: e instanceof Error ? e.message : 'URL parse failed' };
      }
    }
    return { ok: true, data: text };
  }
}

export const parserManager = new ParserManager();