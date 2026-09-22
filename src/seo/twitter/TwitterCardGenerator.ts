import type { SEOPageInput, GeneratedMetadata } from '../types';
import { absoluteUrl } from '../utils';
import { dynamicTitleGenerator } from '../metadata/DynamicTitleGenerator';
import { metaDescriptionGenerator } from '../metadata/MetaDescriptionGenerator';

export class TwitterCardGenerator {
  generate(input: SEOPageInput): GeneratedMetadata['twitter'] {
    return {
      card: input.image ? 'summary_large_image' : 'summary',
      title: dynamicTitleGenerator.generate(input.title, { includeBrand: false }),
      description: metaDescriptionGenerator.generate(input.description),
      images: input.image ? [absoluteUrl(input.image)] : undefined,
    };
  }
}

export const twitterCardGenerator = new TwitterCardGenerator();
