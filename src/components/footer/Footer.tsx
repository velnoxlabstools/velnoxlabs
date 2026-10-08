import Link from 'next/link';
import { getTranslations } from 'next-intl/server';
import { navigationConfig } from '@/data/navigation';
import { GlobalContainer } from '@/components/layout';
import { Logo } from '@/components/header/Logo';

export async function Footer() {
  const t = await getTranslations('Footer');
  const year = new Date().getFullYear();

  const groupTitleKeys: Record<string, string> = {
    product: 'productTitle',
    company: 'companyTitle',
  };

  const linkLabelKeys: Record<string, string> = {
    'f-tools': 'tools',
    'f-categories': 'categories',
    'f-pricing': 'pricing',
    'f-about': 'about',
    'f-contact': 'contact',
    privacy: 'privacy',
    terms: 'terms',
    cookies: 'cookies',
  };

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
            gridTemplateColumns: 'repeat(auto-fit, minmax(9rem, max-content))',
            gap: 'var(--space-12)',
            paddingTop: 'var(--space-12)',
            paddingBottom: 'var(--space-10)',
          }}
        >
          {/* Logo + description column */}
          <div style={{ maxWidth: '18rem' }}>
            <Logo />
            <p
              style={{
                marginTop: 'var(--space-3)',
                fontSize: 'var(--font-size-sm)',
                color: 'var(--muted-foreground)',
                lineHeight: 'var(--line-height-relaxed)',
              }}
            >
              {t('tagline')}
            </p>
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

          {/* Product & Company columns */}
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
                {t(groupTitleKeys[group.id] || group.title)}
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
                      {t(linkLabelKeys[link.id] || link.label)}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}

          {/* Legal column */}
          <div>
            <h2
              style={{
                fontSize: 'var(--font-size-sm)',
                fontWeight: 'var(--font-weight-semibold)',
                marginBottom: 'var(--space-3)',
                color: 'var(--foreground)',
              }}
            >
              {t('legalTitle')}
            </h2>
            <ul style={{ listStyle: 'none', margin: 0, padding: 0 }}>
              {navigationConfig.legal.map((link) => (
                <li key={link.id} style={{ marginBottom: 'var(--space-2)' }}>
                  <Link
                    href={link.href}
                    style={{
                      fontSize: 'var(--font-size-sm)',
                      color: 'var(--muted-foreground)',
                      textDecoration: 'none',
                    }}
                  >
                    {t(linkLabelKeys[link.id] || link.label)}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Bottom bar */}
        <div
          style={{
            paddingTop: 'var(--space-6)',
            paddingBottom: 'var(--space-6)',
            borderTop: '1px solid var(--border)',
            textAlign: 'center',
          }}
        >
          <p
            style={{
              margin: 0,
              fontSize: 'var(--font-size-sm)',
              color: 'var(--muted-foreground)',
            }}
          >
            {t('copyright', { year })}
          </p>
        </div>
      </GlobalContainer>
    </footer>
  );
}