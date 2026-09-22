import { notFound } from 'next/navigation';
import { GlobalContainer } from '@/components/layout';
import { getCategoryDetail } from '@/services/categories';
import { CategoryHero } from './sections/CategoryHero';
import { CategoryStats } from './sections/CategoryStats';
import { CategoryToolsPlaceholder } from './sections/CategoryToolsPlaceholder';
import { RelatedCategories } from './sections/RelatedCategories';
import { ErrorState } from '@/components/ui';

interface CategoryDetailPageProps {
  slug: string;
}

export function CategoryDetailPage({ slug }: CategoryDetailPageProps) {
  try {
    const detail = getCategoryDetail(slug);
    if (!detail) notFound();

    const { category, tools, related, stats } = detail;

    return (
      <>
        <CategoryHero category={category} toolCount={stats.toolCount} />
        <GlobalContainer maxWidth="2xl">
          <div style={{ paddingTop: 'var(--space-10)', paddingBottom: 'var(--space-16)' }}>
            <CategoryStats
              toolCount={stats.toolCount}
              featuredToolCount={stats.featuredToolCount}
            />
            <h2
              style={{
                marginTop: 'var(--space-10)',
                marginBottom: 'var(--space-6)',
                fontSize: 'var(--font-size-xl)',
                fontWeight: 'var(--font-weight-semibold)',
              }}
            >
              Tools in {category.name}
            </h2>
            <CategoryToolsPlaceholder tools={tools} />
            <RelatedCategories categories={related} />
          </div>
        </GlobalContainer>
      </>
    );
  } catch {
    return <ErrorState title="Could not load category" />;
  }
}
