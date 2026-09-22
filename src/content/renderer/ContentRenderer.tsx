import type { ToolContentDocument } from '../types';
import { sortBlocks } from '../utils';
import { ContentBlockRenderer } from './ContentBlockRenderer';
import { MarkdownRenderer } from '../markdown';

interface ContentRendererProps {
  document: ToolContentDocument;
}

export function ContentRenderer({ document }: ContentRendererProps) {
  const blocks = sortBlocks(document.blocks);

  return (
    <article style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-8)' }}>
      {document.markdown ? <MarkdownRenderer content={document.markdown} showToc /> : null}
      {blocks.map((block, i) => (
        <ContentBlockRenderer key={`${block.type}-${i}`} block={block} />
      ))}
    </article>
  );
}
