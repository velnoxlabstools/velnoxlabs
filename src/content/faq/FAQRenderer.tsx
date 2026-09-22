import type { FAQItem } from '../types';

interface FAQRendererProps {
  items: FAQItem[];
  title?: string;
}

export function FAQRenderer({ items, title = 'FAQ' }: FAQRendererProps) {
  if (!items.length) return null;
  return (
    <section aria-labelledby="content-faq-heading">
      <h2
        id="content-faq-heading"
        style={{
          margin: '0 0 var(--space-4)',
          fontSize: 'var(--font-size-lg)',
          fontWeight: 'var(--font-weight-semibold)',
        }}
      >
        {title}
      </h2>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
        {items.map((item) => (
          <details
            key={item.id}
            style={{
              border: '1px solid var(--border)',
              borderRadius: 'var(--radius-md)',
              padding: 'var(--space-3) var(--space-4)',
              background: 'var(--card)',
            }}
          >
            <summary style={{ cursor: 'pointer', fontWeight: 'var(--font-weight-semibold)', fontSize: 'var(--font-size-sm)' }}>
              {item.question}
            </summary>
            <p style={{ margin: 'var(--space-2) 0 0', fontSize: 'var(--font-size-sm)', color: 'var(--muted-foreground)' }}>
              {item.answer}
            </p>
          </details>
        ))}
      </div>
    </section>
  );
}
