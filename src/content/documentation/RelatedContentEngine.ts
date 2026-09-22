import type { ContentBlock } from '../types';

export class RelatedContentEngine {
  toolsBlock(links: { label: string; href: string }[]): ContentBlock {
    return { type: 'relatedTools', title: 'Related tools', links, order: 80 };
  }

  categoriesBlock(links: { label: string; href: string }[]): ContentBlock {
    return { type: 'relatedCategories', title: 'Related categories', links, order: 85 };
  }
}

export const relatedContentEngine = new RelatedContentEngine();
