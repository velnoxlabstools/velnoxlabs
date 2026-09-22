import { rebuildSearchIndex, getSearchIndexStats } from '@/services/search';
import { clearToolCache, getToolStatistics } from '@/services/tools';
import { clearHomepageCache, loadHomepageData } from '@/services/home';
import { getAllRoutes } from '@/services/routing';
import { listCategories } from '@/services/categories';

export interface PlatformBootstrapResult {
  search: ReturnType<typeof getSearchIndexStats>;
  tools: ReturnType<typeof getToolStatistics>;
  routes: number;
  categories: number;
  homepageSections: number;
  ready: boolean;
}

/**
 * Platform bootstrap — warms caches and validates integration.
 * Call on server start or after registry mutations.
 */
export function bootstrapPlatform(): PlatformBootstrapResult {
  clearToolCache();
  clearHomepageCache();

  const searchCount = rebuildSearchIndex();
  const search = getSearchIndexStats();
  const tools = getToolStatistics();
  const routes = getAllRoutes().length;
  const categories = listCategories({ pageSize: 1000 }).total;
  const homepage = loadHomepageData({ bypassCache: true });

  void searchCount;

  return {
    search,
    tools,
    routes,
    categories,
    homepageSections: homepage.config.sections.filter((s) => s.enabled).length,
    ready: search.documents > 0 && tools.total > 0 && routes > 0,
  };
}

/**
 * After tool register/unregister — refresh dependent systems.
 */
export function onToolRegistryChange(): void {
  clearToolCache();
  clearHomepageCache();
  rebuildSearchIndex();
}
