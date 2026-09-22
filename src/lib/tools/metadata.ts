import type { ToolConfig, ToolMetadata } from '@/types/tool-engine';
import { APP_NAME } from '@/constants';

export function buildToolMetadata(tool: ToolConfig): ToolMetadata {
  const base: ToolMetadata = {
    title: tool.metadata?.title ?? `${tool.name} | ${APP_NAME}`,
    description: tool.metadata?.description ?? tool.description,
    keywords: tool.metadata?.keywords ?? [
      tool.name,
      ...tool.tags,
      'online tool',
      'free',
      APP_NAME,
    ],
    ogImage: tool.metadata?.ogImage,
    noIndex: tool.metadata?.noIndex ?? tool.status !== 'published',
  };
  return base;
}
