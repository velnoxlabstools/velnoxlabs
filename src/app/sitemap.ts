import type { MetadataRoute } from 'next';
import { getAllRoutes } from '@/services/routing';
import { siteConfig } from '@/config';

export default function sitemap(): MetadataRoute.Sitemap {
  const origin = siteConfig.url.replace(/\/$/, '');
  return getAllRoutes().map((r) => ({
    url: `${origin}${r.path === '/' ? '' : r.path}`,
    changeFrequency: r.changeFrequency,
    priority: r.priority,
  }));
}
