import type { ToolManifest } from '../types/registration';
import { findCategoryById } from '@/services/categories';

export class ToolCategoryResolver {
  resolve(manifest: ToolManifest) {
    return findCategoryById(manifest.categoryId) ?? null;
  }

  assertCategory(manifest: ToolManifest): string | null {
    const cat = this.resolve(manifest);
    if (!cat) return `Unknown categoryId: ${manifest.categoryId}`;
    return null;
  }
}

export const toolCategoryResolver = new ToolCategoryResolver();
