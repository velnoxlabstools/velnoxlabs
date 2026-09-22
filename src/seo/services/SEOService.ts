import type { Metadata } from 'next';
import type { SEOPageInput } from '../types';
import { metadataGenerator } from '../metadata';
import { getToolWithMeta } from '@/services/tools';
import { getCategoryDetail } from '@/services/categories';
import { sitemapGenerator } from '../sitemap';
import { dynamicRobots } from '../robots';

export class SEOService {
  forPath(input: SEOPageInput): Metadata {
    return metadataGenerator.toNextMetadata(input);
  }

  jsonLd(input: SEOPageInput) {
    return metadataGenerator.toJsonLd(input);
  }

  forTool(slug: string): { metadata: Metadata; jsonLd: ReturnType<typeof metadataGenerator.toJsonLd> } | null {
    const payload = getToolWithMeta(slug);
    if (!payload) return null;

    const { tool, category, metadata: toolMeta } = payload;
    const input: SEOPageInput = {
      title: toolMeta.title,
      description: toolMeta.description,
      path: `/tools/${tool.slug}`,
      keywords: toolMeta.keywords,
      type: 'tool',
      noIndex: toolMeta.noIndex,
      breadcrumbs: [
        { name: 'Home', path: '/' },
        { name: 'Tools', path: '/tools' },
        ...(category
          ? [{ name: category.name, path: `/categories/${category.slug}` }]
          : []),
        { name: tool.name, path: `/tools/${tool.slug}` },
      ],
      tool: {
        name: tool.name,
        description: tool.description,
        category: category?.name,
        version: tool.version?.version,
      },
    };

    return {
      metadata: metadataGenerator.toNextMetadata(input),
      jsonLd: metadataGenerator.toJsonLd(input),
    };
  }

  forCategory(slug: string) {
    const detail = getCategoryDetail(slug);
    if (!detail) return null;

    const { category, stats } = detail;
    const input: SEOPageInput = {
      title: `${category.name} Tools`,
      description: category.description,
      path: `/categories/${category.slug}`,
      keywords: [category.name, category.slug, 'tools'],
      type: 'category',
      breadcrumbs: [
        { name: 'Home', path: '/' },
        { name: 'Categories', path: '/categories' },
        { name: category.name, path: `/categories/${category.slug}` },
      ],
      category: {
        name: category.name,
        description: category.description,
        toolCount: stats.toolCount,
      },
    };

    return {
      metadata: metadataGenerator.toNextMetadata(input),
      jsonLd: metadataGenerator.toJsonLd(input),
    };
  }

  sitemap() {
    return sitemapGenerator.generate();
  }

  robotsTxt() {
    return dynamicRobots.generateTxt();
  }

  clearCache() {
    metadataGenerator.clearCache();
  }
}

export const seoService = new SEOService();
