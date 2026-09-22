'use client';

import type { ReactNode } from 'react';

interface FieldContainerProps {
  name: string;
  label?: string;
  description?: string;
  error?: string;
  required?: boolean;
  children: ReactNode;
}

export function FieldContainer({
  name,
  label,
  description,
  error,
  required,
  children,
}: FieldContainerProps) {
  const descId = description ? `${name}-desc` : undefined;
  const errId = error ? `${name}-error` : undefined;

  return (
    <div id={`field-${name}`} style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-1)' }}>
      {label && (
        <label
          htmlFor={name}
          style={{
            fontSize: 'var(--font-size-sm)',
            fontWeight: 'var(--font-weight-medium)',
            color: 'var(--foreground)',
          }}
        >
          {label}
          {required && (
            <span aria-hidden="true" style={{ color: 'var(--destructive)' }}>
              {' '}
              *
            </span>
          )}
        </label>
      )}
      {children}
      {description && (
        <p id={descId} style={{ margin: 0, fontSize: 'var(--font-size-xs)', color: 'var(--muted-foreground)' }}>
          {description}
        </p>
      )}
      {error && (
        <p id={errId} role="alert" style={{ margin: 0, fontSize: 'var(--font-size-xs)', color: 'var(--destructive)' }}>
          {error}
        </p>
      )}
    </div>
  );
}
