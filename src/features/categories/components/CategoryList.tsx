import Link from 'next/link';
import type { Category } from '@/types/tools';
import { CategoryIcon } from './CategoryIcon';
import { EmptyState } from '@/components/ui';

interface CategoryListProps {
  categories: Category[];
}

export function CategoryList({ categories }: CategoryListProps) {
  if (categories.length === 0) {
    return (
      <EmptyState title="No categories" description="No categories match your criteria." />
    );
  }

  return (
    <ul style={{ listStyle: 'none', margin: 0, padding: 0, display: 'flex', flexDirection: 'column', gap: 'var(--space-2)' }}>
      {categories.map((cat) => (
        <li key={cat.id}>
          <Link
            href={`/categories/${cat.slug}`}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 'var(--space-3)',
              padding: 'var(--space-3) var(--space-4)',
              borderRadius: 'var(--radius-md)',
              border: '1px solid var(--border)',
              background: 'var(--card)',
              textDecoration: 'none',
              color: 'var(--foreground)',
            }}
          >
            <CategoryIcon icon={cat.icon} name={cat.name} size="sm" />
            <span style={{ flex: 1, fontWeight: 'var(--font-weight-medium)' }}>{cat.name}</span>
            <span style={{ fontSize: 'var(--font-size-xs)', color: 'var(--muted-foreground)' }}>
              {cat.toolCount}
            </span>
          </Link>
        </li>
      ))}
    </ul>
  );
}
