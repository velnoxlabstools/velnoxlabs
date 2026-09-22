'use client';

interface ToolActionBarProps {
  onCopy?: () => void;
  onDownload?: () => void;
  onReset?: () => void;
  onShare?: () => void;
  disableCopy?: boolean;
  disableDownload?: boolean;
}

/**
 * Standard action bar for every tool page.
 * Handlers are optional — tools wire them when UI logic is added later.
 */
export function ToolActionBar({
  onCopy,
  onDownload,
  onReset,
  onShare,
  disableCopy = true,
  disableDownload = true,
}: ToolActionBarProps) {
  const btn = (label: string, onClick?: () => void, disabled?: boolean) => (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled || !onClick}
      aria-label={label}
      style={{
        padding: 'var(--space-2) var(--space-4)',
        borderRadius: 'var(--radius-md)',
        border: '1px solid var(--border)',
        background: 'var(--background)',
        color: 'var(--foreground)',
        fontSize: 'var(--font-size-sm)',
        fontWeight: 'var(--font-weight-medium)',
        cursor: disabled || !onClick ? 'not-allowed' : 'pointer',
        opacity: disabled || !onClick ? 'var(--opacity-50)' : 1,
      }}
    >
      {label}
    </button>
  );

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
      {btn('Copy', onCopy, disableCopy)}
      {btn('Download', onDownload, disableDownload)}
      {btn('Reset', onReset, !onReset)}
      {btn('Share', onShare, !onShare)}
    </div>
  );
}
