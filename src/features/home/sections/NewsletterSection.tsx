import { SectionWrapper, GlobalContainer } from '@/components/layout';
import { SectionHeading } from '@/components/ui';

/**
 * Newsletter architecture only — no form logic or API.
 */
export function NewsletterSection() {
  return (
    <SectionWrapper as="section" aria-labelledby="newsletter-heading">
      <GlobalContainer maxWidth="md">
        <div
          style={{
            paddingTop: 'var(--space-12)',
            paddingBottom: 'var(--space-12)',
            textAlign: 'center',
          }}
        >
          <SectionHeading
            id="newsletter-heading"
            title="Stay updated"
            description="Get notified when we ship new tools. Form integration comes in a later phase."
          />
          <div
            role="group"
            aria-label="Newsletter signup placeholder"
            style={{
              display: 'flex',
              flexWrap: 'wrap',
              gap: 'var(--space-2)',
              justifyContent: 'center',
              maxWidth: '24rem',
              margin: '0 auto',
            }}
          >
            <input
              type="email"
              placeholder="you@example.com"
              disabled
              aria-disabled="true"
              style={{
                flex: '1 1 12rem',
                padding: 'var(--space-3) var(--space-4)',
                borderRadius: 'var(--radius-md)',
                border: '1px solid var(--border)',
                background: 'var(--muted)',
                color: 'var(--muted-foreground)',
                fontSize: 'var(--font-size-sm)',
              }}
            />
            <button
              type="button"
              disabled
              style={{
                padding: 'var(--space-3) var(--space-5)',
                borderRadius: 'var(--radius-md)',
                border: 'none',
                background: 'var(--primary)',
                color: 'var(--primary-foreground)',
                fontWeight: 'var(--font-weight-semibold)',
                fontSize: 'var(--font-size-sm)',
                opacity: 'var(--opacity-60)',
                cursor: 'not-allowed',
              }}
            >
              Subscribe
            </button>
          </div>
        </div>
      </GlobalContainer>
    </SectionWrapper>
  );
}
