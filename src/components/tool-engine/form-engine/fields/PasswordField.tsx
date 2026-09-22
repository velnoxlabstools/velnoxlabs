'use client';

import type { BaseFieldProps } from './shared';
import { wrap, inputBaseStyle } from './shared';

export function PasswordField({ field, value, error, onChange, onBlur, disabled }: BaseFieldProps) {
  return wrap(
    field,
    error,
    <input
      id={field.name}
      name={field.name}
      type="password"
      placeholder={field.placeholder}
      disabled={disabled || field.disabled}
      value={String(value ?? '')}
      onChange={(e) => onChange(e.target.value)}
      onBlur={onBlur}
      autoComplete="current-password"
      aria-invalid={Boolean(error)}
      style={inputBaseStyle}
    />
  );
}
