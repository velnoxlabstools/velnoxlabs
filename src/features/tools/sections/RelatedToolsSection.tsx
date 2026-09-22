import Link from 'next/link';
import type { ToolConfig } from '@/types/tool-engine';

interface RelatedToolsSectionProps {
  tools: ToolConfig[];
}

export function RelatedToolsSection({ tools }: RelatedToolsSectionProps) {
  if (!tools.length) {
    return null;
  }

  return (
    <section aria-labelledby="related-tools-heading">
      <h2
        id="related-tools-heading"
        style={{
          margin: '0 0 var(--space-4)',
          fontSize: 'var(--font-size-lg)',
          fontWeight: 'var(--font-weight-semibold)',
        }}
      >
        Related tools
      </h2>
      <ul
        style={{
          listStyle: 'none',
          margin: 0,
          padding: 0,
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(12rem, 1fr))',
          gap: 'var(--space-3)',
        }}
      >
        {tools.map((t) => (
          <li key={t.id}>
            <Link
              href={`/tools/${t.slug}`}
              style={{
                display: 'block',
                padding: 'var(--space-4)',
                borderRadius: 'var(--radius-md)',
                border: '1px solid var(--border)',
                background: 'var(--card)',
                textDecoration: 'none',
                color: 'var(--foreground)',
                fontSize: 'var(--font-size-sm)',
                fontWeight: 'var(--font-weight-medium)',
              }}
            >
              {t.name}
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}
