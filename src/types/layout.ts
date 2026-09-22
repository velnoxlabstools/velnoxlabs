import type { ReactNode } from 'react';

export type LayoutVariant = 'default' | 'narrow' | 'wide' | 'full';

export type ContentWidth = 'prose' | 'sm' | 'md' | 'lg' | 'xl' | '2xl' | 'full';

export interface PageWrapperProps {
  children: ReactNode;
  className?: string;
  variant?: LayoutVariant;
}

export interface MainContentProps {
  children: ReactNode;
  className?: string;
  as?: 'main' | 'div' | 'section';
}

export interface SectionWrapperProps {
  children: ReactNode;
  className?: string;
  id?: string;
  as?: 'section' | 'div' | 'article';
  width?: ContentWidth;
}

export interface AppShellProps {
  children: ReactNode;
}

export interface GlobalContainerProps {
  children: ReactNode;
  className?: string;
  maxWidth?: ContentWidth;
}
