interface HomepageGridProps {
  children: React.ReactNode;
  columns?: 2 | 3 | 4;
  className?: string;
}

export function HomepageGrid({
  children,
  columns = 3,
}: HomepageGridProps) {
  const minWidth =
    columns === 2 ? '16rem' : columns === 4 ? '12rem' : '14rem';

  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: `repeat(auto-fill, minmax(${minWidth}, 1fr))`,
        gap: 'var(--space-6)',
        width: '100%',
      }}
    >
      {children}
    </div>
  );
}
