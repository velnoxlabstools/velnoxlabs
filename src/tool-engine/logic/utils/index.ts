import type { LogicInput, LogicSchemaField } from '../types';

export function normalizeInput(input: LogicInput): LogicInput {
  const out: LogicInput = {};
  for (const [k, v] of Object.entries(input)) {
    if (typeof v === 'string') out[k] = v.trim();
    else out[k] = v;
  }
  return out;
}

export function validateAgainstSchema(input: LogicInput, schema: LogicSchemaField[]): string | null {
  for (const field of schema) {
    if (field.required && (input[field.name] == null || input[field.name] === '')) {
      return field.name + ' is required';
    }
    const val = input[field.name];
    if (val == null || val === '') continue;
    if (field.type === 'number' && typeof val !== 'number' && Number.isNaN(Number(val))) {
      return field.name + ' must be a number';
    }
    if (field.type === 'boolean' && typeof val !== 'boolean') {
      return field.name + ' must be a boolean';
    }
    if (field.type === 'string' && typeof val !== 'string') {
      return field.name + ' must be a string';
    }
  }
  return null;
}

export function asString(value: unknown, fallback = ''): string {
  if (value == null) return fallback;
  return String(value);
}

export function asNumber(value: unknown, fallback = 0): number {
  const n = Number(value);
  return Number.isFinite(n) ? n : fallback;
}
