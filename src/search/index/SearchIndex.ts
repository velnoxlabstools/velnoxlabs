import type { SearchIndexDocument } from '../types';
import { tools as seedTools } from '@/data/tools';
import { categories as seedCategories } from '@/data/categories';

let cache: SearchIndexDocument[] | null = null;
let builtAt = 0;
const TTL = 60_000;

function build(): SearchIndexDocument[] {
  const docs: SearchIndexDocument[] = [
    {
      id: 'page-home',
      type: 'page',
      title: 'Home',
      description: 'VelnoxLabs free online tools',
      href: '/',
      keywords: ['home', 'velnoxlabs'],
      tags: [],
      popularity: 10,
      featured: true,
    },
    {
      id: 'page-tools',
      type: 'page',
      title: 'All tools',
      description: 'Browse every tool',
      href: '/tools',
      keywords: ['tools'],
      tags: [],
      popularity: 20,
      featured: false,
    },
    {
      id: 'page-categories',
      type: 'page',
      title: 'Categories',
      description: 'Browse by category',
      href: '/categories',
      keywords: ['categories'],
      tags: [],
      popularity: 18,
      featured: false,
    },
  ];

  for (const t of seedTools) {
    if (t.status !== 'published') continue;
    docs.push({
      id: `tool-${t.id}`,
      type: 'tool',
      title: t.name,
      description: t.description,
      href: `/tools/${t.slug}`,
      keywords: [t.name, t.slug, ...t.tags],
      categoryId: t.categoryId,
      tags: t.tags,
      popularity: t.usageCount,
      featured: t.featured,
      updatedAt: t.updatedAt,
      createdAt: t.createdAt,
    });
  }

  for (const c of seedCategories) {
    docs.push({
      id: `cat-${c.id}`,
      type: 'category',
      title: c.name,
      description: c.description,
      href: `/categories/${c.slug}`,
      keywords: [c.name, c.slug],
      categoryId: c.id,
      categorySlug: c.slug,
      tags: [c.slug],
      popularity: c.order * 10,
      featured: c.featured,
    });
  }

  return docs;
}

export class SearchIndex {
  getDocuments(): SearchIndexDocument[] {
    if (!cache || Date.now() - builtAt > TTL) {
      cache = build();
      builtAt = Date.now();
    }
    return cache;
  }

  rebuild(): number {
    cache = build();
    builtAt = Date.now();
    return cache.length;
  }

  clearCache(): void {
    cache = null;
    builtAt = 0;
  }
}

export const searchIndex = new SearchIndex();
