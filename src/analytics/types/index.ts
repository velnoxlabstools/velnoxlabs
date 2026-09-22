export type AnalyticsEventName =
  | 'page_view'
  | 'category_view'
  | 'tool_view'
  | 'tool_execute'
  | 'search'
  | 'copy_result'
  | 'download_result'
  | 'share_result'
  | 'favorite'
  | 'error'
  | 'performance';

export interface AnalyticsEvent {
  name: AnalyticsEventName;
  timestamp: number;
  path?: string;
  toolId?: string;
  toolSlug?: string;
  categoryId?: string;
  categorySlug?: string;
  query?: string;
  label?: string;
  value?: number;
  meta?: Record<string, string | number | boolean>;
}

export type AnalyticsProviderId = 'console' | 'plausible' | 'umami' | 'ga4' | 'none';

export interface AnalyticsProviderAdapter {
  id: AnalyticsProviderId;
  track(event: AnalyticsEvent): void | Promise<void>;
}

export interface RecommendationItem {
  id: string;
  slug: string;
  name: string;
  score: number;
  reason: 'related' | 'popular' | 'trending' | 'recent' | 'updated' | 'suggested';
}

export interface RecommendationSet {
  related: RecommendationItem[];
  popular: RecommendationItem[];
  trending: RecommendationItem[];
  recentlyUpdated: RecommendationItem[];
  suggestedNext: RecommendationItem[];
}
