import type { HTMLAttributes, ReactNode } from 'react';

export interface CardProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
  padding?: 'none' | 'sm' | 'md' | 'lg';
  as?: 'div' | 'article' | 'section';
  interactive?: boolean;
}

const paddingMap = {
  none: '0',
  sm: '0.75rem',
  md: '1.25rem',
  lg: '1.75rem',
};

export function Card({
  children,
  padding = 'md',
  as: Tag = 'div',
  interactive = false,
  style,
  className,
  ...rest
}: CardProps) {
  return (
    <Tag
      className={`${interactive ? 'ui-card' : ''}${className ? ` ${className}` : ''}`}
      style={{
        background: 'var(--card, var(--color-neutral-0))',
        border: '1px solid var(--border, var(--color-neutral-200))',
        borderRadius: 'var(--radius-xl, 0.75rem)',
        boxShadow: '0 1px 2px rgba(15, 23, 42, 0.04)',
        padding: paddingMap[padding],
        ...style,
      }}
      {...rest}
    >
      {children}
    </Tag>
  );
}
