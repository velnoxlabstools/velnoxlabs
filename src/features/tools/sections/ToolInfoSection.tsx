import type { ToolConfig } from '@/types/tool-engine';
import type { Category } from '@/types/tools';

interface ToolInfoSectionProps {
  tool: ToolConfig;
  category: Category | null;
}

export function ToolInfoSection({ tool, category }: ToolInfoSectionProps) {
  const rows = [
    { label: 'Category', value: category?.name ?? '—' },
    { label: 'Status', value: tool.status },
    { label: 'Updated', value: new Date(tool.updatedAt).toLocaleDateString() },
    ...(tool.version
      ? [{ label: 'Version', value: tool.version.version }]
      : []),
  ];

  return (
    <section aria-labelledby="tool-info-heading">
      <h2
        id="tool-info-heading"
        style={{
          margin: '0 0 var(--space-4)',
          fontSize: 'var(--font-size-lg)',
          fontWeight: 'var(--font-weight-semibold)',
        }}
      >
        About this tool
      </h2>
      <dl
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(10rem, 1fr))',
          gap: 'var(--space-4)',
          margin: 0,
        }}
      >
        {rows.map((r) => (
          <div key={r.label}>
            <dt
              style={{
                margin: 0,
                fontSize: 'var(--font-size-xs)',
                color: 'var(--muted-foreground)',
                textTransform: 'uppercase',
                letterSpacing: 'var(--letter-spacing-wide)',
              }}
            >
              {r.label}
            </dt>
            <dd
              style={{
                margin: 'var(--space-1) 0 0',
                fontSize: 'var(--font-size-sm)',
                fontWeight: 'var(--font-weight-medium)',
                textTransform: 'capitalize',
              }}
            >
              {r.value}
            </dd>
          </div>
        ))}
      </dl>
    </section>
  );
}
