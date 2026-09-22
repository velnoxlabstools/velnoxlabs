'use client';

import type { BaseFieldProps } from './shared';
import { wrap, inputBaseStyle } from './shared';

export function SelectField({ field, value, error, onChange, onBlur, disabled }: BaseFieldProps) {
  return wrap(
    field,
    error,
    <select
      id={field.name}
      name={field.name}
      disabled={disabled || field.disabled}
      value={String(value ?? '')}
      onChange={(e) => onChange(e.target.value)}
      onBlur={onBlur}
      aria-invalid={Boolean(error)}
      style={inputBaseStyle}
    >
      <option value="">{field.placeholder ?? 'Select…'}</option>
      {(field.options ?? []).map((o) => (
        <option key={o.value} value={o.value} disabled={o.disabled}>
          {o.label}
        </option>
      ))}
    </select>
  );
}
