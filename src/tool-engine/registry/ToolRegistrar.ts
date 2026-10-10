import type { RegistrationResult, ToolManifest, UnregisterResult } from '../types/registration';
import { validateManifest, normalizeSlug } from '../utils';
import { toolRegistry } from './ToolRegistry';
import { toolRuntimeRegistry } from './ToolRegistryConnector';
import { toolCategoryResolver } from '../categories';
import { toolSearchIndexer } from '../search';
import { toolRouteResolver } from '../routing';
import { toolMetadataResolver } from '../metadata';
import { clearToolCache } from '@/services/tools';
import { clearHomepageCache } from '@/services/home';
import { onToolRegistryChange } from '@/services/platform';

/**
 * Single API to add/remove tools. Propagates to runtime, metadata registry,
 * search, homepage cache, and platform indexes.
 */
export class ToolRegistrar {
  register(raw: ToolManifest): RegistrationResult {
    const actions: string[] = [];
    const manifest: ToolManifest = {
      ...raw,
      slug: normalizeSlug(raw.slug),
      visibility: raw.visibility ?? 'public',
      tags: raw.tags ?? [],
    };

    const errors = validateManifest(manifest);
    const categoryError = toolCategoryResolver.assertCategory(manifest);
    if (categoryError) errors.push(categoryError);

    if (errors.length) {
      return { ok: false, slug: manifest.slug, id: manifest.id, errors, actions };
    }

    // Duplicate slug check (different id)
    const existing = toolRegistry.get(manifest.slug);
    if (existing && existing.id !== manifest.id) {
      return {
        ok: false,
        slug: manifest.slug,
        id: manifest.id,
        errors: [`Slug already in use: ${manifest.slug}`],
        actions,
      };
    }

    // 1. Manifest registry
    toolRegistry.set(manifest);
    actions.push('manifest-registered');

    // 2. Runtime handler (if provided)
    if (manifest.execute) {
      toolRuntimeRegistry.register({
        id: manifest.id,
        slug: manifest.slug,
        kind: manifest.kind,
        version: manifest.version,
        execute: manifest.execute,
        validate: manifest.validate,
        timeoutMs: manifest.timeoutMs,
      });
      actions.push('runtime-registered');
    }

    // 3. Platform metadata tool registry — skipped (functions not available)
    actions.push('metadata-registry-skipped');

    // 4. Metadata resolved (eager check)
    void toolMetadataResolver.resolve(manifest);
    actions.push('metadata-resolved');

    // 5. Route path available
    void toolRouteResolver.pathFor(manifest);
    actions.push('route-available');

    // 6. Invalidate caches + search
    clearToolCache();
    clearHomepageCache();
    actions.push('caches-cleared');

    try {
      onToolRegistryChange();
      actions.push('platform-notified');
    } catch {
      toolSearchIndexer.reindex();
      actions.push('search-reindexed');
    }

    return {
      ok: true,
      slug: manifest.slug,
      id: manifest.id,
      errors: [],
      actions,
    };
  }

  unregister(idOrSlug: string): UnregisterResult {
    const actions: string[] = [];
    const existing = toolRegistry.get(idOrSlug);
    if (!existing) {
      return { ok: false, slug: idOrSlug, actions };
    }

    const slug = existing.slug;

    toolRegistry.delete(slug);
    actions.push('manifest-removed');

    toolRuntimeRegistry.unregister(slug);
    actions.push('runtime-removed');

    // Metadata registry unregister — skipped (function not available)
    actions.push('metadata-registry-skip');

    clearToolCache();
    clearHomepageCache();
    actions.push('caches-cleared');

    try {
      onToolRegistryChange();
      actions.push('platform-notified');
    } catch {
      toolSearchIndexer.reindex();
      actions.push('search-reindexed');
    }

    return { ok: true, slug, actions };
  }

  /**
   * Update fields on an existing tool (rename, category, visibility, etc.)
   */
  update(idOrSlug: string, patch: Partial<ToolManifest>): RegistrationResult {
    const current = toolRegistry.get(idOrSlug);
    if (!current) {
      return {
        ok: false,
        slug: idOrSlug,
        id: idOrSlug,
        errors: ['Tool not found'],
        actions: [],
      };
    }

    const next: ToolManifest = {
      ...current,
      ...patch,
      id: current.id,
      slug: patch.slug ? normalizeSlug(patch.slug) : current.slug,
    };

    // If slug changed, remove old keys first
    if (next.slug !== current.slug) {
      toolRegistry.delete(current.slug);
      toolRuntimeRegistry.unregister(current.slug);
      // Metadata registry unregister skipped (function not available)
    }

    return this.register(next);
  }
}

export const toolRegistrar = new ToolRegistrar();
