import Link from 'next/link';
import type { Category } from '@/types/tools';
import { CategoryIcon } from './CategoryIcon';

interface CategoryCardProps {
  category: Category;
}

export function CategoryCard({ category }: CategoryCardProps) {
  return (
    <Link
      href={`/categories/${category.slug}`}
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: 'var(--space-3)',
        padding: 'var(--space-5)',
        borderRadius: 'var(--radius-lg)',
        border: '1px solid var(--border)',
        background: 'var(--card)',
        color: 'var(--card-foreground)',
        textDecoration: 'none',
        height: '100%',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }}>
        <CategoryIcon icon={category.icon} name={category.name} />
        <span style={{ fontWeight: 'var(--font-weight-semibold)', fontSize: 'var(--font-size-base)' }}>
          {category.name}
        </span>
      </div>
      <p
        style={{
          margin: 0,
          fontSize: 'var(--font-size-sm)',
          color: 'var(--muted-foreground)',
          lineHeight: 'var(--line-height-relaxed)',
          flex: 1,
        }}
      >
        {category.description}
      </p>
      <span style={{ fontSize: 'var(--font-size-xs)', color: 'var(--muted-foreground)' }}>
        {category.toolCount} {category.toolCount === 1 ? 'tool' : 'tools'}
      </span>
    </Link>
  );
}
