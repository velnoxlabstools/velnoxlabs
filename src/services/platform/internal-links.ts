import { getTool, getRelatedForTool } from '@/services/tools';
import { findCategoryById } from '@/services/categories';

export interface InternalLink {
  href: string;
  label: string;
  rel?: string;
}

/**
 * Build contextual internal links for a tool slug.
 */
export function getToolInternalLinks(slug: string): InternalLink[] {
  const tool = getTool(slug);
  if (!tool) return [];

  const links: InternalLink[] = [
    { href: '/tools', label: 'All tools' },
  ];

  const cat = findCategoryById(tool.categoryId);
  if (cat) {
    links.push({ href: `/categories/${cat.slug}`, label: cat.name });
  }

  const related = getRelatedForTool(slug, 4);
  if (related) {
    for (const t of related.tools) {
      links.push({ href: `/tools/${t.slug}`, label: t.name });
    }
  }

  return links;
}
