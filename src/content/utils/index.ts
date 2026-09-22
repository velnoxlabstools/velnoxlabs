import type { ContentBlock } from '../types';

export function sortBlocks(blocks: ContentBlock[]): ContentBlock[] {
  return [...blocks]
    .filter((b) => b.enabled !== false)
    .sort((a, b) => (a.order ?? 100) - (b.order ?? 100));
}

export function markdownToSafeHtml(md: string): string {
  let html = md
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
  html = html.replace(/^### (.+)$/gm, '<h3>$1</h3>');
  html = html.replace(/^## (.+)$/gm, '<h2>$1</h2>');
  html = html.replace(/^# (.+)$/gm, '<h1>$1</h1>');
  html = html.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');
  html = html.replace(/\*(.+?)\*/g, '<em>$1</em>');
  html = html.replace(/`([^`]+)`/g, '<code>$1</code>');
  html = html.replace(/^\s*[-*] (.+)$/gm, '<li>$1</li>');
  html = html.replace(/(<li>.*<\/li>\n?)+/g, (m) => `<ul>${m}</ul>`);
  html = html.replace(/```([\s\S]*?)```/g, '<pre><code>$1</code></pre>');
  html = html.replace(/^(?!<[hupol]|<li|<pre|<ul)(.+)$/gm, '<p>$1</p>');
  html = html.replace(/&lt;script[\s\S]*?&lt;\/script&gt;/gi, '');
  return html;
}

export function extractToc(markdown: string): { level: number; text: string }[] {
  const toc: { level: number; text: string }[] = [];
  for (const line of markdown.split('\n')) {
    const m = /^(#{1,3})\s+(.+)$/.exec(line.trim());
    if (m) toc.push({ level: m[1].length, text: m[2].trim() });
  }
  return toc;
}
