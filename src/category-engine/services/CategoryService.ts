import type { CategoryNode, CategoryRegistrationInput } from '../types';
import {
  normalizeCategorySlug,
  validateCategoryInput,
  toCategoryNode,
} from '../utils';
import { categoryRegistry } from '../registry';
import { toolCategoryMapper } from '../mapping';
import { clearHomepageCache } from '@/services/home';
import { rebuildSearchIndex } from '@/services/search';

export class CategoryService {
  create(input: CategoryRegistrationInput): { ok: boolean; node?: CategoryNode; errors: string[] } {
    const normalized = { ...input, slug: normalizeCategorySlug(input.slug) };
    const errors = validateCategoryInput(normalized);

    if (normalized.parentId && !categoryRegistry.get(normalized.parentId)) {
      errors.push(`Unknown parentId: ${normalized.parentId}`);
    }

    const existing = categoryRegistry.get(normalized.slug);
    if (existing && existing.id !== normalized.id) {
      errors.push(`Slug already in use: ${normalized.slug}`);
    }

    if (errors.length) return { ok: false, errors };

    const node = toCategoryNode(normalized);
    // Preserve toolIds if updating same id
    const prev = categoryRegistry.get(normalized.id);
    if (prev) node.toolIds = prev.toolIds;

    categoryRegistry.set(node);
    this.propagate();
    return { ok: true, node, errors: [] };
  }

  update(idOrSlug: string, patch: Partial<CategoryRegistrationInput>) {
    const current = categoryRegistry.get(idOrSlug);
    if (!current) return { ok: false, errors: ['Category not found'] };

    return this.create({
      id: current.id,
      slug: patch.slug ?? current.slug,
      name: patch.name ?? current.name,
      description: patch.description ?? current.description,
      parentId: patch.parentId !== undefined ? patch.parentId : current.parentId,
      visibility: patch.visibility ?? current.visibility,
      order: patch.order ?? current.order,
      icon: patch.icon ?? current.icon,
      metadata: patch.metadata ?? current.metadata,
    });
  }

  remove(idOrSlug: string): boolean {
    const node = categoryRegistry.get(idOrSlug);
    if (!node) return false;

    // Unassign tools from this category
    for (const toolId of [...node.toolIds]) {
      toolCategoryMapper.unassign(toolId, node.id);
    }

    // Re-parent children to null (flat) — nested-ready cleanup
    for (const child of categoryRegistry.childrenOf(node.id)) {
      categoryRegistry.set({ ...child, parentId: null });
    }

    categoryRegistry.delete(node.id);
    this.propagate();
    return true;
  }

  assignTool(toolId: string, categoryId: string): boolean {
    const ok = toolCategoryMapper.assign(toolId, categoryId);
    if (ok) this.propagate();
    return ok;
  }

  private propagate(): void {
    try {
      clearHomepageCache();
    } catch {
      /* ignore */
    }
    try {
      rebuildSearchIndex();
    } catch {
      /* ignore */
    }
  }
}

export const categoryService = new CategoryService();
