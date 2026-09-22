import type { Metadata } from 'next';
import type { GeneratedMetadata, SEOPageInput } from '../types';
import { dynamicTitleGenerator } from './DynamicTitleGenerator';
import { metaDescriptionGenerator } from './MetaDescriptionGenerator';
import { canonicalGenerator } from '../canonical/CanonicalGenerator';
import { openGraphGenerator } from '../open-graph/OpenGraphGenerator';
import { twitterCardGenerator } from '../twitter/TwitterCardGenerator';
import { robotsMetaGenerator } from '../robots/RobotsGenerator';
import { schemaGenerator } from '../schema';

const cache = new Map<string, { data: GeneratedMetadata; ts: number }>();
const CACHE_TTL = 60_000;

export class MetadataGenerator {
  generate(input: SEOPageInput): GeneratedMetadata {
    const cacheKey = JSON.stringify(input);
    const hit = cache.get(cacheKey);
    if (hit && Date.now() - hit.ts < CACHE_TTL) return hit.data;

    const title = dynamicTitleGenerator.generate(input.title);
    const description = metaDescriptionGenerator.generate(input.description);
    const canonical = canonicalGenerator.generate(input.path);
    const robots = robotsMetaGenerator.generate(input);
    const openGraph = openGraphGenerator.generate(input);
    const twitter = twitterCardGenerator.generate(input);

    const data: GeneratedMetadata = {
      title,
      description,
      canonical,
      keywords: input.keywords ?? [],
      robots,
      openGraph,
      twitter,
    };

    cache.set(cacheKey, { data, ts: Date.now() });
    return data;
  }

  /** Next.js Metadata API shape */
  toNextMetadata(input: SEOPageInput): Metadata {
    const m = this.generate(input);
    return {
      title: m.title,
      description: m.description,
      keywords: m.keywords.length ? m.keywords : undefined,
      alternates: { canonical: m.canonical },
      robots: {
        index: m.robots.index,
        follow: m.robots.follow,
      },
      openGraph: {
        title: m.openGraph.title,
        description: m.openGraph.description,
        url: m.openGraph.url,
        siteName: m.openGraph.siteName,
        type: m.openGraph.type as 'website',
        images: m.openGraph.images,
      },
      twitter: {
        card: m.twitter.card,
        title: m.twitter.title,
        description: m.twitter.description,
        images: m.twitter.images,
      },
    };
  }

  toJsonLd(input: SEOPageInput) {
    return schemaGenerator.generate(input);
  }

  clearCache(): void {
    cache.clear();
  }
}

export const metadataGenerator = new MetadataGenerator();
