import { GlobalContainer } from '@/components/layout';
import { CategoryBreadcrumb } from '../components/CategoryBreadcrumb';
import { CategoryIcon } from '../components/CategoryIcon';
import type { Category } from '@/types/tools';

interface CategoryHeroProps {
  category?: Category;
  title?: string;
  description?: string;
  toolCount?: number;
  isIndex?: boolean;
}

export function CategoryHero({
  category,
  title,
  description,
  toolCount,
  isIndex = false,
}: CategoryHeroProps) {
  const heading = title ?? category?.name ?? 'Categories';
  const desc = description ?? category?.description;
  const count = toolCount ?? category?.toolCount;

  const crumbs = isIndex
    ? [{ label: 'Home', href: '/' }, { label: 'Categories' }]
    : [
        { label: 'Home', href: '/' },
        { label: 'Categories', href: '/categories' },
        { label: heading },
      ];

  return (
    <div
      style={{
        borderBottom: '1px solid var(--border)',
        background: 'var(--muted)',
        paddingTop: 'var(--space-8)',
        paddingBottom: 'var(--space-10)',
      }}
    >
      <GlobalContainer maxWidth="2xl">
        <CategoryBreadcrumb items={crumbs} />
        <div
          style={{
            display: 'flex',
            alignItems: 'flex-start',
            gap: 'var(--space-4)',
            marginTop: 'var(--space-6)',
          }}
        >
          {category && <CategoryIcon icon={category.icon} name={category.name} size="lg" />}
          <div>
            <h1
              style={{
                margin: 0,
                fontSize: 'clamp(1.75rem, 4vw, 2.5rem)',
                fontWeight: 'var(--font-weight-bold)',
                lineHeight: 'var(--line-height-tight)',
                color: 'var(--foreground)',
              }}
            >
              {heading}
            </h1>
            {desc && (
              <p
                style={{
                  marginTop: 'var(--space-2)',
                  marginBottom: 0,
                  fontSize: 'var(--font-size-lg)',
                  color: 'var(--muted-foreground)',
                  maxWidth: '40rem',
                  lineHeight: 'var(--line-height-relaxed)',
                }}
              >
                {desc}
              </p>
            )}
            {typeof count === 'number' && (
              <p
                style={{
                  marginTop: 'var(--space-3)',
                  marginBottom: 0,
                  fontSize: 'var(--font-size-sm)',
                  color: 'var(--muted-foreground)',
                }}
              >
                {count} {count === 1 ? 'tool' : 'tools'}
              </p>
            )}
          </div>
        </div>
      </GlobalContainer>
    </div>
  );
}
