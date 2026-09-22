import { GlobalContainer } from '@/components/layout';
import { listCategories, findAllCategories } from '@/services/categories';
import { categoryPageConfig } from './config/category.config';
import { CategoryHero } from './sections/CategoryHero';
import { CategoryGrid } from './components/CategoryGrid';
import { CategoryFilters } from './components/CategoryFilters';
import { CategorySort } from './components/CategorySort';
import { CategoryPagination } from './components/CategoryPagination';
import { CategorySidebar } from './components/CategorySidebar';
import { LoadingState, ErrorState } from '@/components/ui';

export function CategoryIndexPage() {
  try {
    const result = listCategories({
      sort: categoryPageConfig.defaultSort,
      pageSize: categoryPageConfig.pageSize,
    });
    const all = findAllCategories();

    return (
      <>
        <CategoryHero
          isIndex
          title="Categories"
          description="Browse tools by category. Every category is generated from the live registry."
          toolCount={result.total}
        />
        <GlobalContainer maxWidth="2xl">
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: categoryPageConfig.showSidebar
                ? 'minmax(0, 1fr) minmax(12rem, 16rem)'
                : '1fr',
              gap: 'var(--space-10)',
              paddingTop: 'var(--space-10)',
              paddingBottom: 'var(--space-16)',
            }}
            className="category-index-layout"
          >
            <div>
              {categoryPageConfig.showFilters && (
                <div
                  style={{
                    display: 'flex',
                    flexWrap: 'wrap',
                    justifyContent: 'space-between',
                    gap: 'var(--space-4)',
                    marginBottom: 'var(--space-6)',
                  }}
                >
                  <CategoryFilters active="all" />
                  <CategorySort active={categoryPageConfig.defaultSort} />
                </div>
              )}
              <CategoryGrid categories={result.items} columns={3} />
              <CategoryPagination page={result.page} totalPages={result.totalPages} />
            </div>
            {categoryPageConfig.showSidebar && (
              <div className="category-sidebar-col">
                <CategorySidebar categories={all} />
              </div>
            )}
          </div>
        </GlobalContainer>
      </>
    );
  } catch {
    return <ErrorState title="Could not load categories" />;
  }
}

export function CategoryIndexLoading() {
  return <LoadingState label="Loading categories" />;
}
