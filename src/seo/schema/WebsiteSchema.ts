import { getBaseUrl } from '../utils';
import { siteConfig } from '@/config';

export function websiteSchema() {
  return {
    '@type': 'WebSite',
    '@id': `${getBaseUrl()}/#website`,
    name: siteConfig.name,
    url: getBaseUrl(),
    description: siteConfig.description,
    publisher: { '@id': `${getBaseUrl()}/#organization` },
    potentialAction: {
      '@type': 'SearchAction',
      target: `${getBaseUrl()}/search?q={search_term_string}`,
      'query-input': 'required name=search_term_string',
    },
  };
}
