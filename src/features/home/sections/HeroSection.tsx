import Link from 'next/link';
import { SectionWrapper, GlobalContainer } from '@/components/layout';
import type { HomepageConfig, HomepageStats } from '@/types/tools';
import { formatStatValue } from '@/services/home';

interface HeroSectionProps {
  config: HomepageConfig['hero'];
  stats: HomepageStats;
}

export function HeroSection({ config, stats }: HeroSectionProps) {
  return (
    <SectionWrapper as="section" aria-labelledby="hero-heading">
      <GlobalContainer maxWidth="2xl">
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            textAlign: 'center',
            paddingTop: 'var(--space-20)',
            paddingBottom: 'var(--space-16)',
            gap: 'var(--space-5)',
          }}
        >
          <p
            style={{
              margin: 0,
              display: 'inline-flex',
              alignItems: 'center',
              padding: '0.25rem 0.75rem',
              borderRadius: 'var(--radius-full)',
              border: '1px solid var(--border)',
              background: 'var(--color-neutral-50)',
              fontSize: 'var(--font-size-xs)',
              fontWeight: 600,
              color: 'var(--color-brand-700)',
              letterSpacing: '0.04em',
              textTransform: 'uppercase',
            }}
          >
            {config.eyebrow}
          </p>

          <h1
            id="hero-heading"
            style={{
              margin: 0,
              fontSize: 'clamp(2.25rem, 5vw, 3.75rem)',
              fontWeight: 700,
              lineHeight: 1.1,
              letterSpacing: '-0.03em',
              color: 'var(--foreground)',
              maxWidth: '16ch',
            }}
          >
            {config.title}
          </h1>

          <p
            style={{
              margin: 0,
              fontSize: 'clamp(1rem, 2vw, 1.25rem)',
              lineHeight: 1.6,
              color: 'var(--muted-foreground)',
              maxWidth: '34rem',
            }}
          >
            {config.description}
          </p>

          <div
            style={{
              display: 'flex',
              flexWrap: 'wrap',
              gap: 'var(--space-3)',
              justifyContent: 'center',
              marginTop: 'var(--space-3)',
            }}
          >
            <Link
              href={config.primaryCta.href}
              className="ui-btn"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                padding: '0.75rem 1.25rem',
                background: 'var(--primary, var(--color-brand-600))',
                color: 'var(--primary-foreground, #fff)',
                borderRadius: 'var(--radius-lg)',
                textDecoration: 'none',
                fontWeight: 600,
                fontSize: 'var(--font-size-sm)',
                border: '1px solid transparent',
                boxShadow: '0 1px 2px rgba(15,23,42,0.08)',
              }}
            >
              {config.primaryCta.label}
            </Link>
            <Link
              href={config.secondaryCta.href}
              className="ui-btn"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                padding: '0.75rem 1.25rem',
                background: 'transparent',
                color: 'var(--foreground)',
                borderRadius: 'var(--radius-lg)',
                textDecoration: 'none',
                fontWeight: 600,
                fontSize: 'var(--font-size-sm)',
                border: '1px solid var(--border)',
              }}
            >
              {config.secondaryCta.label}
            </Link>
          </div>

          <dl
            style={{
              display: 'flex',
              flexWrap: 'wrap',
              justifyContent: 'center',
              gap: 'var(--space-10)',
              marginTop: 'var(--space-12)',
              marginBottom: 0,
              padding: 'var(--space-6) var(--space-8)',
              border: '1px solid var(--border)',
              borderRadius: 'var(--radius-2xl)',
              background: 'var(--card, var(--color-neutral-0))',
            }}
          >
            {[
              { label: 'Tools', value: formatStatValue(stats.toolCount) },
              { label: 'Categories', value: formatStatValue(stats.categoryCount) },
              { label: 'Monthly users', value: stats.monthlyUsersLabel },
            ].map((stat) => (
              <div key={stat.label} style={{ textAlign: 'center', minWidth: '5.5rem' }}>
                <dt
                  style={{
                    margin: 0,
                    fontSize: 'var(--font-size-xs)',
                    fontWeight: 500,
                    color: 'var(--muted-foreground)',
                    textTransform: 'uppercase',
                    letterSpacing: '0.04em',
                  }}
                >
                  {stat.label}
                </dt>
                <dd
                  style={{
                    margin: 'var(--space-1) 0 0',
                    fontSize: 'var(--font-size-2xl)',
                    fontWeight: 700,
                    letterSpacing: '-0.02em',
                    color: 'var(--foreground)',
                  }}
                >
                  {stat.value}
                </dd>
              </div>
            ))}
          </dl>
        </div>
      </GlobalContainer>
    </SectionWrapper>
  );
}
