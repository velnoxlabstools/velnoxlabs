import Link from 'next/link';
import type { ToolConfig } from '@/types/tool-engine';
import type { Category } from '@/types/tools';

interface ToolBreadcrumbProps {
  tool: ToolConfig;
  category: Category | null;
}

export function ToolBreadcrumb({ tool, category }: ToolBreadcrumbProps) {
  const items = [
    { label: 'Home', href: '/' },
    { label: 'Tools', href: '/tools' },
    ...(category
      ? [{ label: category.name, href: `/categories/${category.slug}` }]
      : []),
    { label: tool.name },
  ];

  return (
    <nav aria-label="Breadcrumb">
      <ol
        style={{
          listStyle: 'none',
          margin: 0,
          padding: 0,
          display: 'flex',
          flexWrap: 'wrap',
          gap: 'var(--space-2)',
          fontSize: 'var(--font-size-sm)',
          color: 'var(--muted-foreground)',
        }}
      >
        {items.map((item, i) => (
          <li
            key={`${item.label}-${i}`}
            style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}
          >
            {i > 0 && <span aria-hidden="true">/</span>}
            {'href' in item && item.href ? (
              <Link href={item.href} style={{ color: 'var(--muted-foreground)', textDecoration: 'none' }}>
                {item.label}
              </Link>
            ) : (
              <span aria-current="page" style={{ color: 'var(--foreground)' }}>
                {item.label}
              </span>
            )}
          </li>
        ))}
      </ol>
    </nav>
  );
}
