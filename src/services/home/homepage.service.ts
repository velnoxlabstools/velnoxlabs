import { tools, collections } from '@/data/tools';
import { categories } from '@/data/categories';
import { homepageConfig, homepageFaqs } from '@/features/home/config/homepage.config';
import type { HomepageData } from '@/types/tools';
import {
  getFeaturedTools,
  getTrendingTools,
  getPopularTools,
  getNewTools,
  getRecentlyUpdatedTools,
  getRecommendedTools,
  getPopularCategories,
  getFeaturedCategories,
  getCollections,
  getToolCount,
  getCategoryCount,
  formatStatValue,
} from './engines';

/** Simple in-memory cache for homepage payload */
let cache: { data: HomepageData; ts: number } | null = null;
const CACHE_TTL_MS = 60_000;

export function clearHomepageCache(): void {
  cache = null;
}

export function loadHomepageData(options?: { bypassCache?: boolean }): HomepageData {
  if (!options?.bypassCache && cache && Date.now() - cache.ts < CACHE_TTL_MS) {
    return cache.data;
  }

  const { limits } = homepageConfig;

  const data: HomepageData = {
    stats: {
      toolCount: getToolCount(tools),
      categoryCount: getCategoryCount(categories),
      monthlyUsersLabel: '—',
    },
    featuredTools: getFeaturedTools(tools, limits.featuredTools),
    trendingTools: getTrendingTools(tools, limits.trendingTools),
    popularTools: getPopularTools(tools, limits.featuredTools),
    newTools: getNewTools(tools, limits.newTools),
    recentlyUpdatedTools: getRecentlyUpdatedTools(tools, limits.recentlyUpdated),
    recommendedTools: getRecommendedTools(tools, limits.featuredTools),
    popularCategories: getPopularCategories(categories, limits.popularCategories),
    featuredCategories: getFeaturedCategories(categories, limits.popularCategories),
    collections: getCollections(collections, limits.collections),
    faqs: homepageFaqs
      .filter((f) => f.published)
      .sort((a, b) => a.order - b.order)
      .slice(0, limits.faq),
    config: homepageConfig,
  };

  cache = { data, ts: Date.now() };
  return data;
}

export function getEnabledSections() {
  return [...homepageConfig.sections]
    .filter((s) => s.enabled)
    .sort((a, b) => a.order - b.order);
}

export { formatStatValue };
