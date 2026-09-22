import type { CategoryNode } from '../types';
import { APP_NAME } from '@/constants';
import { categoryStatistics } from '../registry/CategoryStatistics';

export class CategoryMetadataResolver {
  resolve(node: CategoryNode) {
    const stats = categoryStatistics.forCategory(node.id);
    return {
      title: node.metadata?.title ?? `${node.name} Tools | ${APP_NAME}`,
      description:
        node.metadata?.description ??
        node.description ??
        `Explore ${stats.toolCount} tools in ${node.name}.`,
      keywords: node.metadata?.keywords ?? [node.name, node.slug, 'tools', APP_NAME],
    };
  }
}

export const categoryMetadataResolver = new CategoryMetadataResolver();
