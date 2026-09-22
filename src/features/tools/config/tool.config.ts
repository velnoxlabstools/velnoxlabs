import type { ToolEngineConfig } from '@/types/tool-engine';

export const toolPageConfig = {
  pageSize: 24,
  relatedLimit: 6,
  showTags: true,
  showRelated: true,
} as const;

export const defaultToolEngineConfig: ToolEngineConfig = {
  defaultPageSize: 24,
  relatedLimit: 6,
  cacheTtlMs: 60_000,
  publicStatuses: ['published'],
};
