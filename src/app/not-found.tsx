import Link from 'next/link';

export default function NotFound() {
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '50vh',
        padding: 'var(--space-8)',
        textAlign: 'center',
      }}
    >
      <h1 style={{ fontSize: 'var(--font-size-4xl)', marginBottom: 'var(--space-2)' }}>404</h1>
      <p style={{ color: 'var(--muted-foreground)', marginBottom: 'var(--space-6)' }}>
        This page could not be found.
      </p>
      <Link
        href="/"
        style={{
          color: 'var(--primary, var(--color-brand-600))',
          fontWeight: 600,
          textDecoration: 'none',
        }}
      >
        Back to home
      </Link>
    </div>
  );
}
