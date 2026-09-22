import type { HTMLAttributes, ReactNode } from 'react';

export type AlertVariant = 'info' | 'success' | 'warning' | 'error';

export interface AlertProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
  variant?: AlertVariant;
  title?: string;
}

const styles: Record<AlertVariant, React.CSSProperties> = {
  info: {
    background: 'var(--color-info-50)',
    borderColor: 'var(--color-info-500)',
    color: 'var(--color-info-700)',
  },
  success: {
    background: 'var(--color-success-50)',
    borderColor: 'var(--color-success-500)',
    color: 'var(--color-success-700)',
  },
  warning: {
    background: 'var(--color-warning-50)',
    borderColor: 'var(--color-warning-500)',
    color: 'var(--color-warning-700)',
  },
  error: {
    background: 'var(--color-error-50)',
    borderColor: 'var(--color-error-500)',
    color: 'var(--color-error-700)',
  },
};

export function Alert({ children, variant = 'info', title, style, role, ...rest }: AlertProps) {
  return (
    <div
      role={role ?? (variant === 'error' ? 'alert' : 'status')}
      style={{
        padding: '0.75rem 1rem',
        borderRadius: 'var(--radius-md, 0.5rem)',
        border: '1px solid',
        ...styles[variant],
        ...style,
      }}
      {...rest}
    >
      {title ? <div style={{ fontWeight: 600, marginBottom: '0.25rem' }}>{title}</div> : null}
      <div style={{ fontSize: 'var(--font-size-sm)' }}>{children}</div>
    </div>
  );
}
