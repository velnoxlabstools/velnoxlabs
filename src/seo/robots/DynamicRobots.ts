import { getBaseUrl } from '../utils';
import { siteConfig } from '@/config';

export class DynamicRobots {
  generateTxt(): string {
    const origin = getBaseUrl();
    return `User-agent: *
Allow: /

Sitemap: ${origin}/sitemap.xml
`;
  }

  generateNextConfig() {
    return {
      rules: { userAgent: '*', allow: '/' },
      sitemap: `${getBaseUrl()}/sitemap.xml`,
      host: siteConfig.url,
    };
  }
}

export const dynamicRobots = new DynamicRobots();
