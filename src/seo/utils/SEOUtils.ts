import { siteConfig } from '@/config';

export function getBaseUrl(): string {
  return (siteConfig.url || 'http://localhost:3000').replace(/\/$/, '');
}

export function absoluteUrl(path: string): string {
  const base = getBaseUrl();
  if (!path || path === '/') return base;
  const p = path.startsWith('/') ? path : `/${path}`;
  return `${base}${p}`;
}

export function truncate(text: string, max: number): string {
  const t = text.replace(/\s+/g, ' ').trim();
  if (t.length <= max) return t;
  return `${t.slice(0, max - 1).trim()}…`;
}

export function escapeJsonLd(value: string): string {
  return value
    .replace(/\\/g, '\\\\')
    .replace(/"/g, '\\"')
    .replace(/\n/g, '\\n')
    .replace(/\r/g, '\\r')
    .replace(/\t/g, '\\t');
}

export function sanitizeTitle(title: string): string {
  return title.replace(/[\u0000-\u001F\u007F]/g, '').trim();
}

export function isValidPath(path: string): boolean {
  return typeof path === 'string' && path.startsWith('/') && !path.includes('://');
}
