'use client';

import type { BaseFieldProps } from './shared';
import { wrap, inputBaseStyle } from './shared';

export function EmailField({ field, value, error, onChange, onBlur, disabled }: BaseFieldProps) {
  return wrap(
    field,
    error,
    <input
      id={field.name}
      name={field.name}
      type="email"
      placeholder={field.placeholder ?? 'you@example.com'}
      disabled={disabled || field.disabled}
      value={String(value ?? '')}
      onChange={(e) => onChange(e.target.value)}
      onBlur={onBlur}
      autoComplete="email"
      aria-invalid={Boolean(error)}
      style={inputBaseStyle}
    />
  );
}
