import { SectionWrapper, GlobalContainer } from '@/components/layout';
import { SectionHeading, HomepageGrid, EmptyState } from '@/components/ui';
import { CategoryCard } from '../components';
import type { Category } from '@/types/tools';

interface PopularCategoriesSectionProps {
  categories: Category[];
}

export function PopularCategoriesSection({ categories }: PopularCategoriesSectionProps) {
  return (
    <SectionWrapper as="section" aria-labelledby="popular-categories-heading">
      <GlobalContainer maxWidth="2xl">
        <div style={{ paddingTop: 'var(--space-12)', paddingBottom: 'var(--space-12)' }}>
          <SectionHeading
            id="popular-categories-heading"
            title="Popular categories"
            description="Browse tools by the tasks people do every day."
          />
          {categories.length === 0 ? (
            <EmptyState title="Categories coming soon" description="Category cards will load here." />
          ) : (
            <HomepageGrid columns={4}>
              {categories.map((cat) => (
                <CategoryCard key={cat.id} category={cat} />
              ))}
            </HomepageGrid>
          )}
        </div>
      </GlobalContainer>
    </SectionWrapper>
  );
}
