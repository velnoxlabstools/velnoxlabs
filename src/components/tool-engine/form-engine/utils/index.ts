import type { FormFieldConfig, FormValues } from '../types';

export function getDefaultValues(fields: FormFieldConfig[]): FormValues {
  const values: FormValues = {};
  for (const field of fields) {
    if (field.defaultValue !== undefined) {
      values[field.name] = field.defaultValue;
    } else if (field.type === 'checkbox' || field.type === 'switch') {
      values[field.name] = false;
    } else if (field.type === 'multiselect') {
      values[field.name] = [];
    } else if (field.type === 'hidden') {
      values[field.name] = field.defaultValue ?? '';
    } else {
      values[field.name] = '';
    }
  }
  return values;
}

export function scrollToFirstError(errors: Record<string, string | undefined>): void {
  if (typeof document === 'undefined') return;
  const name = Object.keys(errors).find((k) => errors[k]);
  if (!name) return;
  const el = document.getElementById(`field-${name}`) ?? document.querySelector(`[name="${name}"]`);
  if (el && 'focus' in el) {
    (el as HTMLElement).focus();
    el.scrollIntoView({ behavior: 'smooth', block: 'center' });
  }
}

export const inputBaseStyle: React.CSSProperties = {
  width: '100%',
  padding: 'var(--space-2) var(--space-3)',
  borderRadius: 'var(--radius-md)',
  border: '1px solid var(--border)',
  background: 'var(--background)',
  color: 'var(--foreground)',
  fontSize: 'var(--font-size-sm)',
};
