import type { AnalyticsEvent, AnalyticsProviderAdapter } from '../types';

export const umamiProvider: AnalyticsProviderAdapter = {
  id: 'umami',
  track(event: AnalyticsEvent) {
    if (typeof window === 'undefined') return;
    const w = window as unknown as { umami?: { track: (n: string, d?: Record<string, string>) => void } };
    if (w.umami?.track) {
      w.umami.track(event.name, {
        path: event.path ?? '',
        tool: event.toolSlug ?? '',
      });
    }
  },
};
