import type { ThemeMode } from './types';

export function getSystemTheme(): 'light' | 'dark' {
  if (typeof window === 'undefined') return 'dark';
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
}

export function resolveTheme(mode: ThemeMode): 'light' | 'dark' {
  if (mode === 'system') return getSystemTheme();
  return mode;
}

export function applyThemeClass(theme: 'light' | 'dark'): void {
  if (typeof document === 'undefined') return;
  const root = document.documentElement;
  if (theme === 'dark') {
    root.classList.add('dark');
    root.classList.remove('light');
    root.setAttribute('data-theme', 'dark');
  } else {
    root.classList.remove('dark');
    root.classList.add('light');
    root.setAttribute('data-theme', 'light');
  }
}

export function getStoredTheme(): ThemeMode {
  if (typeof window === 'undefined') return 'dark';
  const stored = (localStorage.getItem('theme') ||
    localStorage.getItem('velnox-theme')) as ThemeMode | null;
  return stored ?? 'dark';
}

export function storeTheme(mode: ThemeMode): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem('theme', mode);
  localStorage.setItem('velnox-theme', mode);
}
