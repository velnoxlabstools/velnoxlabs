import { asNumber, asString } from '../utils';

export const SharedLogicUtilities = {
  clamp(n: number, min: number, max: number): number {
    return Math.min(max, Math.max(min, n));
  },
  round(n: number, decimals = 2): number {
    const f = 10 ** decimals;
    return Math.round(n * f) / f;
  },
  splitLines(text: string): string[] {
    return asString(text).split(/\r?\n/);
  },
  wordCount(text: string): number {
    const t = asString(text).trim();
    return t ? t.split(/\s+/).length : 0;
  },
  charCount(text: string, includeSpaces = true): number {
    const t = asString(text);
    return includeSpaces ? t.length : t.replace(/\s/g, '').length;
  },
  convertLength(value: number, from: string, to: string): number {
    const toMeters: Record<string, number> = {
      m: 1, km: 1000, cm: 0.01, mm: 0.001,
      mi: 1609.344, yd: 0.9144, ft: 0.3048, in: 0.0254,
    };
    const a = toMeters[from];
    const b = toMeters[to];
    if (a == null || b == null) return asNumber(value);
    return (value * a) / b;
  },
};
