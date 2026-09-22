import { categories } from '@/data/categories';
import { tools } from '@/data/tools';
import type { Category, Tool } from '@/types/tools';

export function findAllCategories(): Category[] {
  return [...categories];
}

export function findCategoryBySlug(slug: string): Category | undefined {
  return categories.find((c) => c.slug === slug);
}

export function findCategoryById(id: string): Category | undefined {
  return categories.find((c) => c.id === id);
}

export function findToolsByCategoryId(categoryId: string): Tool[] {
  return tools.filter(
    (t) => t.categoryId === categoryId && t.status === 'published'
  );
}

export function getCategorySlugs(): string[] {
  return categories.map((c) => c.slug);
}
