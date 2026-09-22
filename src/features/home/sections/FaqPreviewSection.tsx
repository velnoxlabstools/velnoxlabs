import { SectionWrapper, GlobalContainer } from '@/components/layout';
import { SectionHeading, EmptyState } from '@/components/ui';
import type { HomepageFaqItem } from '@/types/tools';

interface FaqPreviewSectionProps {
  faqs: HomepageFaqItem[];
}

export function FaqPreviewSection({ faqs }: FaqPreviewSectionProps) {
  return (
    <SectionWrapper as="section" aria-labelledby="faq-preview-heading">
      <GlobalContainer maxWidth="lg">
        <div style={{ paddingTop: 'var(--space-12)', paddingBottom: 'var(--space-12)' }}>
          <SectionHeading
            id="faq-preview-heading"
            title="Frequently asked questions"
            description="Quick answers to common questions."
          />
          {faqs.length === 0 ? (
            <EmptyState title="No FAQs" description="FAQ items will appear here." />
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
              {faqs.map((item) => (
                <details
                  key={item.id}
                  style={{
                    border: '1px solid var(--border)',
                    borderRadius: 'var(--radius-md)',
                    padding: 'var(--space-4)',
                    background: 'var(--card)',
                  }}
                >
                  <summary
                    style={{
                      cursor: 'pointer',
                      fontWeight: 'var(--font-weight-semibold)',
                      color: 'var(--foreground)',
                    }}
                  >
                    {item.question}
                  </summary>
                  <p
                    style={{
                      marginTop: 'var(--space-2)',
                      marginBottom: 0,
                      fontSize: 'var(--font-size-sm)',
                      color: 'var(--muted-foreground)',
                      lineHeight: 'var(--line-height-relaxed)',
                    }}
                  >
                    {item.answer}
                  </p>
                </details>
              ))}
            </div>
          )}
        </div>
      </GlobalContainer>
    </SectionWrapper>
  );
}
