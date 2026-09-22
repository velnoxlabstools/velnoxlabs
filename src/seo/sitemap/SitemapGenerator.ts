import { getAllRoutes } from '@/services/routing';
import { absoluteUrl } from '../utils';

export interface SitemapEntry {
  url: string;
  changeFrequency?: 'always' | 'hourly' | 'daily' | 'weekly' | 'monthly' | 'yearly' | 'never';
  priority?: number;
}

/**
 * Builds sitemap entries from the platform route manager (tools, categories, static).
 */
export class SitemapGenerator {
  generate(): SitemapEntry[] {
    return getAllRoutes().map((r) => ({
      url: absoluteUrl(r.path === '/' ? '/' : r.path),
      changeFrequency: r.changeFrequency,
      priority: r.priority,
    }));
  }

  toXml(): string {
    const entries = this.generate();
    const body = entries
      .map(
        (e) => `  <url>
    <loc>${escapeXml(e.url)}</loc>
    ${e.changeFrequency ? `<changefreq>${e.changeFrequency}</changefreq>` : ''}
    ${e.priority != null ? `<priority>${e.priority.toFixed(1)}</priority>` : ''}
  </url>`
      )
      .join('\n');

    return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${body}
</urlset>
`;
  }
}

function escapeXml(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

export const sitemapGenerator = new SitemapGenerator();
