import type { ContentBlock } from '../types';
import { ContentBlockRenderer } from './ContentBlockRenderer';

export function HowToRenderer({
  steps,
  title = 'How to use',
}: {
  steps: { title: string; body: string }[];
  title?: string;
}) {
  const block: ContentBlock = { type: 'howToUse', title, steps, order: 40 };
  return <ContentBlockRenderer block={block} />;
}
