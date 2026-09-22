import type { RuntimeInput } from '../types';

const MAX_STRING = 1_000_000;
const MAX_KEYS = 100;

/**
 * Shallow input sanitization for safe execution boundaries.
 */
export function sanitizeInput(input: RuntimeInput): RuntimeInput {
  const out: RuntimeInput = {};
  const keys = Object.keys(input).slice(0, MAX_KEYS);

  for (const key of keys) {
    const safeKey = key.replace(/[^\w.-]/g, '').slice(0, 64);
    if (!safeKey) continue;

    const value = input[key];

    if (value == null) {
      out[safeKey] = value;
      continue;
    }

    if (typeof value === 'string') {
      out[safeKey] = value.slice(0, MAX_STRING);
      continue;
    }

    if (typeof value === 'number' || typeof value === 'boolean') {
      out[safeKey] = value;
      continue;
    }

    if (typeof File !== 'undefined' && value instanceof File) {
      out[safeKey] = value;
      continue;
    }

    if (Array.isArray(value)) {
      out[safeKey] = value.slice(0, 1000);
      continue;
    }

    // Drop arbitrary objects / functions for safety
    if (typeof value === 'object') {
      try {
        out[safeKey] = JSON.parse(JSON.stringify(value));
      } catch {
        out[safeKey] = String(value);
      }
    }
  }

  return out;
}
