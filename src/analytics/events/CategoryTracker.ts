import { eventTracker } from '../tracking';

export function trackCategoryView(slug: string, categoryId?: string) {
  eventTracker.track({
    name: 'category_view',
    timestamp: Date.now(),
    categorySlug: slug,
    categoryId,
    path: `/categories/${slug}`,
  });
}
