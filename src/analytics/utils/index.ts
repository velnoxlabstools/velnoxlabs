import type { AnalyticsEvent } from '../types';

const ALLOWED_META = 10;

export function sanitizeEvent(event: AnalyticsEvent): AnalyticsEvent {
  const meta = event.meta
    ? Object.fromEntries(
        Object.entries(event.meta)
          .slice(0, ALLOWED_META)
          .map(([k, v]) => [String(k).slice(0, 40), typeof v === 'string' ? v.slice(0, 200) : v])
      )
    : undefined;

  return {
    name: event.name,
    timestamp: event.timestamp || Date.now(),
    path: event.path?.slice(0, 500),
    toolId: event.toolId?.slice(0, 80),
    toolSlug: event.toolSlug?.slice(0, 80),
    categoryId: event.categoryId?.slice(0, 80),
    categorySlug: event.categorySlug?.slice(0, 80),
    query: event.query?.slice(0, 200),
    label: event.label?.slice(0, 120),
    value: typeof event.value === 'number' ? event.value : undefined,
    meta,
  };
}

export function eventKey(event: AnalyticsEvent): string {
  return [
    event.name,
    event.path ?? '',
    event.toolSlug ?? '',
    event.query ?? '',
    event.label ?? '',
  ].join('|');
}
