import type { ToolManifest } from '../types/registration';
import { isPubliclyVisible } from '../utils';
import { rebuildSearchIndex } from '@/services/search';

/**
 * Bridges registration events to the platform search index.
 */
export class ToolSearchIndexer {
  /**
   * Rebuild full index from platform data sources.
   * Manifest registration triggers a rebuild so new tools appear in search.
   */
  reindex(): number {
    return rebuildSearchIndex();
  }

  shouldIndex(manifest: ToolManifest): boolean {
    return isPubliclyVisible(manifest.visibility ?? 'public');
  }
}

export const toolSearchIndexer = new ToolSearchIndexer();
