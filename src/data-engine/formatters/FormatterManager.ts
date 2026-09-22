import type { DataFormat } from '../types';
import { safeJsonParse, asText } from '../utils';

export class FormatterManager {
  beautify(input: string, format: DataFormat = 'json'): string {
    if (format === 'json') {
      const r = safeJsonParse(input);
      if (!r.ok) return input;
      return JSON.stringify(r.data, null, 2);
    }
    return asText(input).trim();
  }

  minify(input: string, format: DataFormat = 'json'): string {
    if (format === 'json') {
      const r = safeJsonParse(input);
      if (!r.ok) return input;
      return JSON.stringify(r.data);
    }
    return asText(input).replace(/\s+/g, ' ').trim();
  }

  format(input: string, format: DataFormat = 'text'): string {
    return this.beautify(input, format);
  }
}

export const formatterManager = new FormatterManager();
