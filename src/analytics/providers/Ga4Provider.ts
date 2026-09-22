import type { AnalyticsEvent, AnalyticsProviderAdapter } from '../types';

export const ga4Provider: AnalyticsProviderAdapter = {
  id: 'ga4',
  track(event: AnalyticsEvent) {
    if (typeof window === 'undefined') return;
    const w = window as unknown as { gtag?: (...args: unknown[]) => void };
    if (typeof w.gtag === 'function') {
      w.gtag('event', event.name, {
        page_path: event.path,
        tool_slug: event.toolSlug,
        category_slug: event.categorySlug,
        search_term: event.query,
      });
    }
  },
};
