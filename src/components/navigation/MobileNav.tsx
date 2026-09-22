'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import { navigationConfig } from '@/data/navigation';
import { NavLinkItem } from './NavLink';
import type { PrimaryNavItem, MegaMenuItem, NavGroup, NavLink } from '@/types/navigation';

function isMega(item: PrimaryNavItem): item is MegaMenuItem {
  return 'type' in item && item.type === 'mega';
}
function isGroup(item: PrimaryNavItem): item is NavGroup {
  return 'items' in item && !isMega(item);
}
function isLink(item: PrimaryNavItem): item is NavLink {
  return 'href' in item && !('items' in item) && !isMega(item);
}

interface MobileNavProps {
  open: boolean;
  onClose: () => void;
}

export function MobileNav({ open, onClose }: MobileNavProps) {
  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') onClose();
    }
    document.addEventListener('keydown', onKey);
    return () => {
      document.body.style.overflow = prev;
      document.removeEventListener('keydown', onKey);
    };
  }, [open, onClose]);

  if (!open) return null;

  return (
    <>
      <div
        role="presentation"
        onClick={onClose}
        style={{
          position: 'fixed',
          inset: 0,
          background: 'rgb(0 0 0 / 0.4)',
          zIndex: 'var(--z-overlay)',
        }}
      />
      <aside
        role="dialog"
        aria-modal="true"
        aria-label="Mobile navigation"
        style={{
          position: 'fixed',
          top: 0,
          right: 0,
          bottom: 0,
          width: 'min(20rem, 85vw)',
          background: 'var(--background)',
          borderLeft: '1px solid var(--border)',
          zIndex: 'var(--z-modal)',
          display: 'flex',
          flexDirection: 'column',
          padding: 'var(--space-4)',
          overflowY: 'auto',
          boxShadow: 'var(--shadow-xl)',
        }}
      >
        <div
          style={{
            display: 'flex',
            justifyContent: 'flex-end',
            marginBottom: 'var(--space-4)',
          }}
        >
          <button
            type="button"
            onClick={onClose}
            aria-label="Close menu"
            style={{
              width: 'var(--icon-xl)',
              height: 'var(--icon-xl)',
              border: '1px solid var(--border)',
              borderRadius: 'var(--radius-md)',
              background: 'var(--background)',
              cursor: 'pointer',
              fontSize: 'var(--font-size-lg)',
            }}
          >
            ×
          </button>
        </div>

        <nav aria-label="Mobile primary">
          <ul style={{ listStyle: 'none', margin: 0, padding: 0, display: 'flex', flexDirection: 'column', gap: 'var(--space-1)' }}>
            {navigationConfig.primary.map((item) => {
              if (isLink(item)) {
                return (
                  <li key={item.id}>
                    <NavLinkItem item={item} onNavigate={onClose} />
                  </li>
                );
              }
              if (isGroup(item) || isMega(item)) {
                const links = isMega(item)
                  ? (item as MegaMenuItem).columns.flatMap((c) => c.items)
                  : item.items;
                return (
                  <li key={item.id}>
                    <div
                      style={{
                        fontSize: 'var(--font-size-xs)',
                        fontWeight: 'var(--font-weight-semibold)',
                        color: 'var(--muted-foreground)',
                        padding: 'var(--space-2) var(--space-3)',
                        textTransform: 'uppercase',
                      }}
                    >
                      {item.label}
                    </div>
                    <ul style={{ listStyle: 'none', margin: 0, padding: 0 }}>
                      {links.map((link) => (
                        <li key={link.id}>
                          <NavLinkItem item={link} onNavigate={onClose} />
                        </li>
                      ))}
                    </ul>
                  </li>
                );
              }
              return null;
            })}
          </ul>
        </nav>

        <div
          style={{
            marginTop: 'auto',
            paddingTop: 'var(--space-6)',
            borderTop: '1px solid var(--border)',
            display: 'flex',
            flexDirection: 'column',
            gap: 'var(--space-2)',
          }}
        >
          {navigationConfig.secondary.map((item) => (
            <NavLinkItem key={item.id} item={item} onNavigate={onClose} />
          ))}
          {navigationConfig.cta && (
            <Link
              href={navigationConfig.cta.href}
              onClick={onClose}
              style={{
                display: 'inline-flex',
                justifyContent: 'center',
                padding: 'var(--space-3) var(--space-4)',
                background: 'var(--primary)',
                color: 'var(--primary-foreground)',
                borderRadius: 'var(--radius-md)',
                textDecoration: 'none',
                fontWeight: 'var(--font-weight-semibold)',
                fontSize: 'var(--font-size-sm)',
              }}
            >
              {navigationConfig.cta.label}
            </Link>
          )}
        </div>
      </aside>
    </>
  );
}
