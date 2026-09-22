import { getAllRoutes } from '@/services/routing';
import { siteConfig } from '@/config';

export function generateSitemapXml(baseUrl?: string): string {
  const origin = (baseUrl || siteConfig.url).replace(/\/$/, '');
  const routes = getAllRoutes();

  const urls = routes
    .map((r) => {
      const loc = `${origin}${r.path === '/' ? '' : r.path}`;
      const freq = r.changeFrequency ?? 'weekly';
      const priority = r.priority ?? 0.5;
      return `  <url>
    <loc>${escapeXml(loc)}</loc>
    <changefreq>${freq}</changefreq>
    <priority>${priority.toFixed(1)}</priority>
  </url>`;
    })
    .join('\n');

  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls}
</urlset>
`;
}

function escapeXml(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}
