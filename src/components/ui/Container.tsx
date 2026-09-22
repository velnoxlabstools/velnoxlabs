import type { HTMLAttributes, ReactNode } from 'react';

export interface ContainerProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'full';
}

const maxWidth: Record<NonNullable<ContainerProps['size']>, string> = {
  sm: '40rem',
  md: '48rem',
  lg: '64rem',
  xl: '80rem',
  full: '100%',
};

export function Container({ children, size = 'xl', style, ...rest }: ContainerProps) {
  return (
    <div
      style={{
        width: '100%',
        maxWidth: maxWidth[size],
        marginLeft: 'auto',
        marginRight: 'auto',
        paddingLeft: '1rem',
        paddingRight: '1rem',
        ...style,
      }}
      {...rest}
    >
      {children}
    </div>
  );
}
