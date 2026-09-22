import type { CategoryFilterKey } from '@/types/category-page';

/**
 * Architecture-only filters UI.
 * Wired to URL search params in a later phase if needed.
 */
interface CategoryFiltersProps {
  active?: CategoryFilterKey;
}

const FILTERS: { id: CategoryFilterKey; label: string }[] = [
  { id: 'all', label: 'All' },
  { id: 'featured', label: 'Featured' },
  { id: 'popular', label: 'Popular' },
];

export function CategoryFilters({ active = 'all' }: CategoryFiltersProps) {
  return (
    <div
      role="group"
      aria-label="Filter categories"
      style={{
        display: 'flex',
        flexWrap: 'wrap',
        gap: 'var(--space-2)',
      }}
    >
      {FILTERS.map((f) => {
        const isActive = f.id === active;
        return (
          <span
            key={f.id}
            style={{
              padding: 'var(--space-1) var(--space-3)',
              borderRadius: 'var(--radius-full)',
              border: '1px solid var(--border)',
              background: isActive ? 'var(--primary)' : 'var(--background)',
              color: isActive ? 'var(--primary-foreground)' : 'var(--foreground)',
              fontSize: 'var(--font-size-sm)',
              fontWeight: isActive ? 'var(--font-weight-semibold)' : 'var(--font-weight-medium)',
            }}
          >
            {f.label}
          </span>
        );
      })}
    </div>
  );
}
