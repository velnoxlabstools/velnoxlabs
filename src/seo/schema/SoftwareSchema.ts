import { absoluteUrl } from '../utils';
import { siteConfig } from '@/config';

export function softwareApplicationSchema(input: {
  name: string;
  description: string;
  path: string;
  category?: string;
  version?: string;
}) {
  return {
    '@type': 'SoftwareApplication',
    name: input.name,
    description: input.description,
    url: absoluteUrl(input.path),
    applicationCategory: input.category ?? 'UtilitiesApplication',
    operatingSystem: 'Web',
    offers: {
      '@type': 'Offer',
      price: '0',
      priceCurrency: 'USD',
    },
    publisher: {
      '@type': 'Organization',
      name: siteConfig.name,
    },
    ...(input.version ? { softwareVersion: input.version } : {}),
  };
}
