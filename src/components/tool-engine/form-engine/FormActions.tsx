'use client';

import type { FormButtonConfig, FormStatus } from './types';

interface FormActionsProps {
  actions: FormButtonConfig[];
  status: FormStatus;
  onAction?: (id: string) => void;
}

function styleFor(variant: FormButtonConfig['variant'] = 'secondary'): React.CSSProperties {
  if (variant === 'primary') {
    return { background: 'var(--primary)', color: 'var(--primary-foreground)', border: '1px solid var(--primary)' };
  }
  if (variant === 'danger') {
    return { background: 'var(--destructive)', color: 'var(--destructive-foreground)', border: '1px solid var(--destructive)' };
  }
  if (variant === 'ghost') {
    return { background: 'transparent', color: 'var(--foreground)', border: '1px solid transparent' };
  }
  return { background: 'var(--background)', color: 'var(--foreground)', border: '1px solid var(--border)' };
}

export function FormActions({ actions, status, onAction }: FormActionsProps) {
  const busy = status === 'submitting' || status === 'loading' || status === 'disabled';

  return (
    <div
      role="group"
      aria-label="Form actions"
      style={{ display: 'flex', flexWrap: 'wrap', gap: 'var(--space-2)' }}
    >
      {actions.map((action) => (
        <button
          key={action.id}
          type={action.type ?? 'button'}
          disabled={busy || action.disabled}
          onClick={() => onAction?.(action.id)}
          style={{
            padding: 'var(--space-2) var(--space-4)',
            borderRadius: 'var(--radius-md)',
            fontSize: 'var(--font-size-sm)',
            fontWeight: 'var(--font-weight-semibold)',
            cursor: busy || action.disabled ? 'not-allowed' : 'pointer',
            opacity: busy || action.disabled ? 'var(--opacity-50)' : 1,
            ...styleFor(action.variant),
          }}
        >
          {action.label}
        </button>
      ))}
    </div>
  );
}

export function ButtonGroup(props: FormActionsProps) {
  return <FormActions {...props} />;
}
