import type { SearchDocument } from '@/types/search';
import { getToolRegistry } from '@/services/tools';
import { findAllCategories } from '@/services/categories';
import { isPublicStatus } from '@/validation/tool';

const STATIC_PAGES: SearchDocument[] = [
  {
    id: 'page-home',
    type: 'page',
    title: 'Home',
    description: 'VelnoxLabs free online tools',
    href: '/',
    tags: ['home'],
    weight: 5,
    keywords: ['home', 'velnoxlabs'],
  },
  {
    id: 'page-tools',
    type: 'page',
    title: 'All tools',
    description: 'Browse every tool on VelnoxLabs',
    href: '/tools',
    tags: ['tools'],
    weight: 8,
    keywords: ['tools', 'catalog'],
  },
  {
    id: 'page-categories',
    type: 'page',
    title: 'Categories',
    description: 'Browse tools by category',
    href: '/categories',
    tags: ['categories'],
    weight: 8,
    keywords: ['categories', 'browse'],
  },
];

/**
 * Build search index from tools, categories, and static pages.
 * Rebuild whenever registry changes.
 */
export function buildSearchIndex(): SearchDocument[] {
  const docs: SearchDocument[] = [...STATIC_PAGES];

  for (const tool of getToolRegistry()) {
    if (!isPublicStatus(tool.status)) continue;
    docs.push({
      id: `tool-${tool.id}`,
      type: 'tool',
      title: tool.name,
      description: tool.description,
      href: `/tools/${tool.slug}`,
      tags: tool.tags,
      categoryId: tool.categoryId,
      weight:
        10 +
        (tool.featured ? 5 : 0) +
        (tool.trending ? 3 : 0) +
        (tool.popular ? 2 : 0) +
        Math.min(5, Math.floor(tool.usageCount / 5000)),
      keywords: [tool.name, tool.slug, ...tool.tags],
    });
  }

  for (const cat of findAllCategories()) {
    docs.push({
      id: `cat-${cat.id}`,
      type: 'category',
      title: cat.name,
      description: cat.description,
      href: `/categories/${cat.slug}`,
      tags: [cat.slug],
      categoryId: cat.id,
      weight: 9 + (cat.featured ? 3 : 0) + (cat.popular ? 2 : 0),
      keywords: [cat.name, cat.slug],
    });
  }

  return docs;
}
