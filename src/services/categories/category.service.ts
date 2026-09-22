import type { Category } from '@/types/tools';
import type {
  CategoryDetail,
  CategoryFilterKey,
  CategoryListParams,
  CategoryListResult,
  CategorySortKey,
} from '@/types/category-page';
import {
  findAllCategories,
  findCategoryBySlug,
  findToolsByCategoryId,
} from './repository';

function applyFilter(items: Category[], filter: CategoryFilterKey = 'all'): Category[] {
  if (filter === 'featured') return items.filter((c) => c.featured);
  if (filter === 'popular') return items.filter((c) => c.popular);
  return items;
}

function applySearch(items: Category[], search?: string): Category[] {
  if (!search?.trim()) return items;
  const q = search.trim().toLowerCase();
  return items.filter(
    (c) =>
      c.name.toLowerCase().includes(q) ||
      c.description.toLowerCase().includes(q) ||
      c.slug.includes(q)
  );
}

function applySort(items: Category[], sort: CategorySortKey = 'order'): Category[] {
  const list = [...items];
  switch (sort) {
    case 'name':
      return list.sort((a, b) => a.name.localeCompare(b.name));
    case 'toolCount':
      return list.sort((a, b) => b.toolCount - a.toolCount);
    case 'newest':
      return list.sort((a, b) => b.order - a.order);
    case 'order':
    default:
      return list.sort((a, b) => a.order - b.order);
  }
}

export function listCategories(params: CategoryListParams = {}): CategoryListResult {
  const pageSize = params.pageSize ?? 12;
  const page = Math.max(1, params.page ?? 1);

  let items = findAllCategories();
  items = applyFilter(items, params.filter);
  items = applySearch(items, params.search);
  items = applySort(items, params.sort);

  const total = items.length;
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const start = (page - 1) * pageSize;
  const paged = items.slice(start, start + pageSize);

  return { items: paged, total, page, pageSize, totalPages };
}

export function getFeaturedCategories(limit = 8): Category[] {
  return listCategories({ filter: 'featured', sort: 'order', pageSize: limit }).items;
}

export function getPopularCategories(limit = 8): Category[] {
  return listCategories({ filter: 'popular', sort: 'toolCount', pageSize: limit }).items;
}

export function getCategoryDetail(slug: string): CategoryDetail | null {
  const category = findCategoryBySlug(slug);
  if (!category) return null;

  const categoryTools = findToolsByCategoryId(category.id);
  const related = findAllCategories()
    .filter((c) => c.id !== category.id)
    .sort((a, b) => a.order - b.order)
    .slice(0, 4);

  return {
    category,
    tools: categoryTools,
    related,
    stats: {
      toolCount: categoryTools.length,
      featuredToolCount: categoryTools.filter((t) => t.featured).length,
    },
  };
}

export function getRelatedCategories(categoryId: string, limit = 4): Category[] {
  return findAllCategories()
    .filter((c) => c.id !== categoryId)
    .sort((a, b) => a.order - b.order)
    .slice(0, limit);
}
