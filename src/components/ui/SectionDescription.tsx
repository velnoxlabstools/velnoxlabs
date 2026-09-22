interface SectionDescriptionProps {
  children: React.ReactNode;
  align?: 'left' | 'center';
}

export function SectionDescription({
  children,
  align = 'center',
}: SectionDescriptionProps) {
  return (
    <p
      style={{
        textAlign: align,
        margin: 0,
        fontSize: 'var(--font-size-base)',
        lineHeight: 'var(--line-height-relaxed)',
        color: 'var(--muted-foreground)',
        maxWidth: align === 'center' ? '36rem' : undefined,
        marginLeft: align === 'center' ? 'auto' : undefined,
        marginRight: align === 'center' ? 'auto' : undefined,
      }}
    >
      {children}
    </p>
  );
}
