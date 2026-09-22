import type { SEOPageInput, GeneratedMetadata } from '../types';
import { absoluteUrl } from '../utils';
import { siteConfig } from '@/config';
import { dynamicTitleGenerator } from '../metadata/DynamicTitleGenerator';
import { metaDescriptionGenerator } from '../metadata/MetaDescriptionGenerator';

export class OpenGraphGenerator {
  generate(input: SEOPageInput): GeneratedMetadata['openGraph'] {
    const title = dynamicTitleGenerator.generate(input.title, { includeBrand: false });
    const description = metaDescriptionGenerator.generate(input.description);
    const url = absoluteUrl(input.path);

    return {
      title,
      description,
      url,
      type: input.type === 'article' ? 'article' : 'website',
      siteName: siteConfig.name,
      images: input.image ? [{ url: absoluteUrl(input.image) }] : undefined,
    };
  }
}

export const openGraphGenerator = new OpenGraphGenerator();
