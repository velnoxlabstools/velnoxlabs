import type { ContentBlock } from '../types';
import { ContentBlockRenderer } from './ContentBlockRenderer';

export function FeatureRenderer({ items, title = 'Key features' }: { items: string[]; title?: string }) {
  const block: ContentBlock = { type: 'keyFeatures', title, items, order: 20 };
  return <ContentBlockRenderer block={block} />;
}
