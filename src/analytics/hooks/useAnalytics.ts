'use client';

import { useCallback } from 'react';
import { analyticsManager } from '../services/AnalyticsManager';
import * as events from '../events';
import type { AnalyticsEvent } from '../types';

export function useAnalytics() {
  const track = useCallback((event: AnalyticsEvent) => {
    analyticsManager.track(event);
  }, []);

  return {
    track,
    trackPageView: events.trackPageView,
    trackToolView: events.trackToolView,
    trackToolExecute: events.trackToolExecute,
    trackSearch: events.trackSearch,
    trackCategoryView: events.trackCategoryView,
    trackCopyResult: events.trackCopyResult,
    trackDownloadResult: events.trackDownloadResult,
    trackShareResult: events.trackShareResult,
    recommendations: analyticsManager.recommendations,
  };
}

export function useRecommendations(toolIdOrSlug?: string) {
  if (toolIdOrSlug) {
    return analyticsManager.recommendations.forTool(toolIdOrSlug);
  }
  return analyticsManager.recommendations.forHomepage();
}
