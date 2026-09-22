import Link from 'next/link';
import { GlobalContainer } from '@/components/layout';
import { listTools } from '@/services/tools';
import { SectionHeading, EmptyState } from '@/components/ui';
import { CategoryBreadcrumb } from '@/features/categories/components/CategoryBreadcrumb';

export function ToolsIndexPage() {
  const result = listTools({ sort: 'usage', pageSize: 48 });

  return (
    <GlobalContainer maxWidth="2xl">
      <div style={{ paddingTop: 'var(--space-8)', paddingBottom: 'var(--space-16)' }}>
        <CategoryBreadcrumb
          items={[
            { label: 'Home', href: '/' },
            { label: 'Tools' },
          ]}
        />
        <div style={{ marginTop: 'var(--space-6)' }}>
          <SectionHeading
            align="left"
            title="All tools"
            description="Every published tool from the registry, ranked by usage."
          />
        </div>
        {result.items.length === 0 ? (
          <EmptyState title="No tools yet" description="Published tools will appear here." />
        ) : (
          <ul
            style={{
              listStyle: 'none',
              margin: 0,
              padding: 0,
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(14rem, 1fr))',
              gap: 'var(--space-4)',
            }}
          >
            {result.items.map((tool) => (
              <li key={tool.id}>
                <Link
                  href={`/tools/${tool.slug}`}
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 'var(--space-2)',
                    padding: 'var(--space-5)',
                    borderRadius: 'var(--radius-lg)',
                    border: '1px solid var(--border)',
                    background: 'var(--card)',
                    textDecoration: 'none',
                    color: 'var(--foreground)',
                    height: '100%',
                  }}
                >
                  <span style={{ fontWeight: 'var(--font-weight-semibold)' }}>{tool.name}</span>
                  <span
                    style={{
                      fontSize: 'var(--font-size-sm)',
                      color: 'var(--muted-foreground)',
                      lineHeight: 'var(--line-height-relaxed)',
                    }}
                  >
                    {tool.description}
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </div>
    </GlobalContainer>
  );
}
