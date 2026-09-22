import type { Tool } from '@/types/tools';
import { EmptyState } from '@/components/ui';
import Link from 'next/link';

interface CategoryToolsPlaceholderProps {
  tools: Tool[];
}

/**
 * Lists tools in a category without building full tool detail pages.
 */
export function CategoryToolsPlaceholder({ tools }: CategoryToolsPlaceholderProps) {
  if (tools.length === 0) {
    return (
      <EmptyState
        title="No tools in this category yet"
        description="Tools will appear here when published."
      />
    );
  }

  return (
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
      {tools.map((tool) => (
        <li key={tool.id}>
          <Link
            href={`/tools/${tool.slug}`}
            style={{
              display: 'block',
              padding: 'var(--space-4)',
              borderRadius: 'var(--radius-md)',
              border: '1px solid var(--border)',
              background: 'var(--card)',
              textDecoration: 'none',
              color: 'var(--foreground)',
            }}
          >
            <span style={{ fontWeight: 'var(--font-weight-semibold)', fontSize: 'var(--font-size-sm)' }}>
              {tool.name}
            </span>
            <span
              style={{
                display: 'block',
                marginTop: 'var(--space-1)',
                fontSize: 'var(--font-size-xs)',
                color: 'var(--muted-foreground)',
              }}
            >
              {tool.description}
            </span>
          </Link>
        </li>
      ))}
    </ul>
  );
}
