import type { AppRoute, ResolvedRoute } from '@/types/routing';
import { getToolSlugs, getTool } from '@/services/tools';
import {
  getCategorySlugs,
  findCategoryBySlug,
  findCategoryById,
} from '@/services/categories';
import { getCollectionRegistry } from '@/services/tools/registry';

const STATIC_ROUTES: AppRoute[] = [
  { path: '/', type: 'static', title: 'Home', changeFrequency: 'daily', priority: 1 },
  { path: '/tools', type: 'static', title: 'Tools', changeFrequency: 'daily', priority: 0.9 },
  { path: '/categories', type: 'static', title: 'Categories', changeFrequency: 'weekly', priority: 0.9 },
  { path: '/search', type: 'search', title: 'Search', changeFrequency: 'monthly', priority: 0.3 },
];

export function getAllRoutes(): AppRoute[] {
  const routes: AppRoute[] = [...STATIC_ROUTES];

  for (const slug of getToolSlugs()) {
    const tool = getTool(slug);
    if (!tool || tool.status !== 'published') continue;
    routes.push({
      path: `/tools/${slug}`,
      type: 'tool',
      slug,
      title: tool.name,
      changeFrequency: 'weekly',
      priority: tool.featured ? 0.8 : 0.6,
    });
  }

  for (const slug of getCategorySlugs()) {
    const cat = findCategoryBySlug(slug);
    routes.push({
      path: `/categories/${slug}`,
      type: 'category',
      slug,
      title: cat?.name ?? slug,
      changeFrequency: 'weekly',
      priority: 0.7,
    });
  }

  for (const col of getCollectionRegistry()) {
    routes.push({
      path: `/collections/${col.slug}`,
      type: 'collection',
      slug: col.slug,
      title: col.name,
      changeFrequency: 'monthly',
      priority: 0.5,
    });
  }

  return routes;
}

export function resolveRoute(path: string): ResolvedRoute | null {
  const normalized = path.replace(/\/$/, '') || '/';
  const route = getAllRoutes().find((r) => r.path === normalized);
  if (!route) return null;

  const breadcrumbs: ResolvedRoute['breadcrumbs'] = [{ label: 'Home', href: '/' }];

  if (route.type === 'tool' && route.slug) {
    breadcrumbs.push({ label: 'Tools', href: '/tools' });
    const tool = getTool(route.slug);
    if (tool) {
      const cat = findCategoryById(tool.categoryId);
      if (cat) {
        breadcrumbs.push({ label: cat.name, href: `/categories/${cat.slug}` });
      }
      breadcrumbs.push({ label: tool.name });
    } else {
      breadcrumbs.push({ label: route.title });
    }
  } else if (route.type === 'category' && route.slug) {
    breadcrumbs.push({ label: 'Categories', href: '/categories' });
    breadcrumbs.push({ label: route.title });
  } else if (route.type === 'collection' && route.slug) {
    breadcrumbs.push({ label: route.title });
  } else if (route.path !== '/') {
    breadcrumbs.push({ label: route.title });
  }

  return { route, breadcrumbs };
}

export function isValidSlug(slug: string): boolean {
  return /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug);
}

export function routeExists(path: string): boolean {
  return getAllRoutes().some((r) => r.path === path);
}

export function generateBreadcrumbs(path: string) {
  return resolveRoute(path)?.breadcrumbs ?? [{ label: 'Home', href: '/' }];
}
