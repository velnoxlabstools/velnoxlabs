interface CategoryStatsProps {
  toolCount: number;
  featuredToolCount: number;
}

export function CategoryStats({ toolCount, featuredToolCount }: CategoryStatsProps) {
  return (
    <dl
      style={{
        display: 'flex',
        flexWrap: 'wrap',
        gap: 'var(--space-6)',
        margin: 0,
      }}
    >
      <div>
        <dt style={{ margin: 0, fontSize: 'var(--font-size-sm)', color: 'var(--muted-foreground)' }}>
          Tools
        </dt>
        <dd
          style={{
            margin: 'var(--space-1) 0 0',
            fontSize: 'var(--font-size-2xl)',
            fontWeight: 'var(--font-weight-bold)',
          }}
        >
          {toolCount}
        </dd>
      </div>
      <div>
        <dt style={{ margin: 0, fontSize: 'var(--font-size-sm)', color: 'var(--muted-foreground)' }}>
          Featured
        </dt>
        <dd
          style={{
            margin: 'var(--space-1) 0 0',
            fontSize: 'var(--font-size-2xl)',
            fontWeight: 'var(--font-weight-bold)',
          }}
        >
          {featuredToolCount}
        </dd>
      </div>
    </dl>
  );
}
