import type { Category } from '@/types/tools';
import { CategoryCard } from './CategoryCard';
import { EmptyState } from '@/components/ui';

interface CategoryGridProps {
  categories: Category[];
  columns?: 2 | 3 | 4;
}

export function CategoryGrid({ categories, columns = 3 }: CategoryGridProps) {
  if (categories.length === 0) {
    return (
      <EmptyState
        title="No categories found"
        description="Try a different filter or check back later."
      />
    );
  }

  const minWidth = columns === 2 ? '16rem' : columns === 4 ? '12rem' : '14rem';

  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: `repeat(auto-fill, minmax(${minWidth}, 1fr))`,
        gap: 'var(--space-6)',
        width: '100%',
      }}
    >
      {categories.map((cat) => (
        <CategoryCard key={cat.id} category={cat} />
      ))}
    </div>
  );
}
