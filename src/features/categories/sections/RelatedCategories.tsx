import { SectionHeading } from '@/components/ui';
import { CategoryGrid } from '../components/CategoryGrid';
import type { Category } from '@/types/tools';

interface RelatedCategoriesProps {
  categories: Category[];
}

export function RelatedCategories({ categories }: RelatedCategoriesProps) {
  if (categories.length === 0) return null;

  return (
    <section aria-labelledby="related-categories-heading" style={{ marginTop: 'var(--space-12)' }}>
      <SectionHeading id="related-categories-heading" title="Related categories" align="left" />
      <CategoryGrid categories={categories} columns={4} />
    </section>
  );
}
