import Link from 'next/link';
import type { Tool } from '@/types/tools';
import { Badge } from '@/components/ui/Badge';

interface ToolCardProps {
  tool: Tool;
}

export function ToolCard({ tool }: ToolCardProps) {
  const href = `/tools/${tool.slug}`;
  return (
    <Link
      href={href}
      className="ui-card"
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: 'var(--space-3)',
        padding: 'var(--space-5)',
        background: 'var(--card, var(--color-neutral-0))',
        border: '1px solid var(--border, var(--color-neutral-200))',
        borderRadius: 'var(--radius-xl)',
        textDecoration: 'none',
        color: 'inherit',
        height: '100%',
        minHeight: '9rem',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 'var(--space-2)' }}>
        <h3
          style={{
            margin: 0,
            fontSize: 'var(--font-size-base)',
            fontWeight: 600,
            letterSpacing: '-0.01em',
            color: 'var(--foreground)',
            lineHeight: 1.35,
          }}
        >
          {tool.name}
        </h3>
        {tool.featured ? <Badge variant="brand">Featured</Badge> : null}
        {!tool.featured && tool.isNew ? <Badge variant="success">New</Badge> : null}
      </div>
      <p
        style={{
          margin: 0,
          flex: 1,
          fontSize: 'var(--font-size-sm)',
          lineHeight: 1.55,
          color: 'var(--muted-foreground)',
          display: '-webkit-box',
          WebkitLineClamp: 2,
          WebkitBoxOrient: 'vertical',
          overflow: 'hidden',
        }}
      >
        {tool.description}
      </p>
      <span
        style={{
          fontSize: 'var(--font-size-xs)',
          fontWeight: 500,
          color: 'var(--color-brand-600)',
          marginTop: 'auto',
        }}
      >
        Open tool →
      </span>
    </Link>
  );
}
