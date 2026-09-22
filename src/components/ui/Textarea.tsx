'use client';

import type { TextareaHTMLAttributes } from 'react';

export interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
}

export function Textarea({ label, error, id, style, ...rest }: TextareaProps) {
  const inputId = id ?? rest.name;
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.375rem', width: '100%' }}>
      {label ? (
        <label htmlFor={inputId} style={{ fontSize: 'var(--font-size-sm)', fontWeight: 500 }}>
          {label}
        </label>
      ) : null}
      <textarea
        id={inputId}
        aria-invalid={error ? true : undefined}
        style={{
          width: '100%',
          minHeight: '6rem',
          padding: '0.5rem 0.75rem',
          borderRadius: 'var(--radius-md, 0.5rem)',
          border: `1px solid ${error ? 'var(--color-error-500)' : 'var(--color-neutral-300)'}`,
          background: 'var(--color-neutral-0)',
          color: 'var(--color-neutral-900)',
          fontSize: 'var(--font-size-base)',
          fontFamily: 'inherit',
          resize: 'vertical',
          ...style,
        }}
        {...rest}
      />
      {error ? (
        <span role="alert" style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-error-600)' }}>
          {error}
        </span>
      ) : null}
    </div>
  );
}
