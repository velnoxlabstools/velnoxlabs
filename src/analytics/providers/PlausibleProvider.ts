import type { AnalyticsEvent, AnalyticsProviderAdapter } from '../types';

/** Plausible-ready adapter (no-op until window.plausible exists) */
export const plausibleProvider: AnalyticsProviderAdapter = {
  id: 'plausible',
  track(event: AnalyticsEvent) {
    if (typeof window === 'undefined') return;
    const w = window as unknown as { plausible?: (n: string, o?: { props?: Record<string, string> }) => void };
    if (typeof w.plausible === 'function') {
      w.plausible(event.name, {
        props: {
          path: event.path ?? '',
          tool: event.toolSlug ?? '',
          category: event.categorySlug ?? '',
        },
      });
    }
  },
};
