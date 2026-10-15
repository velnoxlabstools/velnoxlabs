import type { DataFormat } from '../types';
import { asText, safeJsonParse } from '../utils';

export class ValidatorManager {
  validate(input: string, format: DataFormat = 'text'): string | null {
    const text = asText(input);
    if (!text.trim() && format !== 'text') return 'Input is empty';

    if (format === 'json') {
      const r = safeJsonParse(text);
      if (!r.ok) {
        return 'error' in r ? (r.error ?? 'Invalid JSON') : 'Invalid JSON';
      }
      return null;
    }
    if (format === 'base64') {
      try {
        if (typeof atob === 'function') atob(text);
        else Buffer.from(text, 'base64');
        return null;
      } catch {
        return 'Invalid Base64';
      }
    }
    if (format === 'url') {
      try {
        new URL(text);
        return null;
      } catch {
        return 'Invalid URL';
      }
    }
    if (format === 'hex') {
      return /^[0-9a-fA-F\s]*$/.test(text) ? null : 'Invalid hex';
    }
    return null;
  }
}

export const validatorManager = new ValidatorManager();
