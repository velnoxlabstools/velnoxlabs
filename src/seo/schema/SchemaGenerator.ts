import type { JsonLdGraph, SEOPageInput } from '../types';
import { absoluteUrl } from '../utils';
import { organizationSchema } from './OrganizationSchema';
import { websiteSchema } from './WebsiteSchema';
import { breadcrumbSchema } from './BreadcrumbSchema';
import { faqSchema } from './FAQSchema';
import { softwareApplicationSchema } from './SoftwareSchema';
import { categoryCollectionSchema } from './CategorySchema';

export class SchemaGenerator {
  generate(input: SEOPageInput): JsonLdGraph {
    const graph: Record<string, unknown>[] = [
      organizationSchema(),
      websiteSchema(),
    ];

    graph.push({
      '@type': 'WebPage',
      '@id': `${absoluteUrl(input.path)}#webpage`,
      url: absoluteUrl(input.path),
      name: input.title,
      description: input.description,
      isPartOf: { '@id': `${absoluteUrl('/')}#website` },
    });

    if (input.breadcrumbs?.length) {
      const crumbs = breadcrumbSchema(input.breadcrumbs);
      if (crumbs) graph.push(crumbs);
    }

    if (input.faqs?.length) {
      const faq = faqSchema(input.faqs);
      if (faq) graph.push(faq);
    }

    if (input.tool) {
      graph.push(
        softwareApplicationSchema({
          name: input.tool.name,
          description: input.tool.description,
          path: input.path,
          category: input.tool.category,
          version: input.tool.version,
        })
      );
    }

    if (input.category) {
      graph.push(
        categoryCollectionSchema({
          name: input.category.name,
          description: input.category.description,
          path: input.path,
          toolCount: input.category.toolCount,
        })
      );
    }

    return {
      '@context': 'https://schema.org',
      '@graph': graph,
    };
  }
}

export const schemaGenerator = new SchemaGenerator();
