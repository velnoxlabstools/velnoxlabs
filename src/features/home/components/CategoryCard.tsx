import { Link } from '@/i18n/navigation';
import type { Category } from '@/types/tools';

interface CategoryCardProps {
  category: Category & { toolCount?: number };
}

export function CategoryCard({ category }: CategoryCardProps) {
  return (
    <Link
      href={`/categories/${category.slug}`}
      className="ui-card"
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: 'var(--space-2)',
        padding: 'var(--space-5)',
        background: 'var(--bg-card)',
        border: '1px solid var(--border-color)',
        borderRadius: 'var(--radius-xl)',
        textDecoration: 'none',
        color: 'inherit',
        height: '100%',
      }}
    >
      <h3
        style={{
          margin: 0,
          fontSize: 'var(--font-size-base)',
          fontWeight: 600,
          letterSpacing: '-0.01em',
          color: 'var(--text-main)',
        }}
      >
        {category.name}
      </h3>
      {category.description ? (
        <p
          style={{
            margin: 0,
            fontSize: 'var(--font-size-sm)',
            lineHeight: 1.5,
            color: 'var(--text-muted)',
            display: '-webkit-box',
            WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical',
            overflow: 'hidden',
          }}
        >
          {category.description}
        </p>
      ) : null}
      <span
        style={{
          fontSize: 'var(--font-size-xs)',
          color: 'var(--text-muted)',
          marginTop: 'var(--space-2)',
        }}
      >
        {category.toolCount ?? 0} tools
      </span>
    </Link>
  );
}
