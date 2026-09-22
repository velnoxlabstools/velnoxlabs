'use client';

import type { BaseFieldProps } from './shared';
import { wrap, inputBaseStyle } from './shared';

export function NumberField({ field, value, error, onChange, onBlur, disabled }: BaseFieldProps) {
  return wrap(
    field,
    error,
    <input
      id={field.name}
      name={field.name}
      type="number"
      min={field.min}
      max={field.max}
      step={field.step}
      placeholder={field.placeholder}
      disabled={disabled || field.disabled}
      value={value == null || value === '' ? '' : Number(value)}
      onChange={(e) => onChange(e.target.value === '' ? '' : Number(e.target.value))}
      onBlur={onBlur}
      aria-invalid={Boolean(error)}
      style={inputBaseStyle}
    />
  );
}
