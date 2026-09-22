import type { ToolConfig } from '@/types/tool-engine';

interface ToolDescriptionSectionProps {
  tool: ToolConfig;
}

export function ToolDescriptionSection({ tool }: ToolDescriptionSectionProps) {
  return (
    <section aria-labelledby="tool-desc-heading">
      <h2
        id="tool-desc-heading"
        style={{
          margin: '0 0 var(--space-3)',
          fontSize: 'var(--font-size-lg)',
          fontWeight: 'var(--font-weight-semibold)',
        }}
      >
        Description
      </h2>
      <p
        style={{
          margin: 0,
          fontSize: 'var(--font-size-base)',
          lineHeight: 'var(--line-height-relaxed)',
          color: 'var(--muted-foreground)',
        }}
      >
        {tool.description}
      </p>
    </section>
  );
}
