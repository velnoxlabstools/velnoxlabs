import type { AnalyticsEvent, AnalyticsProviderAdapter } from '../types';

export const consoleProvider: AnalyticsProviderAdapter = {
  id: 'console',
  track(event: AnalyticsEvent) {
    if (process.env.NODE_ENV !== 'production') {
      console.debug('[analytics]', event.name, event);
    }
  },
};
