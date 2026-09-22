import type { Category } from '@/types/tools';
import { CategoryList } from './CategoryList';

interface CategorySidebarProps {
  categories: Category[];
  title?: string;
}

/**
 * Sidebar architecture for category index / detail.
 */
export function CategorySidebar({
  categories,
  title = 'All categories',
}: CategorySidebarProps) {
  return (
    <aside
      aria-label="Category sidebar"
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: 'var(--space-4)',
      }}
    >
      <h2
        style={{
          margin: 0,
          fontSize: 'var(--font-size-sm)',
          fontWeight: 'var(--font-weight-semibold)',
          textTransform: 'uppercase',
          letterSpacing: 'var(--letter-spacing-wide)',
          color: 'var(--muted-foreground)',
        }}
      >
        {title}
      </h2>
      <CategoryList categories={categories} />
    </aside>
  );
}
