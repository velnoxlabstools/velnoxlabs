import type { ToolConfig } from '@/types/tool-engine';
import { getToolRegistry } from './registry';

export function findAllTools(): ToolConfig[] {
  return [...getToolRegistry()];
}

export function findToolBySlug(slug: string): ToolConfig | undefined {
  return getToolRegistry().find((t) => t.slug === slug);
}

export function findToolById(id: string): ToolConfig | undefined {
  return getToolRegistry().find((t) => t.id === id);
}

export function findToolsByCategoryId(categoryId: string): ToolConfig[] {
  return getToolRegistry().filter((t) => t.categoryId === categoryId);
}

export function findToolsByTag(tag: string): ToolConfig[] {
  const q = tag.toLowerCase();
  return getToolRegistry().filter((t) => t.tags.some((x) => x.toLowerCase() === q));
}

export function getToolSlugs(): string[] {
  return getToolRegistry().map((t) => t.slug);
}

export function getToolIds(): string[] {
  return getToolRegistry().map((t) => t.id);
}
