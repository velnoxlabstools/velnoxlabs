import Link from 'next/link';
import type { Category } from '@/types/tools';

interface RelatedCategoriesSectionProps {
  categories: Category[];
}

export function RelatedCategoriesSection({ categories }: RelatedCategoriesSectionProps) {
  if (!categories.length) return null;

  return (
    <section aria-labelledby="related-cats-heading">
      <h2
        id="related-cats-heading"
        style={{
          margin: '0 0 var(--space-4)',
          fontSize: 'var(--font-size-lg)',
          fontWeight: 'var(--font-weight-semibold)',
        }}
      >
        Related categories
      </h2>
      <ul
        style={{
          listStyle: 'none',
          margin: 0,
          padding: 0,
          display: 'flex',
          flexWrap: 'wrap',
          gap: 'var(--space-2)',
        }}
      >
        {categories.map((c) => (
          <li key={c.id}>
            <Link
              href={`/categories/${c.slug}`}
              style={{
                display: 'inline-flex',
                padding: 'var(--space-2) var(--space-3)',
                borderRadius: 'var(--radius-full)',
                border: '1px solid var(--border)',
                textDecoration: 'none',
                color: 'var(--foreground)',
                fontSize: 'var(--font-size-sm)',
              }}
            >
              {c.name}
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}
