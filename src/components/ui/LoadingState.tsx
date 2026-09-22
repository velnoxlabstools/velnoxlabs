interface LoadingStateProps {
  label?: string;
}

export function LoadingState({ label = 'Loading' }: LoadingStateProps) {
  return (
    <div
      role="status"
      aria-live="polite"
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 'var(--space-16)',
        gap: 'var(--space-3)',
      }}
    >
      <span
        aria-hidden
        style={{
          width: '1.5rem',
          height: '1.5rem',
          border: '2px solid var(--border, var(--color-neutral-200))',
          borderTopColor: 'var(--primary, var(--color-brand-600))',
          borderRadius: '9999px',
          animation: 'spin 0.7s linear infinite',
        }}
      />
      <span className="sr-only">{label}</span>
    </div>
  );
}
