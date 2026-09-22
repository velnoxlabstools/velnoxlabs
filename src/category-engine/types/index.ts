export type CategoryVisibility = 'public' | 'featured' | 'hidden' | 'archived';

export interface CategoryNode {
  id: string;
  slug: string;
  name: string;
  description: string;
  parentId?: string | null;
  visibility: CategoryVisibility;
  order: number;
  icon?: string;
  toolIds: string[];
  metadata?: {
    title?: string;
    description?: string;
    keywords?: string[];
  };
}

export interface CategoryStats {
  toolCount: number;
  publishedToolCount: number;
  featuredToolCount: number;
  childCount: number;
}

export interface CategoryRelationGraph {
  categoryId: string;
  toolIds: string[];
  relatedCategoryIds: string[];
  relatedToolIds: string[];
}

export interface CategoryRegistrationInput {
  id: string;
  slug: string;
  name: string;
  description: string;
  parentId?: string | null;
  visibility?: CategoryVisibility;
  order?: number;
  icon?: string;
  metadata?: CategoryNode['metadata'];
}
