import type { HTMLAttributes, ReactNode } from 'react';

export type BadgeVariant = 'default' | 'brand' | 'success' | 'warning' | 'error';

export interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  children: ReactNode;
  variant?: BadgeVariant;
}

const styles: Record<BadgeVariant, React.CSSProperties> = {
  default: { background: 'var(--color-neutral-100)', color: 'var(--color-neutral-700)' },
  brand: { background: 'var(--color-brand-100)', color: 'var(--color-brand-700)' },
  success: { background: 'var(--color-success-100)', color: 'var(--color-success-700)' },
  warning: { background: 'var(--color-warning-100)', color: 'var(--color-warning-700)' },
  error: { background: 'var(--color-error-100)', color: 'var(--color-error-700)' },
};

export function Badge({ children, variant = 'default', style, ...rest }: BadgeProps) {
  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        padding: '0.125rem 0.5rem',
        borderRadius: '999px',
        fontSize: 'var(--font-size-xs)',
        fontWeight: 600,
        lineHeight: 1.5,
        ...styles[variant],
        ...style,
      }}
      {...rest}
    >
      {children}
    </span>
  );
}
