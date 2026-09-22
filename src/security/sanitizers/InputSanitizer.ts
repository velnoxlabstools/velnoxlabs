const CONTROL = /[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/g;

export class InputSanitizer {
  string(value: unknown, maxLength = 10_000): string {
    if (value == null) return '';
    return String(value).replace(CONTROL, '').slice(0, maxLength).trim();
  }

  html(value: unknown): string {
    return this.string(value)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  object<T extends Record<string, unknown>>(input: T, maxKeys = 50): Partial<T> {
    const out: Partial<T> = {};
    const keys = Object.keys(input).slice(0, maxKeys);
    for (const key of keys) {
      const safeKey = this.string(key, 64);
      if (!safeKey) continue;
      const val = input[key as keyof T];
      if (typeof val === 'string') {
        (out as Record<string, unknown>)[safeKey] = this.string(val);
      } else if (typeof val === 'number' || typeof val === 'boolean') {
        (out as Record<string, unknown>)[safeKey] = val;
      } else if (val == null) {
        (out as Record<string, unknown>)[safeKey] = val;
      }
    }
    return out;
  }
}

export const inputSanitizer = new InputSanitizer();
