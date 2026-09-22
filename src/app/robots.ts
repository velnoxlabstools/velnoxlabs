import type { MetadataRoute } from 'next';
import { siteConfig } from '@/config';

export default function robots(): MetadataRoute.Robots {
  const origin = siteConfig.url.replace(/\/$/, '');
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: ['/api/', '/_next/'],
      },
    ],
    sitemap: `${origin}/sitemap.xml`,
    host: origin,
  };
}
