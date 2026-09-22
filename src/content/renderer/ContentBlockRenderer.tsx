import type { ContentBlock } from '../types';
import { FAQRenderer } from '../faq';
import { faqManager } from '../faq';
import Link from 'next/link';

interface ContentBlockRendererProps {
  block: ContentBlock;
}

export function ContentBlockRenderer({ block }: ContentBlockRendererProps) {
  if (block.enabled === false) return null;

  const title = block.title;

  if (block.type === 'faqs' && block.faqs?.length) {
    return <FAQRenderer items={faqManager.fromBlocks(block.faqs)} title={title ?? 'FAQ'} />;
  }

  if (block.steps?.length) {
    return (
      <section aria-label={title ?? 'Steps'}>
        {title && (
          <h2 style={{ margin: '0 0 var(--space-4)', fontSize: 'var(--font-size-lg)', fontWeight: 'var(--font-weight-semibold)' }}>
            {title}
          </h2>
        )}
        <ol style={{ margin: 0, padding: 0, listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
          {block.steps.map((s, i) => (
            <li key={s.title} style={{ display: 'flex', gap: 'var(--space-3)' }}>
              <span aria-hidden="true" style={{
                flexShrink: 0, width: '1.75rem', height: '1.75rem', borderRadius: 'var(--radius-full)',
                background: 'var(--primary)', color: 'var(--primary-foreground)', display: 'flex',
                alignItems: 'center', justifyContent: 'center', fontSize: 'var(--font-size-xs)', fontWeight: 'var(--font-weight-bold)',
              }}>{i + 1}</span>
              <div>
                <div style={{ fontWeight: 'var(--font-weight-semibold)', fontSize: 'var(--font-size-sm)' }}>{s.title}</div>
                <p style={{ margin: 'var(--space-1) 0 0', fontSize: 'var(--font-size-sm)', color: 'var(--muted-foreground)' }}>{s.body}</p>
              </div>
            </li>
          ))}
        </ol>
      </section>
    );
  }

  if (block.items?.length) {
    return (
      <section aria-label={title ?? block.type}>
        {title && (
          <h2 style={{ margin: '0 0 var(--space-3)', fontSize: 'var(--font-size-lg)', fontWeight: 'var(--font-weight-semibold)' }}>
            {title}
          </h2>
        )}
        <ul style={{ margin: 0, paddingLeft: 'var(--space-5)', color: 'var(--muted-foreground)', fontSize: 'var(--font-size-sm)' }}>
          {block.items.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
      </section>
    );
  }

  if (block.links?.length) {
    return (
      <section aria-label={title ?? 'Links'}>
        {title && (
          <h2 style={{ margin: '0 0 var(--space-3)', fontSize: 'var(--font-size-lg)', fontWeight: 'var(--font-weight-semibold)' }}>
            {title}
          </h2>
        )}
        <ul style={{ listStyle: 'none', margin: 0, padding: 0, display: 'flex', flexWrap: 'wrap', gap: 'var(--space-2)' }}>
          {block.links.map((l) => (
            <li key={l.href}>
              <Link href={l.href} style={{
                display: 'inline-flex', padding: 'var(--space-2) var(--space-3)', borderRadius: 'var(--radius-full)',
                border: '1px solid var(--border)', textDecoration: 'none', color: 'var(--foreground)', fontSize: 'var(--font-size-sm)',
              }}>
                {l.label}
              </Link>
            </li>
          ))}
        </ul>
      </section>
    );
  }

  if (block.body) {
    return (
      <section aria-label={title ?? block.type}>
        {title && (
          <h2 style={{ margin: '0 0 var(--space-3)', fontSize: 'var(--font-size-lg)', fontWeight: 'var(--font-weight-semibold)' }}>
            {title}
          </h2>
        )}
        <p style={{ margin: 0, fontSize: 'var(--font-size-sm)', lineHeight: 'var(--line-height-relaxed)', color: 'var(--muted-foreground)' }}>
          {block.body}
        </p>
      </section>
    );
  }

  return null;
}
