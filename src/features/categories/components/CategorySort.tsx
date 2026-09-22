import type { CategorySortKey } from '@/types/category-page';

interface CategorySortProps {
  active?: CategorySortKey;
}

const OPTIONS: { id: CategorySortKey; label: string }[] = [
  { id: 'order', label: 'Default' },
  { id: 'name', label: 'Name' },
  { id: 'toolCount', label: 'Most tools' },
];

/**
 * Architecture-only sort control.
 */
export function CategorySort({ active = 'order' }: CategorySortProps) {
  return (
    <div
      role="group"
      aria-label="Sort categories"
      style={{ display: 'flex', flexWrap: 'wrap', gap: 'var(--space-2)', alignItems: 'center' }}
    >
      <span style={{ fontSize: 'var(--font-size-sm)', color: 'var(--muted-foreground)' }}>Sort:</span>
      {OPTIONS.map((o) => (
        <span
          key={o.id}
          style={{
            fontSize: 'var(--font-size-sm)',
            fontWeight: o.id === active ? 'var(--font-weight-semibold)' : 'var(--font-weight-normal)',
            color: o.id === active ? 'var(--primary)' : 'var(--muted-foreground)',
          }}
        >
          {o.label}
        </span>
      ))}
    </div>
  );
}
