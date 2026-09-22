import Link from 'next/link';
import type { ToolCollection } from '@/types/tools';

interface CollectionCardProps {
  collection: ToolCollection;
}

export function CollectionCard({ collection }: CollectionCardProps) {
  return (
    <Link
      href={`/collections/${collection.slug}`}
      style={{
        display: 'block',
        padding: 'var(--space-6)',
        borderRadius: 'var(--radius-lg)',
        border: '1px solid var(--border)',
        background: 'var(--card)',
        textDecoration: 'none',
        color: 'var(--card-foreground)',
      }}
    >
      <span
        style={{
          display: 'block',
          fontWeight: 'var(--font-weight-semibold)',
          fontSize: 'var(--font-size-lg)',
        }}
      >
        {collection.name}
      </span>
      <span
        style={{
          display: 'block',
          marginTop: 'var(--space-2)',
          fontSize: 'var(--font-size-sm)',
          color: 'var(--muted-foreground)',
          lineHeight: 'var(--line-height-relaxed)',
        }}
      >
        {collection.description}
      </span>
      <span
        style={{
          display: 'block',
          marginTop: 'var(--space-3)',
          fontSize: 'var(--font-size-xs)',
          color: 'var(--muted-foreground)',
        }}
      >
        {collection.toolIds?.length ?? 0} tools
      </span>
    </Link>
  );
}
