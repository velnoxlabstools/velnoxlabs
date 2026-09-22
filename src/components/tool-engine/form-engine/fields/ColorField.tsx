'use client';

import type { BaseFieldProps } from './shared';
import { wrap } from './shared';

export function ColorField({ field, value, error, onChange, onBlur, disabled }: BaseFieldProps) {
  return wrap(
    field,
    error,
    <input
      id={field.name}
      name={field.name}
      type="color"
      disabled={disabled || field.disabled}
      value={String(value ?? '#000000')}
      onChange={(e) => onChange(e.target.value)}
      onBlur={onBlur}
      style={{ width: '3rem', height: '2.5rem', border: 'none', background: 'transparent' }}
    />
  );
}
