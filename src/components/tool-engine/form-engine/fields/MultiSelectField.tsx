'use client';

import type { BaseFieldProps } from './shared';
import { wrap, inputBaseStyle } from './shared';

export function MultiSelectField({ field, value, error, onChange, onBlur, disabled }: BaseFieldProps) {
  const selected = Array.isArray(value) ? (value as string[]) : [];

  return wrap(
    field,
    error,
    <select
      id={field.name}
      name={field.name}
      multiple
      disabled={disabled || field.disabled}
      value={selected}
      onChange={(e) => {
        const opts = Array.from(e.target.selectedOptions).map((o) => o.value);
        onChange(opts);
      }}
      onBlur={onBlur}
      aria-invalid={Boolean(error)}
      style={{ ...inputBaseStyle, minHeight: '6rem' }}
    >
      {(field.options ?? []).map((o) => (
        <option key={o.value} value={o.value} disabled={o.disabled}>
          {o.label}
        </option>
      ))}
    </select>
  );
}
