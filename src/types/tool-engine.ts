import type { ToolStatus } from './tools';

/** Extended status including hidden/deprecated for engine lifecycle */
export type ToolLifecycleStatus = ToolStatus | 'hidden' | 'deprecated';

export interface ToolMetadata {
  title: string;
  description: string;
  keywords: string[];
  ogImage?: string;
  noIndex?: boolean;
}

export interface ToolVersion {
  version: string;
  releasedAt: string;
  changelog?: string;
}

export interface ToolConfig {
  id: string;
  slug: string;
  name: string;
  description: string;
  categoryId: string;
  tags: string[];
  status: ToolLifecycleStatus;
  featured: boolean;
  trending: boolean;
  popular: boolean;
  isNew: boolean;
  usageCount: number;
  createdAt: string;
  updatedAt: string;
  icon?: string;
  version?: ToolVersion;
  metadata?: Partial<ToolMetadata>;
  relatedToolIds?: string[];
  collectionIds?: string[];
}

export interface ToolStats {
  total: number;
  published: number;
  draft: number;
  featured: number;
  trending: number;
  popular: number;
  isNew: number;
  byCategory: Record<string, number>;
}

export type ToolSortKey =
  | 'name'
  | 'usage'
  | 'newest'
  | 'updated'
  | 'featured';

export interface ToolListParams {
  categoryId?: string;
  categorySlug?: string;
  tag?: string;
  status?: ToolLifecycleStatus | 'published';
  featured?: boolean;
  trending?: boolean;
  popular?: boolean;
  isNew?: boolean;
  search?: string;
  sort?: ToolSortKey;
  page?: number;
  pageSize?: number;
}

export interface ToolListResult {
  items: ToolConfig[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export interface RelatedToolsResult {
  tools: ToolConfig[];
  reason: 'same-category' | 'shared-tags' | 'explicit' | 'mixed';
}

export interface ToolEngineConfig {
  defaultPageSize: number;
  relatedLimit: number;
  cacheTtlMs: number;
  publicStatuses: ToolLifecycleStatus[];
}
