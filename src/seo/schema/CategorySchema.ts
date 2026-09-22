import { absoluteUrl } from '../utils';

export function categoryCollectionSchema(input: {
  name: string;
  description: string;
  path: string;
  toolCount?: number;
}) {
  return {
    '@type': 'CollectionPage',
    name: input.name,
    description: input.description,
    url: absoluteUrl(input.path),
    ...(typeof input.toolCount === 'number'
      ? {
          mainEntity: {
            '@type': 'ItemList',
            numberOfItems: input.toolCount,
          },
        }
      : {}),
  };
}
