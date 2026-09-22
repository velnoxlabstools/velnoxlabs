import Link from 'next/link';
import type { ComponentProps, ReactNode } from 'react';

export interface LinkButtonProps extends Omit<ComponentProps<typeof Link>, 'className'> {
  children: ReactNode;
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost';
}

const variantStyles: Record<NonNullable<LinkButtonProps['variant']>, React.CSSProperties> = {
  primary: {
    background: 'var(--color-brand-600)',
    color: 'var(--color-neutral-0)',
    border: '1px solid var(--color-brand-600)',
  },
  secondary: {
    background: 'var(--color-neutral-100)',
    color: 'var(--color-neutral-900)',
    border: '1px solid var(--color-neutral-200)',
  },
  outline: {
    background: 'transparent',
    color: 'var(--color-brand-600)',
    border: '1px solid var(--color-brand-600)',
  },
  ghost: {
    background: 'transparent',
    color: 'var(--color-neutral-700)',
    border: '1px solid transparent',
  },
};

export function LinkButton({ children, variant = 'primary', style, ...rest }: LinkButtonProps) {
  return (
    <Link
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '0.5rem',
        padding: '0.5rem 1rem',
        borderRadius: 'var(--radius-md, 0.5rem)',
        fontWeight: 600,
        textDecoration: 'none',
        fontSize: 'var(--font-size-base)',
        ...variantStyles[variant],
        ...(typeof style === 'object' && style !== null ? style : {}),
      }}
      {...rest}
    >
      {children}
    </Link>
  );
}
