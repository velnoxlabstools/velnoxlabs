import { SectionWrapper, GlobalContainer } from '@/components/layout';
import { SectionHeading, HomepageGrid } from '@/components/ui';
import { APP_NAME } from '@/constants';

const REASONS = [
  { title: 'Private by default', body: 'Processing happens in your browser. Nothing is uploaded unless you choose.' },
  { title: 'Fast & free', body: 'No accounts, no paywalls for core tools. Open a tool and start working.' },
  { title: 'Works everywhere', body: 'Responsive design for desktop, tablet, and mobile. Same experience on every device.' },
];

export function WhyChooseSection() {
  return (
    <SectionWrapper as="section" aria-labelledby="why-choose-heading">
      <GlobalContainer maxWidth="2xl">
        <div style={{ paddingTop: 'var(--space-12)', paddingBottom: 'var(--space-12)' }}>
          <SectionHeading
            id="why-choose-heading"
            title={`Why choose ${APP_NAME}`}
            description="Built for people who want results without friction."
          />
          <HomepageGrid columns={3}>
            {REASONS.map((r) => (
              <article
                key={r.title}
                style={{
                  padding: 'var(--space-6)',
                  borderRadius: 'var(--radius-lg)',
                  border: '1px solid var(--border)',
                  background: 'var(--card)',
                }}
              >
                <h3
                  style={{
                    margin: 0,
                    fontSize: 'var(--font-size-lg)',
                    fontWeight: 'var(--font-weight-semibold)',
                    color: 'var(--foreground)',
                  }}
                >
                  {r.title}
                </h3>
                <p
                  style={{
                    marginTop: 'var(--space-2)',
                    marginBottom: 0,
                    fontSize: 'var(--font-size-sm)',
                    lineHeight: 'var(--line-height-relaxed)',
                    color: 'var(--muted-foreground)',
                  }}
                >
                  {r.body}
                </p>
              </article>
            ))}
          </HomepageGrid>
        </div>
      </GlobalContainer>
    </SectionWrapper>
  );
}
