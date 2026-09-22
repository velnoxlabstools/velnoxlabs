import Link from 'next/link';
import type { SearchHit, SearchResult } from '@/types/search';
import { EmptyState, LoadingState, ErrorState } from '@/components/ui';

interface SearchResultsProps {
  result: SearchResult | null;
  loading?: boolean;
  error?: boolean;
}

function HitCard({ hit }: { hit: SearchHit }) {
  return (
    <Link
      href={hit.href}
      style={{
        display: 'block',
        padding: 'var(--space-4)',
        borderRadius: 'var(--radius-md)',
        border: '1px solid var(--border)',
        background: 'var(--card)',
        textDecoration: 'none',
        color: 'var(--foreground)',
      }}
    >
      <div style={{ display: 'flex', gap: 'var(--space-2)', alignItems: 'center' }}>
        <span
          style={{
            fontSize: 'var(--font-size-xs)',
            textTransform: 'uppercase',
            color: 'var(--muted-foreground)',
            letterSpacing: 'var(--letter-spacing-wide)',
          }}
        >
          {hit.type}
        </span>
      </div>
      <span
        style={{
          display: 'block',
          marginTop: 'var(--space-1)',
          fontWeight: 'var(--font-weight-semibold)',
          fontSize: 'var(--font-size-base)',
        }}
      >
        {hit.title}
      </span>
      <span
        style={{
          display: 'block',
          marginTop: 'var(--space-1)',
          fontSize: 'var(--font-size-sm)',
          color: 'var(--muted-foreground)',
        }}
      >
        {hit.description}
      </span>
    </Link>
  );
}

export function SearchResults({ result, loading, error }: SearchResultsProps) {
  if (loading) return <LoadingState label="Searching" />;
  if (error) return <ErrorState title="Search failed" description="Please try again." />;
  if (!result) return null;
  if (!result.query) {
    return <EmptyState title="Search VelnoxLabs" description="Find tools, categories, and pages." />;
  }
  if (result.total === 0) {
    return (
      <EmptyState
        title="No results"
        description={`Nothing matched “${result.query}”. Try another term.`}
      />
    );
  }

  return (
    <div>
      <p
        style={{
          marginBottom: 'var(--space-4)',
          fontSize: 'var(--font-size-sm)',
          color: 'var(--muted-foreground)',
        }}
      >
        {result.total} result{result.total === 1 ? '' : 's'} for “{result.query}”
        {result.tookMs >= 0 ? ` · ${result.tookMs}ms` : ''}
      </p>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
        {result.hits.map((hit) => (
          <HitCard key={hit.id} hit={hit} />
        ))}
      </div>
    </div>
  );
}
