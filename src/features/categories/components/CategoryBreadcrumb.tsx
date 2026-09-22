import Link from 'next/link';

interface Crumb {
  label: string;
  href?: string;
}

interface CategoryBreadcrumbProps {
  items: Crumb[];
}

export function CategoryBreadcrumb({ items }: CategoryBreadcrumbProps) {
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
          <li key={item.label} style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
            {i > 0 && <span aria-hidden="true">/</span>}
            {item.href ? (
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
