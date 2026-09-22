import type { Category, Tool } from './tools';

export type CategorySortKey = 'order' | 'name' | 'toolCount' | 'newest';
export type CategoryFilterKey = 'all' | 'featured' | 'popular';

export interface CategoryListParams {
  sort?: CategorySortKey;
  filter?: CategoryFilterKey;
  page?: number;
  pageSize?: number;
  search?: string;
}

export interface CategoryListResult {
  items: Category[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export interface CategoryDetail {
  category: Category;
  tools: Tool[];
  related: Category[];
  stats: {
    toolCount: number;
    featuredToolCount: number;
  };
}

export interface CategoryPageConfig {
  pageSize: number;
  defaultSort: CategorySortKey;
  showSidebar: boolean;
  showFilters: boolean;
  relatedLimit: number;
}
