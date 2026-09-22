import { LAYOUT_IDS } from '@/constants/layout';

export function SkipToContent() {
  return (
    <a
      href={`#${LAYOUT_IDS.mainContent}`}
      className="skip-to-content"
      style={{
        position: 'absolute',
        left: 'var(--space-4)',
        top: 'var(--space-4)',
        zIndex: 'var(--z-tooltip)',
        padding: 'var(--space-2) var(--space-4)',
        background: 'var(--primary)',
        color: 'var(--primary-foreground)',
        borderRadius: 'var(--radius-md)',
        textDecoration: 'none',
        fontSize: 'var(--font-size-sm)',
        fontWeight: 'var(--font-weight-medium)',
        transform: 'translateY(-120%)',
        transition: 'transform var(--duration-fast) var(--ease-out)',
      }}
    >
      Skip to content
    </a>
  );
}
