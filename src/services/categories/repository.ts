import { categories, getCategoryToolCount } from '@/data/categories';
import { tools } from '@/data/tools';
import type { Category, Tool } from '@/types/tools';

export function findAllCategories(): Category[] {
  return [...categories];
}

export function findCategoryBySlug(slug: string): Category | undefined {
  const normalized = slug.replace(/^cat-/, '');
  return categories.find((c) => c.slug === normalized || c.slug === slug);
}

export function findCategoryById(id: string): Category | undefined {
  const normalized = id.startsWith('cat-') ? id : `cat-${id}`;
  return categories.find((c) => c.id === id || c.id === normalized || c.slug === id);
}

export function findToolsByCategoryId(categoryId: string): Tool[] {
  const normalized = categoryId.startsWith('cat-') ? categoryId : `cat-${categoryId}`;
  return tools.filter(
    (t) => (t.categoryId === categoryId || t.categoryId === normalized) && t.status === 'published'
  );
}

export function getCategorySlugs(): string[] {
  return categories.map((c) => c.slug);
}

export { getCategoryToolCount };
