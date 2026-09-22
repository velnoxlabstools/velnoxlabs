import { siteConfig } from '@/config';

export function generateRobotsTxt(baseUrl?: string): string {
  const origin = (baseUrl || siteConfig.url).replace(/\/$/, '');
  return `User-agent: *
Allow: /

Sitemap: ${origin}/sitemap.xml
`;
}
