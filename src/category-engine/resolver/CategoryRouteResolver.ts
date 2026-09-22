import type { CategoryNode } from '../types';
import { isCategoryPublic } from '../utils';

export class CategoryRouteResolver {
  pathFor(node: CategoryNode): string {
    return `/categories/${node.slug}`;
  }

  shouldIndex(node: CategoryNode): boolean {
    return isCategoryPublic(node.visibility);
  }

  breadcrumb(node: CategoryNode, parent?: CategoryNode | null) {
    const items = [
      { label: 'Home', href: '/' },
      { label: 'Categories', href: '/categories' },
    ];
    if (parent) {
      items.push({ label: parent.name, href: this.pathFor(parent) });
    }
    items.push({ label: node.name, href: this.pathFor(node) });
    return items;
  }
}

export const categoryRouteResolver = new CategoryRouteResolver();
