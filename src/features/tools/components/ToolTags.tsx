import type { ToolConfig } from '@/types/tool-engine';

interface ToolTagsProps {
  tool: ToolConfig;
}

export function ToolTags({ tool }: ToolTagsProps) {
  if (!tool.tags.length) return null;

  return (
    <ul
      aria-label="Tags"
      style={{
        listStyle: 'none',
        margin: 0,
        padding: 0,
        display: 'flex',
        flexWrap: 'wrap',
        gap: 'var(--space-2)',
      }}
    >
      {tool.tags.map((tag) => (
        <li
          key={tag}
          style={{
            fontSize: 'var(--font-size-xs)',
            padding: 'var(--space-1) var(--space-2)',
            borderRadius: 'var(--radius-full)',
            background: 'var(--muted)',
            color: 'var(--muted-foreground)',
          }}
        >
          {tag}
        </li>
      ))}
    </ul>
  );
}
