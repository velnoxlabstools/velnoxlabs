import type { FieldValidationRule, FormValue, FormValues } from '../types';

function msg(rule: unknown, fallback: string): string {
  if (typeof rule === 'string') return rule;
  if (rule && typeof rule === 'object' && 'message' in rule && typeof (rule as { message?: string }).message === 'string') {
    return (rule as { message: string }).message;
  }
  return fallback;
}

function numRule(rule: number | { value: number; message?: string } | undefined): number | undefined {
  if (rule == null) return undefined;
  return typeof rule === 'number' ? rule : rule.value;
}

export function validateField(
  value: FormValue,
  rule: FieldValidationRule | undefined,
  values: FormValues
): string | undefined {
  if (!rule) return undefined;

  const isEmpty =
    value == null ||
    value === '' ||
    (Array.isArray(value) && value.length === 0);

  if (rule.required && isEmpty) {
    return msg(rule.required, 'This field is required');
  }

  if (isEmpty) return undefined;

  const str = typeof value === 'string' ? value : undefined;

  if (str != null && rule.minLength != null) {
    const min = numRule(rule.minLength as number | { value: number });
    if (min != null && str.length < min) {
      return msg(rule.minLength, `Minimum length is ${min}`);
    }
  }

  if (str != null && rule.maxLength != null) {
    const max = numRule(rule.maxLength as number | { value: number });
    if (max != null && str.length > max) {
      return msg(rule.maxLength, `Maximum length is ${max}`);
    }
  }

  if (typeof value === 'number' || (str != null && str !== '' && !Number.isNaN(Number(str)))) {
    const n = typeof value === 'number' ? value : Number(str);
    if (rule.min != null) {
      const min = numRule(rule.min as number | { value: number });
      if (min != null && n < min) return msg(rule.min, `Minimum value is ${min}`);
    }
    if (rule.max != null) {
      const max = numRule(rule.max as number | { value: number });
      if (max != null && n > max) return msg(rule.max, `Maximum value is ${max}`);
    }
  }

  if (str != null && rule.pattern) {
    const re = rule.pattern instanceof RegExp ? rule.pattern : rule.pattern.value;
    if (!re.test(str)) return msg(rule.pattern, 'Invalid format');
  }

  if (rule.email && str != null) {
    const ok = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(str);
    if (!ok) return msg(rule.email, 'Enter a valid email');
  }

  if (rule.url && str != null) {
    try {
      new URL(str);
    } catch {
      return msg(rule.url, 'Enter a valid URL');
    }
  }

  if (rule.fileType && (value instanceof File || Array.isArray(value))) {
    const types = Array.isArray(rule.fileType) ? rule.fileType : rule.fileType.value;
    const files = Array.isArray(value) ? value : [value];
    for (const f of files) {
      if (!(f instanceof File)) continue;
      const ok = types.some(
        (t) => f.type === t || f.name.toLowerCase().endsWith(t.replace('*', ''))
      );
      if (!ok) return msg(rule.fileType, 'Invalid file type');
    }
  }

  if (rule.fileSize != null && (value instanceof File || Array.isArray(value))) {
    const max = numRule(rule.fileSize as number | { value: number });
    const files = Array.isArray(value) ? value : [value];
    for (const f of files) {
      if (f instanceof File && max != null && f.size > max) {
        return msg(rule.fileSize, `File must be under ${Math.round(max / 1024)}KB`);
      }
    }
  }

  if (rule.custom) {
    const customError = rule.custom(value, values);
    if (customError) return customError;
  }

  return undefined;
}

export async function validateFieldAsync(
  value: FormValue,
  rule: FieldValidationRule | undefined,
  values: FormValues
): Promise<string | undefined> {
  const sync = validateField(value, rule, values);
  if (sync) return sync;
  if (rule?.async) return rule.async(value, values);
  return undefined;
}
