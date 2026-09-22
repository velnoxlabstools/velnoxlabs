'use client';

import type { InputHTMLAttributes } from 'react';

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  hint?: string;
}

export function Input({ label, error, hint, id, style, className, ...rest }: InputProps) {
  const inputId = id ?? rest.name;
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.375rem', width: '100%' }}>
      {label ? (
        <label
          htmlFor={inputId}
          style={{ fontSize: 'var(--font-size-sm)', fontWeight: 500, color: 'var(--color-neutral-700)' }}
        >
          {label}
        </label>
      ) : null}
      <input
        id={inputId}
        className={`ui-input${className ? ` ${className}` : ''}`}
        aria-invalid={error ? true : undefined}
        aria-describedby={error ? `${inputId}-error` : hint ? `${inputId}-hint` : undefined}
        style={{
          width: '100%',
          padding: '0.5625rem 0.75rem',
          borderRadius: 'var(--radius-lg)',
          border: `1px solid ${error ? 'var(--color-error-500)' : 'var(--color-neutral-300)'}`,
          background: 'var(--color-neutral-0)',
          color: 'var(--color-neutral-900)',
          fontSize: 'var(--font-size-sm)',
          lineHeight: 1.4,
          outline: 'none',
          transition: 'border-color 0.15s ease, box-shadow 0.15s ease',
          ...style,
        }}
        {...rest}
      />
      {hint && !error ? (
        <span id={`${inputId}-hint`} style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-neutral-500)' }}>
          {hint}
        </span>
      ) : null}
      {error ? (
        <span id={`${inputId}-error`} role="alert" style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-error-600)' }}>
          {error}
        </span>
      ) : null}
    </div>
  );
}
