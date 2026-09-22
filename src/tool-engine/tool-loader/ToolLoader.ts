import type { ToolManifest } from '../types/registration';
import { toolRegistry } from '../registry/ToolRegistry';
import { toolRuntimeRegistry } from '../registry/ToolRegistryConnector';
import { toolMetadataResolver } from '../metadata';
import { toolCategoryResolver } from '../categories';
import { toolRouteResolver } from '../routing';

export interface LoadedTool {
  manifest: ToolManifest;
  path: string;
  metadata: ReturnType<typeof toolMetadataResolver.resolve>;
  category: ReturnType<typeof toolCategoryResolver.resolve>;
  hasRuntime: boolean;
}

/**
 * Load a fully resolved tool package for pages / SSR.
 */
export class ToolLoader {
  load(idOrSlug: string): LoadedTool | null {
    const manifest = toolRegistry.get(idOrSlug);
    if (!manifest) return null;

    return {
      manifest,
      path: toolRouteResolver.pathFor(manifest),
      metadata: toolMetadataResolver.resolve(manifest),
      category: toolCategoryResolver.resolve(manifest),
      hasRuntime: toolRuntimeRegistry.has(manifest.slug),
    };
  }

  loadAll(): LoadedTool[] {
    return toolRegistry
      .list()
      .map((m) => this.load(m.slug))
      .filter(Boolean) as LoadedTool[];
  }
}

export const toolLoader = new ToolLoader();
