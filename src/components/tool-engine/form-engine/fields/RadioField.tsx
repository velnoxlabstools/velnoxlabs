'use client';

import type { BaseFieldProps } from './shared';
import { FieldContainer } from './FieldContainer';

export function RadioField({ field, value, error, onChange, onBlur, disabled }: BaseFieldProps) {
  return (
    <FieldContainer
      name={field.name}
      label={field.label}
      description={field.description}
      error={error}
      required={Boolean(field.validation?.required)}
    >
      <div role="radiogroup" aria-label={field.label} style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-2)' }}>
        {(field.options ?? []).map((o) => (
          <label key={o.value} style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)', fontSize: 'var(--font-size-sm)' }}>
            <input
              type="radio"
              name={field.name}
              value={o.value}
              checked={value === o.value}
              disabled={disabled || field.disabled || o.disabled}
              onChange={() => onChange(o.value)}
              onBlur={onBlur}
            />
            {o.label}
          </label>
        ))}
      </div>
    </FieldContainer>
  );
}
