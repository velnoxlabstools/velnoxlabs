export default function GlobalLoading() {
  return (
    <div
      role="status"
      aria-live="polite"
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '40vh',
        padding: 'var(--space-8)',
      }}
    >
      <span
        style={{
          width: 'var(--icon-lg)',
          height: 'var(--icon-lg)',
          border: '2px solid var(--border)',
          borderTopColor: 'var(--primary)',
          borderRadius: 'var(--radius-full)',
          animation: 'spin 0.8s linear infinite',
        }}
      />
      <span className="sr-only">Loading</span>
    </div>
  );
}
