'use client';

import type { ToolActionDef } from '@/types/tool-interface';

interface ActionBarProps {
  actions: ToolActionDef[];
  onAction: (actionId: string) => void;
  disabled?: boolean;
}

const variantStyle = (variant: ToolActionDef['variant'] = 'secondary'): React.CSSProperties => {
  if (variant === 'primary') {
    return {
      background: 'var(--primary)',
      color: 'var(--primary-foreground)',
      border: '1px solid var(--primary)',
    };
  }
  if (variant === 'ghost') {
    return {
      background: 'transparent',
      color: 'var(--foreground)',
      border: '1px solid transparent',
    };
  }
  return {
    background: 'var(--background)',
    color: 'var(--foreground)',
    border: '1px solid var(--border)',
  };
};

export function ActionBar({ actions, onAction, disabled }: ActionBarProps) {
  if (!actions.length) return null;

  return (
    <div
      role="toolbar"
      aria-label="Tool actions"
      style={{
        display: 'flex',
        flexWrap: 'wrap',
        gap: 'var(--space-2)',
      }}
    >
      {actions.map((action) => (
        <button
          key={action.id}
          type={action.role === 'submit' ? 'submit' : 'button'}
          disabled={disabled}
          onClick={() => onAction(action.id)}
          style={{
            padding: 'var(--space-2) var(--space-4)',
            borderRadius: 'var(--radius-md)',
            fontSize: 'var(--font-size-sm)',
            fontWeight: 'var(--font-weight-semibold)',
            cursor: disabled ? 'not-allowed' : 'pointer',
            opacity: disabled ? 'var(--opacity-50)' : 1,
            ...variantStyle(action.variant),
          }}
        >
          {action.label}
        </button>
      ))}
    </div>
  );
}

export const DEFAULT_ACTIONS: ToolActionDef[] = [
  { id: 'run', label: 'Run', variant: 'primary', role: 'submit' },
  { id: 'copy', label: 'Copy', variant: 'secondary', role: 'copy' },
  { id: 'download', label: 'Download', variant: 'secondary', role: 'download' },
  { id: 'reset', label: 'Reset', variant: 'ghost', role: 'reset' },
  { id: 'share', label: 'Share', variant: 'ghost', role: 'share' },
];
