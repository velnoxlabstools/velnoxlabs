import type { ReactNode } from 'react';

interface ToolOutputContainerProps {
  children?: ReactNode;
  title?: string;
}

/**
 * Slot for tool output display.
 */
export function ToolOutputContainer({
  children,
  title = 'Output',
}: ToolOutputContainerProps) {
  return (
    <section
      aria-label={title}
      style={{
        padding: 'var(--space-6)',
        borderRadius: 'var(--radius-lg)',
        border: '1px solid var(--border)',
        background: 'var(--muted)',
        minHeight: '8rem',
      }}
    >
      <h2
        style={{
          margin: '0 0 var(--space-4)',
          fontSize: 'var(--font-size-sm)',
          fontWeight: 'var(--font-weight-semibold)',
          textTransform: 'uppercase',
          letterSpacing: 'var(--letter-spacing-wide)',
          color: 'var(--muted-foreground)',
        }}
      >
        {title}
      </h2>
      {children ?? (
        <p style={{ margin: 0, color: 'var(--muted-foreground)', fontSize: 'var(--font-size-sm)' }}>
          Results will appear here.
        </p>
      )}
    </section>
  );
}
