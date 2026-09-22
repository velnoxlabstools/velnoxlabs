import { GlobalContainer } from '@/components/layout';
import { search } from '@/services/search';
import { SearchResults } from './components/SearchResults';
import { CategoryBreadcrumb } from '@/features/categories/components/CategoryBreadcrumb';

interface SearchPageProps {
  query?: string;
}

export function SearchPage({ query = '' }: SearchPageProps) {
  const result = query ? search({ query, limit: 30 }) : null;

  return (
    <GlobalContainer maxWidth="lg">
      <div style={{ paddingTop: 'var(--space-8)', paddingBottom: 'var(--space-16)' }}>
        <CategoryBreadcrumb
          items={[
            { label: 'Home', href: '/' },
            { label: 'Search' },
          ]}
        />
        <h1
          style={{
            marginTop: 'var(--space-6)',
            marginBottom: 'var(--space-6)',
            fontSize: 'var(--font-size-3xl)',
            fontWeight: 'var(--font-weight-bold)',
          }}
        >
          Search
        </h1>
        <form action="/search" method="get" role="search" style={{ marginBottom: 'var(--space-8)' }}>
          <label htmlFor="q" className="sr-only">
            Search query
          </label>
          <div style={{ display: 'flex', gap: 'var(--space-2)', flexWrap: 'wrap' }}>
            <input
              id="q"
              name="q"
              type="search"
              defaultValue={query}
              placeholder="Search tools, categories…"
              style={{
                flex: '1 1 16rem',
                padding: 'var(--space-3) var(--space-4)',
                borderRadius: 'var(--radius-md)',
                border: '1px solid var(--border)',
                background: 'var(--background)',
                color: 'var(--foreground)',
                fontSize: 'var(--font-size-base)',
              }}
            />
            <button
              type="submit"
              style={{
                padding: 'var(--space-3) var(--space-5)',
                borderRadius: 'var(--radius-md)',
                border: 'none',
                background: 'var(--primary)',
                color: 'var(--primary-foreground)',
                fontWeight: 'var(--font-weight-semibold)',
                cursor: 'pointer',
              }}
            >
              Search
            </button>
          </div>
        </form>
        <SearchResults result={result} />
      </div>
    </GlobalContainer>
  );
}
