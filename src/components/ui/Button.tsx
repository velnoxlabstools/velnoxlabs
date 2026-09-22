'use client';

import type { ButtonHTMLAttributes, ReactNode } from 'react';

export type ButtonVariant = 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
export type ButtonSize = 'sm' | 'md' | 'lg';

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  fullWidth?: boolean;
  loading?: boolean;
  children: ReactNode;
}

const variantStyles: Record<ButtonVariant, React.CSSProperties> = {
  primary: {
    background: 'var(--color-brand-600)',
    color: 'var(--color-neutral-0)',
    border: '1px solid var(--color-brand-600)',
    boxShadow: '0 1px 2px rgba(15, 23, 42, 0.06)',
  },
  secondary: {
    background: 'var(--color-neutral-100)',
    color: 'var(--color-neutral-900)',
    border: '1px solid var(--color-neutral-200)',
  },
  outline: {
    background: 'transparent',
    color: 'var(--color-brand-600)',
    border: '1px solid var(--color-neutral-300)',
  },
  ghost: {
    background: 'transparent',
    color: 'var(--color-neutral-700)',
    border: '1px solid transparent',
  },
  danger: {
    background: 'var(--color-error-600)',
    color: 'var(--color-neutral-0)',
    border: '1px solid var(--color-error-600)',
  },
};

const sizeStyles: Record<ButtonSize, React.CSSProperties> = {
  sm: { padding: '0.375rem 0.75rem', fontSize: 'var(--font-size-sm)', borderRadius: 'var(--radius-md)' },
  md: { padding: '0.5625rem 1rem', fontSize: 'var(--font-size-sm)', borderRadius: 'var(--radius-lg)' },
  lg: { padding: '0.75rem 1.25rem', fontSize: 'var(--font-size-base)', borderRadius: 'var(--radius-lg)' },
};

export function Button({
  variant = 'primary',
  size = 'md',
  fullWidth = false,
  loading = false,
  disabled,
  children,
  style,
  type = 'button',
  className,
  ...rest
}: ButtonProps) {
  const isDisabled = disabled || loading;
  return (
    <button
      type={type}
      disabled={isDisabled}
      aria-busy={loading || undefined}
      className={`ui-btn${className ? ` ${className}` : ''}`}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '0.5rem',
        fontWeight: 600,
        letterSpacing: '-0.01em',
        cursor: isDisabled ? 'not-allowed' : 'pointer',
        opacity: isDisabled ? 0.55 : 1,
        width: fullWidth ? '100%' : undefined,
        lineHeight: 1.25,
        ...variantStyles[variant],
        ...sizeStyles[size],
        ...style,
      }}
      {...rest}
    >
      {loading ? 'Loading…' : children}
    </button>
  );
}
