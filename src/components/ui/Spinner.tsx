import type { HTMLAttributes } from 'react';

export interface SpinnerProps extends HTMLAttributes<HTMLSpanElement> {
  size?: number;
  label?: string;
}

export function Spinner({ size = 20, label = 'Loading', style, ...rest }: SpinnerProps) {
  return (
    <span
      role="status"
      aria-label={label}
      style={{
        display: 'inline-block',
        width: size,
        height: size,
        border: '2px solid var(--color-neutral-200)',
        borderTopColor: 'var(--color-brand-600)',
        borderRadius: '50%',
        animation: 'velnox-spin 0.7s linear infinite',
        ...style,
      }}
      {...rest}
    />
  );
}
