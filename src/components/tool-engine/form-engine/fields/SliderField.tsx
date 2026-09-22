'use client';

import type { BaseFieldProps } from './shared';
import { wrap } from './shared';

export function SliderField({ field, value, error, onChange, onBlur, disabled }: BaseFieldProps) {
  const v = Number(value ?? field.min ?? 0);
  return wrap(
    field,
    error,
    <div>
      <input
        id={field.name}
        name={field.name}
        type="range"
        min={field.min ?? 0}
        max={field.max ?? 100}
        step={field.step ?? 1}
        disabled={disabled || field.disabled}
        value={v}
        onChange={(e) => onChange(Number(e.target.value))}
        onBlur={onBlur}
        style={{ width: '100%' }}
      />
      <span style={{ fontSize: 'var(--font-size-xs)', color: 'var(--muted-foreground)' }}>{v}</span>
    </div>
  );
}
