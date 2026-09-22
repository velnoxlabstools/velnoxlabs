import Link from 'next/link';
import { APP_NAME } from '@/constants';

interface LogoProps {
  className?: string;
}

export function Logo({ className }: LogoProps) {
  return (
    <Link
      href="/"
      className={className}
      aria-label={`${APP_NAME} home`}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 'var(--space-2)',
        textDecoration: 'none',
        color: 'var(--foreground)',
        fontWeight: 'var(--font-weight-bold)',
        fontSize: 'var(--font-size-xl)',
        letterSpacing: 'var(--letter-spacing-tight)',
      }}
    >
      <span
        aria-hidden="true"
        style={{
          display: 'inline-flex',
          width: 'var(--icon-lg)',
          height: 'var(--icon-lg)',
          borderRadius: 'var(--radius-md)',
          background: 'var(--primary)',
          color: 'var(--primary-foreground)',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: 'var(--font-size-sm)',
          fontWeight: 'var(--font-weight-bold)',
        }}
      >
        V
      </span>
      <span>{APP_NAME}</span>
    </Link>
  );
}
