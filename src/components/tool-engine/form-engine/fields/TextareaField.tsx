'use client';

import type { BaseFieldProps } from './shared';
import { wrap, inputBaseStyle } from './shared';

export function TextareaField({ field, value, error, onChange, onBlur, disabled }: BaseFieldProps) {
  return wrap(
    field,
    error,
    <textarea
      id={field.name}
      name={field.name}
      rows={field.rows ?? 4}
      placeholder={field.placeholder}
      disabled={disabled || field.disabled}
      autoFocus={field.autoFocus}
      value={String(value ?? '')}
      onChange={(e) => onChange(e.target.value)}
      onBlur={onBlur}
      aria-invalid={Boolean(error)}
      style={{ ...inputBaseStyle, resize: 'vertical', minHeight: '5rem' }}
    />
  );
}
