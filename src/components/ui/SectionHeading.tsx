interface SectionHeadingProps {
  title: string;
  description?: string;
  align?: 'left' | 'center';
  as?: 'h1' | 'h2' | 'h3';
  id?: string;
}

export function SectionHeading({
  title,
  description,
  align = 'center',
  as: Tag = 'h2',
  id,
}: SectionHeadingProps) {
  return (
    <div
      style={{
        textAlign: align,
        marginBottom: 'var(--space-8)',
        maxWidth: align === 'center' ? '40rem' : undefined,
        marginLeft: align === 'center' ? 'auto' : undefined,
        marginRight: align === 'center' ? 'auto' : undefined,
      }}
    >
      <Tag
        id={id}
        style={{
          margin: 0,
          fontSize: 'var(--font-size-3xl)',
          fontWeight: 'var(--font-weight-bold)',
          lineHeight: 'var(--line-height-tight)',
          letterSpacing: 'var(--letter-spacing-tight)',
          color: 'var(--foreground)',
        }}
      >
        {title}
      </Tag>
      {description && (
        <p
          style={{
            marginTop: 'var(--space-3)',
            marginBottom: 0,
            fontSize: 'var(--font-size-lg)',
            lineHeight: 'var(--line-height-relaxed)',
            color: 'var(--muted-foreground)',
          }}
        >
          {description}
        </p>
      )}
    </div>
  );
}
