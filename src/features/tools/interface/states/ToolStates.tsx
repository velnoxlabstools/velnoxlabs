'use client';

import type { ToolRunState } from '@/types/tool-interface';

interface ToolStatesProps {
  state: ToolRunState;
}

export function ToolStates({ state }: ToolStatesProps) {
  if (state.status === 'idle') return null;

  if (state.status === 'loading') {
    return (
      <div
        role="status"
        aria-live="polite"
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 'var(--space-3)',
          padding: 'var(--space-3)',
          borderRadius: 'var(--radius-md)',
          background: 'var(--muted)',
          fontSize: 'var(--font-size-sm)',
        }}
      >
        <span
          style={{
            width: 'var(--icon-sm)',
            height: 'var(--icon-sm)',
            border: '2px solid var(--border)',
            borderTopColor: 'var(--primary)',
            borderRadius: 'var(--radius-full)',
            animation: 'spin 0.8s linear infinite',
          }}
        />
        {state.message ?? 'Processing…'}
        {typeof state.progress === 'number' && (
          <span style={{ color: 'var(--muted-foreground)' }}>{Math.round(state.progress)}%</span>
        )}
      </div>
    );
  }

  if (state.status === 'error') {
    return (
      <div
        role="alert"
        style={{
          padding: 'var(--space-3)',
          borderRadius: 'var(--radius-md)',
          border: '1px solid var(--destructive)',
          background: 'var(--background)',
          color: 'var(--destructive)',
          fontSize: 'var(--font-size-sm)',
        }}
      >
        {state.message ?? 'Something went wrong.'}
      </div>
    );
  }

  if (state.status === 'success') {
    return (
      <div
        role="status"
        style={{
          padding: 'var(--space-3)',
          borderRadius: 'var(--radius-md)',
          border: '1px solid var(--border)',
          background: 'var(--muted)',
          fontSize: 'var(--font-size-sm)',
          color: 'var(--foreground)',
        }}
      >
        {state.message ?? 'Done.'}
      </div>
    );
  }

  if (state.status === 'empty') {
    return (
      <p style={{ margin: 0, fontSize: 'var(--font-size-sm)', color: 'var(--muted-foreground)' }}>
        {state.message ?? 'No results.'}
      </p>
    );
  }

  return null;
}

export function LoadingOverlay({ visible }: { visible: boolean }) {
  if (!visible) return null;
  return (
    <div
      aria-hidden="true"
      style={{
        position: 'absolute',
        inset: 0,
        background: 'color-mix(in srgb, var(--background) 70%, transparent)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: 'var(--radius-lg)',
        zIndex: 1,
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
    </div>
  );
}
