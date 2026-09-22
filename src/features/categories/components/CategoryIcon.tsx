interface CategoryIconProps {
  icon?: string;
  name: string;
  size?: 'sm' | 'md' | 'lg';
}

const SIZE_MAP = {
  sm: 'var(--icon-md)',
  md: 'var(--icon-xl)',
  lg: '2.5rem',
} as const;

export function CategoryIcon({ icon, name, size = 'md' }: CategoryIconProps) {
  const label = (icon || name).slice(0, 1).toUpperCase();
  return (
    <span
      aria-hidden="true"
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        width: SIZE_MAP[size],
        height: SIZE_MAP[size],
        borderRadius: 'var(--radius-md)',
        background: 'var(--primary)',
        color: 'var(--primary-foreground)',
        fontWeight: 'var(--font-weight-bold)',
        fontSize: size === 'lg' ? 'var(--font-size-lg)' : 'var(--font-size-sm)',
        flexShrink: 0,
      }}
    >
      {label}
    </span>
  );
}
