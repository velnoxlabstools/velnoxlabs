import type { ThemeColors } from './types';
import { colors } from './tokens';

export const lightTheme: ThemeColors = {
  background: colors.neutral[0],
  foreground: colors.neutral[900],
  muted: colors.neutral[100],
  mutedForeground: colors.neutral[500],
  card: colors.neutral[0],
  cardForeground: colors.neutral[900],
  popover: colors.neutral[0],
  popoverForeground: colors.neutral[900],
  primary: colors.brand[600],
  primaryForeground: colors.neutral[0],
  secondary: colors.neutral[100],
  secondaryForeground: colors.neutral[900],
  accent: colors.brand[50],
  accentForeground: colors.brand[700],
  destructive: colors.error[600],
  destructiveForeground: colors.neutral[0],
  border: colors.neutral[200],
  input: colors.neutral[200],
  ring: colors.brand[500],
  success: colors.success[600],
  warning: colors.warning[600],
  error: colors.error[600],
  info: colors.info[600],
};

export const darkTheme: ThemeColors = {
  background: colors.neutral[950],
  foreground: colors.neutral[50],
  muted: colors.neutral[900],
  mutedForeground: colors.neutral[400],
  card: colors.neutral[900],
  cardForeground: colors.neutral[50],
  popover: colors.neutral[900],
  popoverForeground: colors.neutral[50],
  primary: colors.brand[500],
  primaryForeground: colors.neutral[950],
  secondary: colors.neutral[800],
  secondaryForeground: colors.neutral[50],
  accent: colors.neutral[800],
  accentForeground: colors.brand[300],
  destructive: colors.error[500],
  destructiveForeground: colors.neutral[50],
  border: colors.neutral[800],
  input: colors.neutral[800],
  ring: colors.brand[400],
  success: colors.success[500],
  warning: colors.warning[500],
  error: colors.error[500],
  info: colors.info[500],
};

export const themes = {
  light: lightTheme,
  dark: darkTheme,
} as const;
