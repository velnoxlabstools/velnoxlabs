'use client';

import type { BaseFieldProps } from './shared';
import { FieldContainer } from './FieldContainer';

export function CheckboxField({ field, value, error, onChange, onBlur, disabled }: BaseFieldProps) {
  return (
    <FieldContainer name={field.name} description={field.description} error={error}>
      <label style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)', fontSize: 'var(--font-size-sm)' }}>
        <input
          id={field.name}
          name={field.name}
          type="checkbox"
          checked={Boolean(value)}
          disabled={disabled || field.disabled}
          onChange={(e) => onChange(e.target.checked)}
          onBlur={onBlur}
        />
        {field.label}
      </label>
    </FieldContainer>
  );
}
