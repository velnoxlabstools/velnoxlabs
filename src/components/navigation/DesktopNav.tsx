'use client';

import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import type { PrimaryNavItem, MegaMenuItem, NavGroup, NavLink } from '@/types/navigation';
import { NavLinkItem } from './NavLink';
import { navigationConfig } from '@/data/navigation';

function isMega(item: PrimaryNavItem): item is MegaMenuItem {
  return 'type' in item && item.type === 'mega';
}

function isGroup(item: PrimaryNavItem): item is NavGroup {
  return 'items' in item && !isMega(item);
}

function isLink(item: PrimaryNavItem): item is NavLink {
  return 'href' in item && !('items' in item) && !isMega(item);
}

export function DesktopNav() {
  const [openId, setOpenId] = useState<string | null>(null);
  const navRef = useRef<HTMLElement>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (navRef.current && !navRef.current.contains(e.target as Node)) {
        setOpenId(null);
      }
    }
    function handleEscape(e: KeyboardEvent) {
      if (e.key === 'Escape') setOpenId(null);
    }
    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleEscape);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleEscape);
    };
  }, []);

  return (
    <nav
      ref={navRef}
      aria-label="Primary"
      style={{
        display: 'none',
        alignItems: 'center',
        gap: 'var(--space-1)',
      }}
      className="desktop-nav"
    >
      {navigationConfig.primary.map((item) => {
        if (isLink(item)) {
          return <NavLinkItem key={item.id} item={item} />;
        }

        if (isGroup(item) || isMega(item)) {
          const isOpen = openId === item.id;
          return (
            <div key={item.id} style={{ position: 'relative' }}>
              <button
                type="button"
                aria-expanded={isOpen}
                aria-haspopup="true"
                onClick={() => setOpenId(isOpen ? null : item.id)}
                onKeyDown={(e) => {
                  if (e.key === 'ArrowDown') {
                    e.preventDefault();
                    setOpenId(item.id);
                  }
                }}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 'var(--space-1)',
                  padding: 'var(--space-2) var(--space-3)',
                  border: 'none',
                  background: 'transparent',
                  color: 'var(--foreground)',
                  fontWeight: 'var(--font-weight-medium)',
                  fontSize: 'var(--font-size-sm)',
                  borderRadius: 'var(--radius-md)',
                  cursor: 'pointer',
                }}
              >
                {item.label}
                <span aria-hidden="true" style={{ fontSize: '0.65em' }}>
                  ▾
                </span>
              </button>

              {isOpen && (
                <div
                  role="menu"
                  style={{
                    position: 'absolute',
                    top: '100%',
                    left: 0,
                    marginTop: 'var(--space-2)',
                    minWidth: isMega(item) ? '28rem' : '12rem',
                    padding: 'var(--space-3)',
                    background: 'var(--popover)',
                    color: 'var(--popover-foreground)',
                    border: '1px solid var(--border)',
                    borderRadius: 'var(--radius-lg)',
                    boxShadow: 'var(--shadow-lg)',
                    zIndex: 'var(--z-dropdown)',
                    display: isMega(item) ? 'grid' : 'flex',
                    gridTemplateColumns: isMega(item)
                      ? `repeat(${(item as MegaMenuItem).columns.length}, 1fr)`
                      : undefined,
                    flexDirection: isMega(item) ? undefined : 'column',
                    gap: 'var(--space-4)',
                  }}
                >
                  {isMega(item) &&
                    (item as MegaMenuItem).columns.map((col) => (
                      <div key={col.id}>
                        <div
                          style={{
                            fontSize: 'var(--font-size-xs)',
                            fontWeight: 'var(--font-weight-semibold)',
                            color: 'var(--muted-foreground)',
                            marginBottom: 'var(--space-2)',
                            textTransform: 'uppercase',
                            letterSpacing: 'var(--letter-spacing-wide)',
                          }}
                        >
                          {col.title}
                        </div>
                        <ul style={{ listStyle: 'none', margin: 0, padding: 0 }}>
                          {col.items.map((link) => (
                            <li key={link.id}>
                              <Link
                                href={link.href}
                                role="menuitem"
                                onClick={() => setOpenId(null)}
                                style={{
                                  display: 'block',
                                  padding: 'var(--space-2)',
                                  borderRadius: 'var(--radius-md)',
                                  textDecoration: 'none',
                                  color: 'var(--foreground)',
                                  fontSize: 'var(--font-size-sm)',
                                }}
                              >
                                {link.label}
                                {link.description && (
                                  <span
                                    style={{
                                      display: 'block',
                                      fontSize: 'var(--font-size-xs)',
                                      color: 'var(--muted-foreground)',
                                    }}
                                  >
                                    {link.description}
                                  </span>
                                )}
                              </Link>
                            </li>
                          ))}
                        </ul>
                      </div>
                    ))}

                  {isGroup(item) &&
                    item.items.map((link) => (
                      <NavLinkItem
                        key={link.id}
                        item={link}
                        onNavigate={() => setOpenId(null)}
                      />
                    ))}
                </div>
              )}
            </div>
          );
        }

        return null;
      })}
    </nav>
  );
}
