'use client';

import { useEffect } from 'react';

interface ErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function GlobalError({ error, reset }: ErrorProps) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div
      role="alert"
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
      <h1 style={{ fontSize: 'var(--font-size-2xl)', marginBottom: 'var(--space-4)' }}>
        Something went wrong
      </h1>
      <p style={{ color: 'var(--muted-foreground)', marginBottom: 'var(--space-6)' }}>
        An unexpected error occurred.
      </p>
      <button
        type="button"
        onClick={reset}
        style={{
          padding: 'var(--space-2) var(--space-4)',
          borderRadius: 'var(--radius-md)',
          border: '1px solid var(--border)',
          background: 'var(--background)',
          color: 'var(--foreground)',
          cursor: 'pointer',
        }}
      >
        Try again
      </button>
    </div>
  );
}
