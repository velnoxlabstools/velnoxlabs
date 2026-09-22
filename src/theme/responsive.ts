import { breakpoints } from './tokens';

export const media = {
  sm: `@media (min-width: ${breakpoints.sm})`,
  md: `@media (min-width: ${breakpoints.md})`,
  lg: `@media (min-width: ${breakpoints.lg})`,
  xl: `@media (min-width: ${breakpoints.xl})`,
  '2xl': `@media (min-width: ${breakpoints['2xl']})`,
} as const;

export function up(breakpoint: keyof typeof breakpoints): string {
  return `@media (min-width: ${breakpoints[breakpoint]})`;
}

export function down(breakpoint: keyof typeof breakpoints): string {
  const value = breakpoints[breakpoint];
  if (value === '0px') return '@media (max-width: 0px)';
  const num = parseInt(value, 10) - 1;
  return `@media (max-width: ${num}px)`;
}
