import { CONTENT_WIDTHS, LAYOUT_VARIANTS } from '@/constants/layout';
import type { ContentWidth, LayoutVariant } from '@/types/layout';

export function getLayoutMaxWidth(variant: LayoutVariant = 'default'): string {
  return LAYOUT_VARIANTS[variant];
}

export function getContentMaxWidth(width: ContentWidth = 'xl'): string {
  return CONTENT_WIDTHS[width];
}

export function cx(...classes: Array<string | false | null | undefined>): string {
  return classes.filter(Boolean).join(' ');
}
