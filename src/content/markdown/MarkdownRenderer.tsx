import { markdownToSafeHtml, extractToc } from '../utils';

interface MarkdownRendererProps {
  content: string;
  showToc?: boolean;
}

export function MarkdownRenderer({ content, showToc = false }: MarkdownRendererProps) {
  const html = markdownToSafeHtml(content);
  const toc = showToc ? extractToc(content) : [];

  return (
    <div className="content-markdown">
      {showToc && toc.length > 0 && (
        <nav aria-label="Table of contents" style={{ marginBottom: 'var(--space-6)' }}>
          <strong style={{ fontSize: 'var(--font-size-sm)' }}>On this page</strong>
          <ol style={{ margin: 'var(--space-2) 0 0', paddingLeft: 'var(--space-5)' }}>
            {toc.map((item, i) => (
              <li key={i} style={{ marginLeft: (item.level - 1) * 12 }}>
                {item.text}
              </li>
            ))}
          </ol>
        </nav>
      )}
      <div
        style={{
          fontSize: 'var(--font-size-sm)',
          lineHeight: 'var(--line-height-relaxed)',
          color: 'var(--foreground)',
        }}
        dangerouslySetInnerHTML={{ __html: html }}
      />
    </div>
  );
}
