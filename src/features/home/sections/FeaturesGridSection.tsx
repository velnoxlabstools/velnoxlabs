import { SectionWrapper, GlobalContainer } from '@/components/layout';
import { SectionHeading, HomepageGrid } from '@/components/ui';

const FEATURES = [
  { title: 'No installation', body: 'Every tool runs in the browser.' },
  { title: 'Keyboard friendly', body: 'Full keyboard navigation support.' },
  { title: 'Dark mode', body: 'Comfortable viewing day or night.' },
  { title: 'Accessible', body: 'Semantic markup and ARIA where needed.' },
];

export function FeaturesGridSection() {
  return (
    <SectionWrapper as="section" aria-labelledby="features-heading">
      <GlobalContainer maxWidth="2xl">
        <div style={{ paddingTop: 'var(--space-12)', paddingBottom: 'var(--space-12)' }}>
          <SectionHeading
            id="features-heading"
            title="Features"
            description="Everything you need from a modern tools platform."
          />
          <HomepageGrid columns={4}>
            {FEATURES.map((f) => (
              <div
                key={f.title}
                style={{
                  padding: 'var(--space-4)',
                  borderRadius: 'var(--radius-md)',
                  background: 'var(--muted)',
                }}
              >
                <h3
                  style={{
                    margin: 0,
                    fontSize: 'var(--font-size-base)',
                    fontWeight: 'var(--font-weight-semibold)',
                  }}
                >
                  {f.title}
                </h3>
                <p
                  style={{
                    marginTop: 'var(--space-1)',
                    marginBottom: 0,
                    fontSize: 'var(--font-size-sm)',
                    color: 'var(--muted-foreground)',
                  }}
                >
                  {f.body}
                </p>
              </div>
            ))}
          </HomepageGrid>
        </div>
      </GlobalContainer>
    </SectionWrapper>
  );
}
