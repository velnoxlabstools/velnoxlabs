import type { ThemeColors } from './types';
import { colors } from './tokens';

export const lightTheme: ThemeColors = {
  background: '#F8F9FA',
  foreground: '#111827',
  muted: '#F1F5F9',
  mutedForeground: '#4B5563',
  card: '#FFFFFF',
  cardForeground: '#111827',
  popover: '#FFFFFF',
  popoverForeground: '#111827',
  primary: colors.brand[600],
  primaryForeground: '#FFFFFF',
  secondary: '#F1F5F9',
  secondaryForeground: '#111827',
  accent: colors.brand[50],
  accentForeground: colors.brand[700],
  destructive: colors.error[600],
  destructiveForeground: '#FFFFFF',
  border: '#E5E7EB',
  input: '#E5E7EB',
  ring: colors.brand[500],
  success: colors.success[600],
  warning: colors.warning[600],
  error: colors.error[600],
  info: colors.info[600],
};

export const darkTheme: ThemeColors = {
  background: '#090d16',
  foreground: '#F8FAFC',
  muted: '#111827',
  mutedForeground: '#94A3B8',
  card: '#111827',
  cardForeground: '#F8FAFC',
  popover: '#111827',
  popoverForeground: '#F8FAFC',
  primary: colors.brand[500],
  primaryForeground: '#090d16',
  secondary: '#1E293B',
  secondaryForeground: '#F8FAFC',
  accent: '#1E293B',
  accentForeground: colors.brand[300],
  destructive: colors.error[500],
  destructiveForeground: '#F8FAFC',
  border: '#1E293B',
  input: '#1E293B',
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
