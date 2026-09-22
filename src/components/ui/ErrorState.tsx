interface ErrorStateProps {
  title?: string;
  description?: string;
}

export function ErrorState({
  title = 'Unable to load content',
  description = 'Please try again later.',
}: ErrorStateProps) {
  return (
    <div
      role="alert"
      style={{
        textAlign: 'center',
        padding: 'var(--space-12) var(--space-4)',
        border: '1px solid var(--color-error-100)',
        background: 'var(--color-error-50)',
        borderRadius: 'var(--radius-xl)',
      }}
    >
      <p
        style={{
          margin: 0,
          fontSize: 'var(--font-size-lg)',
          fontWeight: 600,
          color: 'var(--color-error-700)',
        }}
      >
        {title}
      </p>
      <p
        style={{
          marginTop: 'var(--space-2)',
          marginBottom: 0,
          fontSize: 'var(--font-size-sm)',
          color: 'var(--muted-foreground)',
        }}
      >
        {description}
      </p>
    </div>
  );
}
