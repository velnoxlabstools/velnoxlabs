import type { ReactNode } from 'react';

interface ToolInterfaceContainerProps {
  children?: ReactNode;
  title?: string;
}

/**
 * Slot where tool-specific input UI mounts (future tool modules).
 */
export function ToolInterfaceContainer({
  children,
  title = 'Input',
}: ToolInterfaceContainerProps) {
  return (
    <section
      aria-label={title}
      style={{
        padding: 'var(--space-6)',
        borderRadius: 'var(--radius-lg)',
        border: '1px solid var(--border)',
        background: 'var(--card)',
        minHeight: '12rem',
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
          Tool interface loads here when this tool module is registered.
        </p>
      )}
    </section>
  );
}
