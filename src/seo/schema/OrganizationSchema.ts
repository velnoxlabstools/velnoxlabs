import { siteConfig } from '@/config';
import { getBaseUrl } from '../utils';

export function organizationSchema() {
  return {
    '@type': 'Organization',
    '@id': `${getBaseUrl()}/#organization`,
    name: siteConfig.name,
    url: getBaseUrl(),
    description: siteConfig.description,
  };
}
