import { SectionWrapper, GlobalContainer } from '@/components/layout';
import { SectionHeading } from '@/components/ui';

const BENEFITS = [
  'Save time with ready-made utilities',
  'Keep sensitive data on your device',
  'Access tools from any modern browser',
  'Grow your workflow as we add more tools',
];

export function BenefitsSection() {
  return (
    <SectionWrapper as="section" aria-labelledby="benefits-heading">
      <GlobalContainer maxWidth="lg">
        <div style={{ paddingTop: 'var(--space-12)', paddingBottom: 'var(--space-12)' }}>
          <SectionHeading
            id="benefits-heading"
            title="Benefits"
            description="What you get when you use VelnoxLabs."
          />
          <ul
            style={{
              listStyle: 'none',
              margin: 0,
              padding: 0,
              display: 'flex',
              flexDirection: 'column',
              gap: 'var(--space-3)',
              maxWidth: '28rem',
              marginLeft: 'auto',
              marginRight: 'auto',
            }}
          >
            {BENEFITS.map((b) => (
              <li
                key={b}
                style={{
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: 'var(--space-3)',
                  fontSize: 'var(--font-size-base)',
                  color: 'var(--foreground)',
                }}
              >
                <span aria-hidden="true" style={{ color: 'var(--primary)', fontWeight: 'bold' }}>
                  ✓
                </span>
                {b}
              </li>
            ))}
          </ul>
        </div>
      </GlobalContainer>
    </SectionWrapper>
  );
}
