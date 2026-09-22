'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import type { NavLink as NavLinkType } from '@/types/navigation';
import { cx } from '@/helpers/layout';

interface NavLinkProps {
  item: NavLinkType;
  className?: string;
  onNavigate?: () => void;
}

export function NavLinkItem({ item, className, onNavigate }: NavLinkProps) {
  const pathname = usePathname();
  const isActive =
    pathname === item.href ||
    (item.href !== '/' && pathname.startsWith(item.href));

  if (item.disabled) {
    return (
      <span
        aria-disabled="true"
        className={cx('nav-link', 'nav-link--disabled', className)}
        style={{
          opacity: 'var(--opacity-50)',
          cursor: 'not-allowed',
          padding: 'var(--space-2) var(--space-3)',
          color: 'var(--muted-foreground)',
        }}
      >
        {item.label}
      </span>
    );
  }

  return (
    <Link
      href={item.href}
      onClick={onNavigate}
      aria-current={isActive ? 'page' : undefined}
      className={cx('nav-link', isActive && 'nav-link--active', className)}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        padding: 'var(--space-2) var(--space-3)',
        borderRadius: 'var(--radius-md)',
        textDecoration: 'none',
        color: isActive ? 'var(--primary)' : 'var(--foreground)',
        fontWeight: isActive
          ? 'var(--font-weight-semibold)'
          : 'var(--font-weight-medium)',
        fontSize: 'var(--font-size-sm)',
        transition: 'color var(--duration-fast) var(--ease-in-out), background-color var(--duration-fast) var(--ease-in-out)',
        backgroundColor: isActive ? 'var(--accent)' : 'transparent',
      }}
    >
      {item.label}
    </Link>
  );
}
