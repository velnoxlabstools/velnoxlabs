import type { AnalyticsEvent, AnalyticsProviderAdapter, AnalyticsProviderId } from '../types';
import { eventTracker } from '../tracking';
import { insightsStore } from '../insights';
import {
  consoleProvider,
  plausibleProvider,
  umamiProvider,
  ga4Provider,
} from '../providers';
import { recommendationEngine } from '../recommendations';
import { recentlyUsedEngine } from '../recommendations';

const PROVIDERS: Record<AnalyticsProviderId, AnalyticsProviderAdapter | null> = {
  console: consoleProvider,
  plausible: plausibleProvider,
  umami: umamiProvider,
  ga4: ga4Provider,
  none: null,
};

export class AnalyticsManager {
  configure(providerIds: AnalyticsProviderId[]): void {
    const adapters = providerIds
      .map((id) => PROVIDERS[id])
      .filter(Boolean) as AnalyticsProviderAdapter[];
    eventTracker.setProviders(adapters.length ? adapters : [consoleProvider]);
  }

  track(event: AnalyticsEvent): void {
    eventTracker.track(event);
    insightsStore.push(event);

    if (event.name === 'tool_view' || event.name === 'tool_execute') {
      if (event.toolId && event.toolSlug) {
        recentlyUsedEngine.push({
          id: event.toolId,
          slug: event.toolSlug,
          name: event.label ?? event.toolSlug,
        });
      }
    }
  }

  recommendations = recommendationEngine;
  insights = insightsStore;
}

export const analyticsManager = new AnalyticsManager();
