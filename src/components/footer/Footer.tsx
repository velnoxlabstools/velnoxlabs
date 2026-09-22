import Link from 'next/link';
import { navigationConfig } from '@/data/navigation';
import { GlobalContainer } from '@/components/layout';
import { Logo } from '@/components/header/Logo';
import { APP_NAME } from '@/constants';

export function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer
      role="contentinfo"
      style={{
        width: '100%',
        borderTop: '1px solid var(--border)',
        background: 'var(--muted)',
        marginTop: 'auto',
      }}
    >
      <GlobalContainer maxWidth="2xl">
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(10rem, 1fr))',
            gap: 'var(--space-8)',
            paddingTop: 'var(--space-12)',
            paddingBottom: 'var(--space-10)',
          }}
        >
          <div style={{ gridColumn: 'span 1' }}>
            <Logo />
            <p
              style={{
                marginTop: 'var(--space-3)',
                fontSize: 'var(--font-size-sm)',
                color: 'var(--muted-foreground)',
                maxWidth: '16rem',
                lineHeight: 'var(--line-height-relaxed)',
              }}
            >
              Free online tools platform. Built for speed, privacy, and simplicity.
            </p>
            {/* Social architecture */}
            <div
              aria-label="Social links"
              style={{
                display: 'flex',
                gap: 'var(--space-3)',
                marginTop: 'var(--space-4)',
              }}
            >
              {navigationConfig.social.map((s) => (
                <a
                  key={s.id}
                  href={s.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={s.label}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    width: 'var(--icon-lg)',
                    height: 'var(--icon-lg)',
                    borderRadius: 'var(--radius-md)',
                    border: '1px solid var(--border)',
                    color: 'var(--foreground)',
                    textDecoration: 'none',
                    fontSize: 'var(--font-size-xs)',
                  }}
                >
                  {s.icon.slice(0, 2).toUpperCase()}
                </a>
              ))}
            </div>
          </div>

          {navigationConfig.footer.map((group) => (
            <div key={group.id}>
              <h2
                style={{
                  fontSize: 'var(--font-size-sm)',
                  fontWeight: 'var(--font-weight-semibold)',
                  marginBottom: 'var(--space-3)',
                  color: 'var(--foreground)',
                }}
              >
                {group.title}
              </h2>
              <ul style={{ listStyle: 'none', margin: 0, padding: 0 }}>
                {group.links.map((link) => (
                  <li key={link.id} style={{ marginBottom: 'var(--space-2)' }}>
                    <Link
                      href={link.href}
                      style={{
                        fontSize: 'var(--font-size-sm)',
                        color: 'var(--muted-foreground)',
                        textDecoration: 'none',
                      }}
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Footer bottom bar */}
        <div
          style={{
            display: 'flex',
            flexWrap: 'wrap',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: 'var(--space-4)',
            paddingTop: 'var(--space-6)',
            paddingBottom: 'var(--space-6)',
            borderTop: '1px solid var(--border)',
          }}
        >
          <p
            style={{
              margin: 0,
              fontSize: 'var(--font-size-sm)',
              color: 'var(--muted-foreground)',
            }}
          >
            © {year} {APP_NAME}. All rights reserved.
          </p>
          <nav aria-label="Legal">
            <ul
              style={{
                listStyle: 'none',
                margin: 0,
                padding: 0,
                display: 'flex',
                flexWrap: 'wrap',
                gap: 'var(--space-4)',
              }}
            >
              {navigationConfig.legal.map((link) => (
                <li key={link.id}>
                  <Link
                    href={link.href}
                    style={{
                      fontSize: 'var(--font-size-sm)',
                      color: 'var(--muted-foreground)',
                      textDecoration: 'none',
                    }}
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        </div>
      </GlobalContainer>
    </footer>
  );
}
