import type { ToolConfig } from '@/types/tool-engine';

interface ToolStatusBadgeProps {
  tool: ToolConfig;
}

export function ToolStatusBadge({ tool }: ToolStatusBadgeProps) {
  const badges: string[] = [];
  if (tool.isNew) badges.push('New');
  if (tool.featured) badges.push('Featured');
  if (tool.trending) badges.push('Trending');
  if (tool.popular) badges.push('Popular');
  if (tool.status === 'deprecated') badges.push('Deprecated');

  if (!badges.length) return null;

  return (
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 'var(--space-2)' }}>
      {badges.map((b) => (
        <span
          key={b}
          style={{
            fontSize: 'var(--font-size-xs)',
            fontWeight: 'var(--font-weight-semibold)',
            padding: '0 var(--space-2)',
            borderRadius: 'var(--radius-full)',
            background: b === 'Deprecated' ? 'var(--destructive)' : 'var(--accent)',
            color: b === 'Deprecated' ? 'var(--destructive-foreground)' : 'var(--accent-foreground)',
          }}
        >
          {b}
        </span>
      ))}
    </div>
  );
}
