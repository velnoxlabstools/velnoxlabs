import Link from 'next/link';
import { SectionWrapper, GlobalContainer } from '@/components/layout';
import type { HomepageCta } from '@/types/tools';

interface CtaBannerSectionProps {
  cta: HomepageCta;
}

export function CtaBannerSection({ cta }: CtaBannerSectionProps) {
  return (
    <SectionWrapper as="section" aria-labelledby="cta-banner-heading">
      <GlobalContainer maxWidth="2xl">
        <div
          style={{
            marginTop: 'var(--space-8)',
            marginBottom: 'var(--space-16)',
            padding: 'var(--space-10) var(--space-6)',
            borderRadius: 'var(--radius-2xl)',
            background: 'var(--primary)',
            color: 'var(--primary-foreground)',
            textAlign: 'center',
          }}
        >
          <h2
            id="cta-banner-heading"
            style={{
              margin: 0,
              fontSize: 'var(--font-size-2xl)',
              fontWeight: 'var(--font-weight-bold)',
            }}
          >
            {cta.title}
          </h2>
          <p
            style={{
              marginTop: 'var(--space-2)',
              marginBottom: 'var(--space-6)',
              opacity: 'var(--opacity-90)',
              fontSize: 'var(--font-size-base)',
            }}
          >
            {cta.description}
          </p>
          <Link
            href={cta.primaryHref}
            style={{
              display: 'inline-flex',
              padding: 'var(--space-3) var(--space-6)',
              background: 'var(--primary-foreground)',
              color: 'var(--primary)',
              borderRadius: 'var(--radius-md)',
              textDecoration: 'none',
              fontWeight: 'var(--font-weight-semibold)',
            }}
          >
            {cta.primaryLabel}
          </Link>
        </div>
      </GlobalContainer>
    </SectionWrapper>
  );
}
