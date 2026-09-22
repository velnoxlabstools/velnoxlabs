import { SectionWrapper, GlobalContainer } from '@/components/layout';
import { SectionHeading, HomepageGrid, EmptyState } from '@/components/ui';
import { CategoryCard } from '../components';
import type { Category } from '@/types/tools';

interface CategoriesPreviewSectionProps {
  categories: Category[];
}

export function CategoriesPreviewSection({ categories }: CategoriesPreviewSectionProps) {
  return (
    <SectionWrapper as="section" aria-labelledby="categories-preview-heading">
      <GlobalContainer maxWidth="2xl">
        <div style={{ paddingTop: 'var(--space-12)', paddingBottom: 'var(--space-12)' }}>
          <SectionHeading
            id="categories-preview-heading"
            title="Explore categories"
            description="A quick look at the kinds of tools you will find."
          />
          {categories.length === 0 ? (
            <EmptyState title="Preview soon" description="Category previews will render here." />
          ) : (
            <HomepageGrid columns={3}>
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
