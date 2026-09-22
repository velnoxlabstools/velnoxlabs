import { absoluteUrl } from '../utils';

export function breadcrumbSchema(
  items: { name: string; path: string }[]
): Record<string, unknown> | null {
  if (!items.length) return null;
  return {
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: absoluteUrl(item.path),
    })),
  };
}
