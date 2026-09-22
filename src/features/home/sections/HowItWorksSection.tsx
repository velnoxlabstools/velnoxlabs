import { SectionWrapper, GlobalContainer } from '@/components/layout';
import { SectionHeading, HomepageGrid } from '@/components/ui';

const STEPS = [
  { step: '1', title: 'Choose a tool', body: 'Pick from categories or search the catalog.' },
  { step: '2', title: 'Use it instantly', body: 'No install, no account — open and go.' },
  { step: '3', title: 'Get results', body: 'Copy, download, or share your output.' },
];

export function HowItWorksSection() {
  return (
    <SectionWrapper as="section" aria-labelledby="how-it-works-heading">
      <GlobalContainer maxWidth="2xl">
        <div style={{ paddingTop: 'var(--space-12)', paddingBottom: 'var(--space-12)' }}>
          <SectionHeading
            id="how-it-works-heading"
            title="How it works"
            description="Three simple steps to get things done."
          />
          <HomepageGrid columns={3}>
            {STEPS.map((s) => (
              <div key={s.step} style={{ textAlign: 'center' }}>
                <div
                  aria-hidden="true"
                  style={{
                    width: '2.5rem',
                    height: '2.5rem',
                    margin: '0 auto var(--space-3)',
                    borderRadius: 'var(--radius-full)',
                    background: 'var(--primary)',
                    color: 'var(--primary-foreground)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontWeight: 'var(--font-weight-bold)',
                  }}
                >
                  {s.step}
                </div>
                <h3
                  style={{
                    margin: 0,
                    fontSize: 'var(--font-size-lg)',
                    fontWeight: 'var(--font-weight-semibold)',
                  }}
                >
                  {s.title}
                </h3>
                <p
                  style={{
                    marginTop: 'var(--space-2)',
                    marginBottom: 0,
                    fontSize: 'var(--font-size-sm)',
                    color: 'var(--muted-foreground)',
                  }}
                >
                  {s.body}
                </p>
              </div>
            ))}
          </HomepageGrid>
        </div>
      </GlobalContainer>
    </SectionWrapper>
  );
}
