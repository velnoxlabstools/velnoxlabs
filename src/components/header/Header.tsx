'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Logo } from './Logo';
import { SkipToContent } from './SkipToContent';
import { ThemeToggle } from './ThemeToggle';
import { DesktopNav } from '@/components/navigation/DesktopNav';
import { MobileNav } from '@/components/navigation/MobileNav';
import { navigationConfig } from '@/data/navigation';
import { GlobalContainer } from '@/components/layout';
import SearchBar from '@/components/SearchBar';

export function Header() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    function onScroll() {
      setScrolled(window.scrollY > 8);
    }
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <>
      <SkipToContent />
      <header
        role="banner"
        style={{
          position: 'sticky',
          top: 0,
          zIndex: 'var(--z-sticky)',
          width: '100%',
          background: scrolled
            ? 'color-mix(in srgb, var(--background) 90%, transparent)'
            : 'var(--background)',
          backdropFilter: scrolled ? 'blur(var(--blur-md))' : undefined,
          borderBottom: scrolled ? '1px solid var(--border)' : '1px solid transparent',
          transition:
            'background var(--duration-normal) var(--ease-in-out), border-color var(--duration-normal) var(--ease-in-out), box-shadow var(--duration-normal) var(--ease-in-out)',
          boxShadow: scrolled ? 'var(--shadow-sm)' : 'none',
        }}
      >
        <GlobalContainer maxWidth="2xl">
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              height: '4rem',
              gap: 'var(--space-4)',
            }}
          >
            <Logo />

            {/* Desktop nav - sirf bade screen par dikhega */}
            <div
              className="hidden md:flex"
              style={{
                alignItems: 'center',
                gap: 'var(--space-2)',
                flex: 1,
                justifyContent: 'center',
              }}
            >
              <DesktopNav />
            </div>

            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 'var(--space-3)',
              }}
            >
              {/* Search Bar - sirf bade screen par dikhega */}
              <div className="hidden md:block">
                <SearchBar />
              </div>

              {navigationConfig.cta && (
                <Link
                  href={navigationConfig.cta.href}
                  className="hidden md:inline-flex"
                  style={{
                    padding: 'var(--space-2) var(--space-4)',
                    background: 'var(--primary)',
                    color: 'var(--primary-foreground)',
                    borderRadius: 'var(--radius-md)',
                    textDecoration: 'none',
                    fontWeight: 'var(--font-weight-semibold)',
                    fontSize: 'var(--font-size-sm)',
                    whiteSpace: 'nowrap',
                  }}
                >
                  {navigationConfig.cta.label}
                </Link>
              )}

              <button
                type="button"
                className="md:hidden"
                aria-label="Open menu"
                aria-expanded={mobileOpen}
                aria-controls="mobile-nav"
                onClick={() => setMobileOpen(true)}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  width: 'var(--icon-xl)',
                  height: 'var(--icon-xl)',
                  border: '1px solid var(--border)',
                  borderRadius: 'var(--radius-md)',
                  background: 'var(--background)',
                  cursor: 'pointer',
                  fontSize: 'var(--font-size-lg)',
                }}
              >
                ☰
              </button>
            </div>
          </div>
        </GlobalContainer>
      </header>

      <MobileNav open={mobileOpen} onClose={() => setMobileOpen(false)} />
    </>
  );
}

export default Header;