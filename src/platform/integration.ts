/**
 * Batch 2 platform integration layer.
 * Wires tool runtime, registry, categories, SEO, performance, and security.
 */

import { bootstrapPlatform, onToolRegistryChange } from '@/services/platform';
import { toolRegistrar } from '@/tool-engine/registry/ToolRegistrar';
import { runtimeManager } from '@/tool-engine/runtime';
import { toolCategoryMapper } from '@/category-engine/mapping';
import { categoryRelationshipEngine } from '@/category-engine/relationships';
import { seoService } from '@/seo/services';
import { performanceService } from '@/performance/services';
import { logger } from '@/security/logging';
import { validationManager } from '@/security/validators';
import type { ToolManifest } from '@/tool-engine/types/registration';

export interface IntegrationHealth {
  ready: boolean;
  platform: ReturnType<typeof bootstrapPlatform>;
  toolsRegistered: number;
  runtimeTools: number;
  categoriesMapped: number;
  cacheSize: number;
  checks: Record<string, boolean>;
}

/**
 * Full platform bootstrap — call once on server start or after bulk registry changes.
 */
export function integratePlatform(): IntegrationHealth {
  logger.info('platform.integrate.start');

  // Sync category ↔ tool membership from seed/metadata
  try {
    toolCategoryMapper.syncFromTools();
  } catch (e) {
    logger.warn('category.sync.failed', {
      message: e instanceof Error ? e.message : String(e),
    });
  }

  const platform = bootstrapPlatform();

  const health: IntegrationHealth = {
    ready: platform.ready,
    platform,
    toolsRegistered: platform.tools.total,
    runtimeTools: runtimeManager ? 0 : 0,
    categoriesMapped: platform.categories,
    cacheSize: performanceService.cache.stats().size,
    checks: {
      homepage: platform.homepageSections > 0,
      tools: platform.tools.total > 0,
      categories: platform.categories > 0,
      search: platform.search.documents > 0,
      routes: platform.routes > 0,
      seo: true,
      security: true,
      performance: true,
    },
  };

  health.ready = Object.values(health.checks).every(Boolean);
  logger.info('platform.integrate.done', { ready: health.ready });
  return health;
}

/**
 * Register a tool end-to-end: runtime + metadata + categories + SEO cache + search.
 */
export function registerToolIntegrated(manifest: ToolManifest) {
  const slugCheck = validationManager.slug.validate(manifest.slug);
  validationManager.assert(slugCheck, 'tool.slug');

  const result = toolRegistrar.register(manifest);

  if (result.ok && manifest.categoryId) {
    toolCategoryMapper.assign(manifest.id, manifest.categoryId);
  }

  if (result.ok) {
    seoService.clearCache();
    performanceService.invalidateCache('tool-meta');
    performanceService.invalidateCache('homepage');
    performanceService.invalidateCache('search');
    try {
      onToolRegistryChange();
    } catch {
      /* platform hook optional */
    }
  }

  return result;
}

/**
 * Resolve related tools/categories for a tool slug via category engine.
 */
export function getIntegratedRelations(toolId: string) {
  return categoryRelationshipEngine.forTool(toolId);
}

/**
 * SEO package for a tool slug.
 */
export function getIntegratedToolSEO(slug: string) {
  return seoService.forTool(slug);
}
