import type { ContentWidth, LayoutVariant } from '@/types/layout';

export const LAYOUT_VARIANTS: Record<LayoutVariant, string> = {
  default: 'var(--container-xl)',
  narrow: 'var(--container-md)',
  wide: 'var(--container-2xl)',
  full: '100%',
} as const;

export const CONTENT_WIDTHS: Record<ContentWidth, string> = {
  prose: '65ch',
  sm: 'var(--container-sm)',
  md: 'var(--container-md)',
  lg: 'var(--container-lg)',
  xl: 'var(--container-xl)',
  '2xl': 'var(--container-2xl)',
  full: '100%',
} as const;

export const LAYOUT_IDS = {
  appShell: 'app-shell',
  mainContent: 'main-content',
  pageWrapper: 'page-wrapper',
} as const;

export const SCROLL_BEHAVIOR = {
  smooth: 'smooth',
  instant: 'instant',
  auto: 'auto',
} as const;
