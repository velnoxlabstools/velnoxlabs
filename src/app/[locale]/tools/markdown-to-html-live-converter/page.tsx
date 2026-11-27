'use client';

import React, { useState, useMemo, useCallback } from 'react';
import { useTranslations } from 'next-intl';
import { GlobalContainer } from '@/components/layout';
import { SectionHeading } from '@/components/ui';
import { ToolSeoContent } from '@/features/tools/sections/ToolSeoContent';
import {
  Eye,
  Code2,
  Copy,
  Check,
  Download,
  ArrowRightLeft,
  FileText,
  Trash2,
  List,
} from 'lucide-react';

type ModeTab = 'md-to-html' | 'html-to-md';
type ViewOutput = 'preview' | 'code';

function escapeHtml(str: string): string {
  return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

function slugify(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

function processInline(text: string): string {
  let out = escapeHtml(text);

  // 1. Inline code: `code`
  out = out.replace(/`([^`]+)`/g, '<code class="inline-code">$1</code>');

  // 2. Images: ![alt](url)
  out = out.replace(
    /!\[([^\]]*)\]\(([^)]+)\)/g,
    '<img src="$2" alt="$1" style="max-width:100%;border-radius:8px;margin:8px 0;" />'
  );

  // 3. Links: [text](url)
  out = out.replace(
    /\[([^\]]+)\]\(([^)]+)\)/g,
    '<a href="$2" target="_blank" rel="noopener noreferrer" style="color:#2563eb;text-decoration:underline;">$1</a>'
  );

  // 4. Bold: **text** or __text__
  out = out.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');
  out = out.replace(/__(.+?)__/g, '<strong>$1</strong>');

  // 5. Italic: *text* or _text_
  out = out.replace(/\*(.+?)\*/g, '<em>$1</em>');
  out = out.replace(/_(.+?)_/g, '<em>$1</em>');

  // 6. Strikethrough: ~~text~~
  out = out.replace(/~~(.+?)~~/g, '<del style="color:#94a3b8;">$1</del>');

  // 7. Highlight: ==text==
  out = out.replace(
    /==(.+?)==/g,
    '<mark style="background-color:#fef08a;padding:1px 4px;border-radius:4px;">$1</mark>'
  );

  return out;
}

// Robust GitHub Flavored Markdown (GFM) to HTML parser supporting tables & task lists
function markdownToHtml(md: string): string {
  if (!md.trim()) return '';

  // Step 1: Extract fenced code blocks
  const codeBlocks: string[] = [];
  const working = md.replace(/```(\w*)\n([\s\S]*?)```/g, (_match, lang, code) => {
    const placeholder = `\n__CODEBLOCK_${codeBlocks.length}__\n`;
    const langClass = lang ? ` class="language-${lang}"` : '';
    const highlighted = `<pre style="background:var(--bg-page);border:1px solid var(--border-color);border-radius:8px;padding:14px;overflow-x:auto;margin:12px 0;"><code${langClass} style="font-family:monospace;font-size:0.88rem;color:var(--text-main);">${escapeHtml(code.replace(/\n$/, ''))}</code></pre>`;
    codeBlocks.push(highlighted);
    return placeholder;
  });

  const lines = working.split('\n');
  const output: string[] = [];
  let listType: 'ul' | 'ol' | null = null;
  let paragraphBuffer: string[] = [];
  let inTable = false;
  let tableHeader: string[] = [];
  let tableAlignments: string[] = [];
  let tableRows: string[][] = [];

  const flushParagraph = () => {
    if (paragraphBuffer.length > 0) {
      const joined = paragraphBuffer.map((l) => processInline(l.trim())).join('<br />\n');
      if (joined)
        output.push(
          `<p style="margin:8px 0;line-height:1.65;color:var(--text-main);">${joined}</p>`
        );
      paragraphBuffer = [];
    }
  };

  const closeList = () => {
    if (listType) {
      output.push(listType === 'ul' ? '</ul>' : '</ol>');
      listType = null;
    }
  };

  const flushTable = () => {
    if (inTable && tableHeader.length > 0) {
      let tableHtml =
        '<div style="overflow-x:auto;margin:16px 0;"><table style="width:100%;border-collapse:collapse;border:1px solid var(--border-color);border-radius:8px;overflow:hidden;font-size:0.9rem;"><thead><tr style="background:rgba(59, 130, 246, 0.08);border-bottom:2px solid var(--border-color);">';
      tableHeader.forEach((th, i) => {
        const align = tableAlignments[i] || 'left';
        tableHtml += `<th style="padding:10px 14px;text-align:${align};font-weight:600;color:var(--text-main);">${processInline(th)}</th>`;
      });
      tableHtml += '</tr></thead><tbody>';

      tableRows.forEach((row, rIdx) => {
        const bg = rIdx % 2 === 1 ? 'background:rgba(255,255,255,0.02);' : '';
        tableHtml += `<tr style="border-bottom:1px solid var(--border-color);${bg}">`;
        row.forEach((cell, cIdx) => {
          const align = tableAlignments[cIdx] || 'left';
          tableHtml += `<td style="padding:10px 14px;text-align:${align};color:var(--text-main);">${processInline(cell)}</td>`;
        });
        tableHtml += '</tr>';
      });

      tableHtml += '</tbody></table></div>';
      output.push(tableHtml);

      inTable = false;
      tableHeader = [];
      tableAlignments = [];
      tableRows = [];
    }
  };

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const trimmed = line.trim();

    // Code block placeholder
    const codeMatch = line.match(/^__CODEBLOCK_(\d+)__$/);
    if (codeMatch) {
      flushParagraph();
      closeList();
      flushTable();
      output.push(codeBlocks[parseInt(codeMatch[1])]);
      continue;
    }

    // GFM Table parsing
    if (trimmed.startsWith('|') && trimmed.endsWith('|')) {
      const cells = trimmed
        .slice(1, -1)
        .split('|')
        .map((c) => c.trim());

      // If next line is separator row (e.g. |:---|---:|) and not already in table
      if (
        !inTable &&
        i + 1 < lines.length &&
        lines[i + 1].trim().startsWith('|') &&
        /^\|[\s:-|-]+\|$/.test(lines[i + 1].trim())
      ) {
        flushParagraph();
        closeList();
        inTable = true;
        tableHeader = cells;

        // Parse alignments
        const sepCells = lines[i + 1]
          .trim()
          .slice(1, -1)
          .split('|')
          .map((c) => c.trim());

        tableAlignments = sepCells.map((s) => {
          if (s.startsWith(':') && s.endsWith(':')) return 'center';
          if (s.endsWith(':')) return 'right';
          return 'left';
        });

        i++; // skip separator line
        continue;
      }

      if (inTable) {
        tableRows.push(cells);
        continue;
      }
    } else if (inTable) {
      flushTable();
    }

    // Empty line -> flush
    if (!trimmed) {
      flushParagraph();
      closeList();
      flushTable();
      continue;
    }

    // Heading: # through ######
    const headingMatch = line.match(/^(#{1,6})\s+(.*)$/);
    if (headingMatch) {
      flushParagraph();
      closeList();
      flushTable();
      const level = headingMatch[1].length;
      const text = headingMatch[2];
      const headingId = slugify(text);
      output.push(
        `<h${level} id="${headingId}" style="margin:20px 0 10px 0;font-weight:700;color:var(--text-main);">${processInline(text)}</h${level}>`
      );
      continue;
    }

    // Horizontal rule: --- or *** or ___
    if (/^(\-{3,}|\*{3,}|_{3,})$/.test(trimmed)) {
      flushParagraph();
      closeList();
      flushTable();
      output.push(
        '<hr style="border:none;border-top:1px solid var(--border-color);margin:24px 0;" />'
      );
      continue;
    }

    // Blockquote: > text
    const bqMatch = line.match(/^>\s?(.*)$/);
    if (bqMatch) {
      flushParagraph();
      closeList();
      flushTable();
      output.push(
        `<blockquote style="border-left:4px solid #3b82f6;padding:8px 16px;margin:12px 0;background:rgba(59, 130, 246, 0.05);border-radius:0 8px 8px 0;color:var(--text-muted);font-style:italic;">${processInline(bqMatch[1])}</blockquote>`
      );
      continue;
    }

    // Task List Item: - [ ] or - [x]
    const taskMatch = line.match(/^[-*+]\s+\[([ xX])\]\s+(.*)$/);
    if (taskMatch) {
      flushParagraph();
      flushTable();
      if (listType !== 'ul') {
        closeList();
        output.push('<ul style="padding-left:24px;margin:10px 0;list-style:none;">');
        listType = 'ul';
      }
      const checked = taskMatch[1].toLowerCase() === 'x';
      const checkInput = checked
        ? '<input type="checkbox" checked disabled style="margin-right:8px;accent-color:#10b981;" />'
        : '<input type="checkbox" disabled style="margin-right:8px;" />';
      output.push(
        `<li style="margin:4px 0;display:flex;align-items:center;color:var(--text-main);">${checkInput} <span>${processInline(taskMatch[2])}</span></li>`
      );
      continue;
    }

    // Unordered list: -, *, +
    const ulMatch = line.match(/^[-*+]\s+(.*)$/);
    if (ulMatch) {
      flushParagraph();
      flushTable();
      if (listType !== 'ul') {
        closeList();
        output.push('<ul style="padding-left:24px;margin:10px 0;color:var(--text-main);">');
        listType = 'ul';
      }
      output.push(`<li style="margin:4px 0;">${processInline(ulMatch[1])}</li>`);
      continue;
    }

    // Ordered list: 1. 2. 3.
    const olMatch = line.match(/^\d+\.\s+(.*)$/);
    if (olMatch) {
      flushParagraph();
      flushTable();
      if (listType !== 'ol') {
        closeList();
        output.push('<ol style="padding-left:24px;margin:10px 0;color:var(--text-main);">');
        listType = 'ol';
      }
      output.push(`<li style="margin:4px 0;">${processInline(olMatch[1])}</li>`);
      continue;
    }

    // Normal line -> buffer as paragraph
    closeList();
    flushTable();
    paragraphBuffer.push(line);
  }

  flushParagraph();
  closeList();
  flushTable();

  return output.join('\n');
}

// Reverse Converter: HTML to Clean Markdown
function htmlToMarkdown(html: string): string {
  if (!html.trim()) return '';

  let md = html;

  // Clean script & style tags
  md = md.replace(/<script[\s\S]*?<\/script>/gi, '');
  md = md.replace(/<style[\s\S]*?<\/style>/gi, '');

  // Pre / Code blocks
  md = md.replace(
    /<pre[^>]*><code(?: class="language-(\w+)")?[^>]*>([\s\S]*?)<\/code><\/pre>/gi,
    (_match, lang, code) => {
      const unescaped = code.replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&amp;/g, '&');
      return '\n\n```' + (lang || '') + '\n' + unescaped.trim() + '\n```\n\n';
    }
  );

  // Inline Code
  md = md.replace(/<code[^>]*>([\s\S]*?)<\/code>/gi, '`$1`');

  // Headings
  md = md.replace(/<h1[^>]*>([\s\S]*?)<\/h1>/gi, '\n\n# $1\n\n');
  md = md.replace(/<h2[^>]*>([\s\S]*?)<\/h2>/gi, '\n\n## $1\n\n');
  md = md.replace(/<h3[^>]*>([\s\S]*?)<\/h3>/gi, '\n\n### $1\n\n');
  md = md.replace(/<h4[^>]*>([\s\S]*?)<\/h4>/gi, '\n\n#### $1\n\n');
  md = md.replace(/<h5[^>]*>([\s\S]*?)<\/h5>/gi, '\n\n##### $1\n\n');
  md = md.replace(/<h6[^>]*>([\s\S]*?)<\/h6>/gi, '\n\n###### $1\n\n');

  // Horizontal Rule
  md = md.replace(/<hr\s*\/?>/gi, '\n\n---\n\n');

  // Blockquote
  md = md.replace(/<blockquote[^>]*>([\s\S]*?)<\/blockquote>/gi, (_match, content) => {
    const clean = content.replace(/<[^>]+>/g, '').trim();
    return `\n\n> ${clean}\n\n`;
  });

  // Bold & Italic
  md = md.replace(/<(?:strong|b)>([\s\S]*?)<\/(?:strong|b)>/gi, '**$1**');
  md = md.replace(/<(?:em|i)>([\s\S]*?)<\/(?:em|i)>/gi, '*$1*');
  md = md.replace(/<(?:del|s|strike)>([\s\S]*?)<\/(?:del|s|strike)>/gi, '~~$1~~');
  md = md.replace(/<mark>([\s\S]*?)<\/mark>/gi, '==$1==');

  // Links & Images
  md = md.replace(/<a[^>]*href="([^"]+)"[^>]*>([\s\S]*?)<\/a>/gi, '[$2]($1)');
  md = md.replace(/<img[^>]*src="([^"]+)"[^>]*alt="([^"]*)"[^>]*\/?>/gi, '![$2]($1)');
  md = md.replace(/<img[^>]*alt="([^"]*)"[^>]*src="([^"]+)"[^>]*\/?>/gi, '![$1]($2)');

  // List Items
  md = md.replace(/<li[^>]*>([\s\S]*?)<\/li>/gi, '- $1\n');
  md = md.replace(/<ul[^>]*>/gi, '\n');
  md = md.replace(/<\/ul>/gi, '\n');
  md = md.replace(/<ol[^>]*>/gi, '\n');
  md = md.replace(/<\/ol>/gi, '\n');

  // Paragraphs & Line Breaks
  md = md.replace(/<p[^>]*>([\s\S]*?)<\/p>/gi, '\n\n$1\n\n');
  md = md.replace(/<br\s*\/?>/gi, '\n');

  // Strip remaining HTML tags
  md = md.replace(/<[^>]+>/g, '');

  // Decode common HTML entities
  md = md
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&nbsp;/g, ' ');

  // Collapse triple newlines
  md = md.replace(/\n{3,}/g, '\n\n').trim();

  return md;
}

export default function MarkdownToHtmlPage() {
  const tUI = useTranslations('ToolUI.markdownToHtml');

  const [activeTab, setActiveTab] = useState<ModeTab>('md-to-html');
  const [outputView, setOutputView] = useState<ViewOutput>('preview');

  // Markdown to HTML inputs/outputs
  const [markdownInput, setMarkdownInput] =
    useState<string>(`# 🚀 AI Markdown to HTML Live Converter

Convert standard and **GitHub Flavored Markdown (GFM)** into clean HTML or copy directly as **Rich Text** for Google Docs & Gmail!

## ✨ Feature Comparison Table

| Feature | Free Markdown Tool | Legacy Pandoc CLI |
| :--- | :---: | ---: |
| **Instant Live Preview** | ✅ Real-Time | ❌ Offline Only |
| **Copy as Rich Text (Docs/Gmail)** | ✅ 1-Click | ❌ Unsupported |
| **GFM Tables & Task Lists** | ✅ Native | ⚠️ Needs Extra Flags |
| **Browser Security** | 🔒 100% Client-Side | 🖥️ Local Binary |

### 📋 Interactive Task Checklist
- [x] Full GFM Tables parsing with column alignment
- [x] One-click Rich Text copy for Word & Gmail
- [x] Bi-directional HTML to Markdown reverse converter
- [ ] Export standalone styled HTML document

### 💻 Code Integration Sample
\`\`\`javascript
import { marked } from 'marked';

// Convert Markdown to clean HTML
const html = marked.parse('# Hello World');
console.log(html);
\`\`\`

> *"Markdown allows you to write using an easy-to-read, easy-to-write plain text format, then convert it to structurally valid XHTML (or HTML)."* — **John Gruber**
`);

  const [htmlInput, setHtmlInput] = useState<string>(
    `<h2>Hello from HTML</h2><p>Paste any <strong>HTML snippet</strong> here to convert it back into <em>clean Markdown</em>!</p><ul><li>Automatic lists</li><li>Stripped div bloat</li></ul>`
  );

  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  // Computed Outputs
  const generatedHtml = useMemo(() => markdownToHtml(markdownInput), [markdownInput]);
  const generatedMarkdown = useMemo(() => htmlToMarkdown(htmlInput), [htmlInput]);

  // Copy Raw Text / HTML
  const handleCopyRaw = useCallback((text: string, key: string) => {
    if (!text) return;
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  }, []);

  // Copy as Rich Formatted Text (Paste directly into Google Docs / Word / Gmail)
  const handleCopyRichText = useCallback(async (html: string) => {
    if (!html) return;
    try {
      if (typeof window !== 'undefined' && window.ClipboardItem && navigator.clipboard) {
        const blobHtml = new Blob([html], { type: 'text/html' });
        const blobText = new Blob([html.replace(/<[^>]+>/g, '')], { type: 'text/plain' });
        await navigator.clipboard.write([
          new ClipboardItem({
            'text/html': blobHtml,
            'text/plain': blobText,
          }),
        ]);
        setCopiedKey('rich');
        setTimeout(() => setCopiedKey(null), 2000);
        return;
      }
    } catch {
      // fallback
    }
    navigator.clipboard.writeText(html);
    setCopiedKey('rich');
    setTimeout(() => setCopiedKey(null), 2000);
  }, []);

  // Download Standalone Styled HTML document
  const handleDownloadHtml = useCallback(() => {
    if (!generatedHtml) return;
    const fullDoc = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Converted Markdown Document</title>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif; line-height: 1.6; max-width: 840px; margin: 40px auto; padding: 0 20px; color: #1e293b; background: #ffffff; }
    h1, h2, h3, h4 { color: #0f172a; margin-top: 24px; margin-bottom: 12px; }
    h1 { border-bottom: 2px solid #e2e8f0; padding-bottom: 8px; }
    h2 { border-bottom: 1px solid #e2e8f0; padding-bottom: 6px; }
    code { font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace; background: #f1f5f9; padding: 2px 6px; border-radius: 4px; font-size: 0.9em; }
    pre { background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 16px; overflow-x: auto; }
    pre code { background: none; padding: 0; }
    table { width: 100%; border-collapse: collapse; margin: 20px 0; border: 1px solid #cbd5e1; }
    th, td { border: 1px solid #cbd5e1; padding: 10px 14px; text-align: left; }
    th { background: #f1f5f9; font-weight: 600; }
    blockquote { border-left: 4px solid #3b82f6; margin: 16px 0; padding: 8px 16px; background: #f8fafc; color: #475569; }
    img { max-width: 100%; border-radius: 6px; }
    hr { border: none; border-top: 1px solid #e2e8f0; margin: 32px 0; }
  </style>
</head>
<body>
${generatedHtml}
</body>
</html>`;

    const blob = new Blob([fullDoc], { type: 'text/html;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'converted-document.html';
    link.click();
    URL.revokeObjectURL(url);
  }, [generatedHtml]);

  // Insert Table of Contents (TOC)
  const handleInsertToc = () => {
    const headingLines = markdownInput.split('\n').filter((l) => /^#{1,4}\s+/.test(l));

    if (headingLines.length === 0) return;

    let tocMd = '## 📑 Table of Contents\n\n';
    headingLines.forEach((hl) => {
      const match = hl.match(/^(#{1,4})\s+(.*)$/);
      if (match) {
        const level = match[1].length;
        const text = match[2].trim();
        const indent = '  '.repeat(Math.max(0, level - 2));
        tocMd += `${indent}- [${text}](#${slugify(text)})\n`;
      }
    });

    setMarkdownInput(tocMd + '\n---\n\n' + markdownInput);
  };

  // Sample Presets
  const applyPreset = (type: 'readme' | 'article' | 'table') => {
    if (type === 'readme') {
      setMarkdownInput(`# Project Title

A clean, modern open-source tool built with TypeScript and React.

## 📦 Installation
\`\`\`bash
npm install my-awesome-package
\`\`\`

## 🚀 Quick Start
\`\`\`javascript
import { init } from 'my-awesome-package';
init({ apiKey: 'your_key' });
\`\`\`

## 🌟 Key Features
- [x] Fast & lightweight
- [x] 100% Client-Side Privacy
- [ ] Enterprise plugin support
`);
    } else if (type === 'article') {
      setMarkdownInput(`# The Future of Web Engineering

Modern web applications require high performance, clean typography, and responsive layouts.

## Why Semantic HTML Matters
Writing **semantic HTML** improves accessibility and search engine visibility.

> "Simplicity is prerequisite for reliability." — Edsger W. Dijkstra

### Summary Table
| Topic | Status | Impact |
| :--- | :---: | ---: |
| SEO Optimization | Active | High |
| Code Minification | Ready | Medium |
| Accessibility | Complete | Critical |
`);
    } else if (type === 'table') {
      setMarkdownInput(`## Data Matrix & Pricing

| Plan | Storage | Bandwidth | Price |
| :--- | :---: | :---: | ---: |
| **Starter** | 10 GB | 100 GB | Free |
| **Pro** | 100 GB | 1 TB | $19/mo |
| **Enterprise** | Unlimited | Dedicated | Custom |
`);
    }
  };

  return (
    <GlobalContainer maxWidth="2xl">
      <div style={{ paddingTop: 'var(--space-8)', paddingBottom: 'var(--space-16)' }}>
        <SectionHeading title={tUI('title')} subtitle={tUI('subtitle')} />

        {/* TOP LEVEL NAVIGATION TABS */}
        <div
          style={{
            display: 'flex',
            gap: '8px',
            borderBottom: '1px solid var(--border-color)',
            marginTop: '24px',
            marginBottom: '20px',
          }}
        >
          <button
            type="button"
            onClick={() => setActiveTab('md-to-html')}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              padding: '10px 18px',
              border: 'none',
              background: 'none',
              borderBottom:
                activeTab === 'md-to-html' ? '2px solid #3b82f6' : '2px solid transparent',
              color: activeTab === 'md-to-html' ? '#3b82f6' : 'var(--text-muted)',
              fontWeight: 600,
              fontSize: '0.95rem',
              cursor: 'pointer',
              transition: 'all 0.15s ease',
            }}
          >
            <FileText size={17} />
            Markdown to HTML (Live Preview)
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('html-to-md')}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              padding: '10px 18px',
              border: 'none',
              background: 'none',
              borderBottom:
                activeTab === 'html-to-md' ? '2px solid #10b981' : '2px solid transparent',
              color: activeTab === 'html-to-md' ? '#10b981' : 'var(--text-muted)',
              fontWeight: 600,
              fontSize: '0.95rem',
              cursor: 'pointer',
              transition: 'all 0.15s ease',
            }}
          >
            <ArrowRightLeft size={17} />
            HTML to Markdown (Reverse Converter)
          </button>
        </div>

        {/* TAB 1: MARKDOWN TO HTML CONVERTER */}
        {activeTab === 'md-to-html' && (
          <div
            style={{
              backgroundColor: 'var(--bg-card)',
              border: '1px solid var(--border-color)',
              borderRadius: '16px',
              padding: '24px',
              boxShadow: '0 4px 20px rgba(0, 0, 0, 0.04)',
            }}
          >
            {/* Quick Actions & Presets Bar */}
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                flexWrap: 'wrap',
                gap: '12px',
                marginBottom: '18px',
                paddingBottom: '14px',
                borderBottom: '1px solid var(--border-color)',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 600 }}>
                  Quick Templates:
                </span>
                <button
                  type="button"
                  onClick={() => applyPreset('readme')}
                  style={{
                    backgroundColor: 'var(--bg-page)',
                    border: '1px solid var(--border-color)',
                    borderRadius: '14px',
                    padding: '3px 10px',
                    fontSize: '0.76rem',
                    color: 'var(--text-main)',
                    cursor: 'pointer',
                    fontWeight: 500,
                  }}
                >
                  GitHub README
                </button>
                <button
                  type="button"
                  onClick={() => applyPreset('article')}
                  style={{
                    backgroundColor: 'var(--bg-page)',
                    border: '1px solid var(--border-color)',
                    borderRadius: '14px',
                    padding: '3px 10px',
                    fontSize: '0.76rem',
                    color: 'var(--text-main)',
                    cursor: 'pointer',
                    fontWeight: 500,
                  }}
                >
                  Blog Article
                </button>
                <button
                  type="button"
                  onClick={() => applyPreset('table')}
                  style={{
                    backgroundColor: 'var(--bg-page)',
                    border: '1px solid var(--border-color)',
                    borderRadius: '14px',
                    padding: '3px 10px',
                    fontSize: '0.76rem',
                    color: 'var(--text-main)',
                    cursor: 'pointer',
                    fontWeight: 500,
                  }}
                >
                  GFM Table
                </button>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <button
                  type="button"
                  onClick={handleInsertToc}
                  title="Auto-generate Table of Contents from headings"
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '4px',
                    backgroundColor: 'rgba(59, 130, 246, 0.1)',
                    color: '#2563eb',
                    border: '1px solid rgba(59, 130, 246, 0.25)',
                    borderRadius: '8px',
                    padding: '5px 10px',
                    fontSize: '0.78rem',
                    fontWeight: 600,
                    cursor: 'pointer',
                  }}
                >
                  <List size={13} />
                  Insert TOC
                </button>

                <button
                  type="button"
                  onClick={() => setMarkdownInput('')}
                  title="Clear input"
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '4px',
                    backgroundColor: 'var(--bg-page)',
                    color: 'var(--text-muted)',
                    border: '1px solid var(--border-color)',
                    borderRadius: '8px',
                    padding: '5px 10px',
                    fontSize: '0.78rem',
                    fontWeight: 500,
                    cursor: 'pointer',
                  }}
                >
                  <Trash2 size={13} />
                  Clear
                </button>
              </div>
            </div>

            {/* Split Screen Workspace Grid */}
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
                gap: '20px',
              }}
            >
              {/* Left Column: Markdown Editor */}
              <div>
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    marginBottom: '8px',
                  }}
                >
                  <label
                    style={{ color: 'var(--text-main)', fontSize: '0.85rem', fontWeight: 600 }}
                  >
                    Markdown Input (GFM Supported)
                  </label>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                    {markdownInput.length} chars • {markdownInput.split('\n').length} lines
                  </span>
                </div>
                <textarea
                  value={markdownInput}
                  onChange={(e) => setMarkdownInput(e.target.value)}
                  rows={20}
                  placeholder="Type or paste Markdown here..."
                  style={{
                    width: '100%',
                    backgroundColor: 'var(--bg-page)',
                    border: '1px solid var(--border-color)',
                    borderRadius: '10px',
                    color: 'var(--text-main)',
                    padding: '14px',
                    fontFamily: 'monospace',
                    fontSize: '0.88rem',
                    lineHeight: '1.5',
                    outline: 'none',
                    boxSizing: 'border-box',
                    resize: 'vertical',
                  }}
                />
              </div>

              {/* Right Column: Tri-View Output Hub */}
              <div>
                {/* Output Controls Bar */}
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    marginBottom: '8px',
                    flexWrap: 'wrap',
                    gap: '8px',
                  }}
                >
                  {/* View Switcher: Visual Preview vs HTML Code */}
                  <div
                    style={{
                      display: 'flex',
                      gap: '4px',
                      backgroundColor: 'var(--bg-page)',
                      padding: '2px',
                      borderRadius: '8px',
                      border: '1px solid var(--border-color)',
                    }}
                  >
                    <button
                      type="button"
                      onClick={() => setOutputView('preview')}
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '5px',
                        backgroundColor:
                          outputView === 'preview' ? 'var(--bg-card)' : 'transparent',
                        color: outputView === 'preview' ? '#3b82f6' : 'var(--text-muted)',
                        border: 'none',
                        borderRadius: '6px',
                        padding: '4px 10px',
                        fontSize: '0.78rem',
                        fontWeight: 600,
                        cursor: 'pointer',
                      }}
                    >
                      <Eye size={13} />
                      Visual Preview
                    </button>
                    <button
                      type="button"
                      onClick={() => setOutputView('code')}
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '5px',
                        backgroundColor: outputView === 'code' ? 'var(--bg-card)' : 'transparent',
                        color: outputView === 'code' ? '#10b981' : 'var(--text-muted)',
                        border: 'none',
                        borderRadius: '6px',
                        padding: '4px 10px',
                        fontSize: '0.78rem',
                        fontWeight: 600,
                        cursor: 'pointer',
                      }}
                    >
                      <Code2 size={13} />
                      HTML Source
                    </button>
                  </div>

                  {/* Actions: Copy Rich Text, Copy HTML, Download */}
                  <div style={{ display: 'flex', gap: '6px' }}>
                    <button
                      type="button"
                      onClick={() => handleCopyRichText(generatedHtml)}
                      disabled={!generatedHtml}
                      title="Copy formatted rich text to paste directly into Google Docs, Word, or Gmail"
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '4px',
                        backgroundColor:
                          copiedKey === 'rich' ? '#059669' : 'rgba(236, 72, 153, 0.1)',
                        color: copiedKey === 'rich' ? '#ffffff' : '#ec4899',
                        border: '1px solid rgba(236, 72, 153, 0.25)',
                        borderRadius: '6px',
                        padding: '4px 10px',
                        fontSize: '0.75rem',
                        fontWeight: 600,
                        cursor: generatedHtml ? 'pointer' : 'not-allowed',
                      }}
                    >
                      {copiedKey === 'rich' ? <Check size={12} /> : <Copy size={12} />}
                      {copiedKey === 'rich' ? 'Copied Rich Text!' : 'Copy for Docs/Gmail'}
                    </button>

                    <button
                      type="button"
                      onClick={() => handleCopyRaw(generatedHtml, 'html')}
                      disabled={!generatedHtml}
                      title="Copy raw HTML markup"
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '4px',
                        backgroundColor: copiedKey === 'html' ? '#059669' : 'var(--bg-page)',
                        color: copiedKey === 'html' ? '#ffffff' : 'var(--text-main)',
                        border: '1px solid var(--border-color)',
                        borderRadius: '6px',
                        padding: '4px 8px',
                        fontSize: '0.75rem',
                        fontWeight: 600,
                        cursor: generatedHtml ? 'pointer' : 'not-allowed',
                      }}
                    >
                      {copiedKey === 'html' ? <Check size={12} /> : <Copy size={12} />}
                      HTML
                    </button>

                    <button
                      type="button"
                      onClick={handleDownloadHtml}
                      disabled={!generatedHtml}
                      title="Download complete standalone HTML file with modern styling"
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '4px',
                        backgroundColor: 'var(--bg-page)',
                        color: 'var(--text-main)',
                        border: '1px solid var(--border-color)',
                        borderRadius: '6px',
                        padding: '4px 8px',
                        fontSize: '0.75rem',
                        fontWeight: 600,
                        cursor: generatedHtml ? 'pointer' : 'not-allowed',
                      }}
                    >
                      <Download size={12} />
                      .html
                    </button>
                  </div>
                </div>

                {/* Content Display: Rendered Visual View vs Raw HTML Textarea */}
                {outputView === 'preview' ? (
                  <div
                    style={{
                      height: '480px',
                      overflowY: 'auto',
                      backgroundColor: 'var(--bg-page)',
                      border: '1px solid var(--border-color)',
                      borderRadius: '10px',
                      padding: '18px 20px',
                      boxSizing: 'border-box',
                    }}
                  >
                    {!generatedHtml ? (
                      <div
                        style={{
                          color: 'var(--text-muted)',
                          fontStyle: 'italic',
                          padding: '20px',
                          textAlign: 'center',
                        }}
                      >
                        Live formatted HTML preview will render here in real time...
                      </div>
                    ) : (
                      <div
                        dangerouslySetInnerHTML={{ __html: generatedHtml }}
                        style={{ color: 'var(--text-main)' }}
                      />
                    )}
                  </div>
                ) : (
                  <textarea
                    value={generatedHtml}
                    readOnly
                    rows={20}
                    placeholder="HTML markup will appear here..."
                    style={{
                      width: '100%',
                      backgroundColor: 'var(--bg-page)',
                      border: '1px solid var(--border-color)',
                      borderRadius: '10px',
                      color: '#10b981',
                      padding: '14px',
                      fontFamily: 'monospace',
                      fontSize: '0.85rem',
                      lineHeight: '1.5',
                      outline: 'none',
                      boxSizing: 'border-box',
                      resize: 'vertical',
                    }}
                  />
                )}
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: HTML TO MARKDOWN (REVERSE CONVERTER) */}
        {activeTab === 'html-to-md' && (
          <div
            style={{
              backgroundColor: 'var(--bg-card)',
              border: '1px solid var(--border-color)',
              borderRadius: '16px',
              padding: '24px',
              boxShadow: '0 4px 20px rgba(0, 0, 0, 0.04)',
            }}
          >
            <div style={{ marginBottom: '16px' }}>
              <h3
                style={{
                  fontSize: '1.05rem',
                  fontWeight: 600,
                  color: 'var(--text-main)',
                  marginBottom: '4px',
                }}
              >
                Reverse HTML to Clean Markdown Converter
              </h3>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                Paste raw HTML, website source code, or copied rich text. Our sanitizer strips
                nested div tags, inline styles, and class clutter, converting headings, lists,
                links, images, blockquotes, and tables into clean GitHub Flavored Markdown.
              </p>
            </div>

            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
                gap: '20px',
              }}
            >
              {/* Left Column: Raw HTML Input */}
              <div>
                <label
                  style={{
                    display: 'block',
                    color: 'var(--text-main)',
                    fontSize: '0.85rem',
                    fontWeight: 600,
                    marginBottom: '8px',
                  }}
                >
                  HTML Input
                </label>
                <textarea
                  value={htmlInput}
                  onChange={(e) => setHtmlInput(e.target.value)}
                  rows={18}
                  placeholder="Paste HTML code here (e.g. <h1>Title</h1><p>Text</p>)..."
                  style={{
                    width: '100%',
                    backgroundColor: 'var(--bg-page)',
                    border: '1px solid var(--border-color)',
                    borderRadius: '10px',
                    color: 'var(--text-main)',
                    padding: '14px',
                    fontFamily: 'monospace',
                    fontSize: '0.88rem',
                    lineHeight: '1.5',
                    outline: 'none',
                    boxSizing: 'border-box',
                    resize: 'vertical',
                  }}
                />
              </div>

              {/* Right Column: Generated Clean Markdown */}
              <div>
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    marginBottom: '8px',
                  }}
                >
                  <label
                    style={{ color: 'var(--text-main)', fontSize: '0.85rem', fontWeight: 600 }}
                  >
                    Converted Markdown
                  </label>
                  <button
                    type="button"
                    onClick={() => handleCopyRaw(generatedMarkdown, 'rev-md')}
                    disabled={!generatedMarkdown}
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '4px',
                      backgroundColor:
                        copiedKey === 'rev-md' ? '#059669' : 'rgba(59, 130, 246, 0.1)',
                      color: copiedKey === 'rev-md' ? '#ffffff' : '#2563eb',
                      border: '1px solid rgba(59, 130, 246, 0.25)',
                      borderRadius: '6px',
                      padding: '4px 10px',
                      fontSize: '0.78rem',
                      fontWeight: 600,
                      cursor: generatedMarkdown ? 'pointer' : 'not-allowed',
                    }}
                  >
                    {copiedKey === 'rev-md' ? <Check size={13} /> : <Copy size={13} />}
                    {copiedKey === 'rev-md' ? 'Copied Markdown!' : 'Copy Markdown'}
                  </button>
                </div>

                <textarea
                  value={generatedMarkdown}
                  readOnly
                  rows={18}
                  placeholder="Clean Markdown will appear here..."
                  style={{
                    width: '100%',
                    backgroundColor: 'var(--bg-page)',
                    border: '1px solid var(--border-color)',
                    borderRadius: '10px',
                    color: '#3b82f6',
                    padding: '14px',
                    fontFamily: 'monospace',
                    fontSize: '0.88rem',
                    lineHeight: '1.5',
                    outline: 'none',
                    boxSizing: 'border-box',
                    resize: 'vertical',
                  }}
                />
              </div>
            </div>
          </div>
        )}

        {/* STRUCTURED SEO & FAQ CONTENT */}
        <ToolSeoContent
          toolSlug="markdown-to-html-live-converter"
          toolName={tUI('title')}
          description={tUI('subtitle')}
          customAbout={tUI('aboutText')}
          customFeatures={[tUI('feature1'), tUI('feature2'), tUI('feature3'), tUI('feature4')]}
          customSteps={[
            { title: tUI('step1Title'), body: tUI('step1Body') },
            { title: tUI('step2Title'), body: tUI('step2Body') },
            { title: tUI('step3Title'), body: tUI('step3Body') },
          ]}
          customFaqs={[
            { q: tUI('faq1Q'), a: tUI('faq1A') },
            { q: tUI('faq2Q'), a: tUI('faq2A') },
            { q: tUI('faq3Q'), a: tUI('faq3A') },
            { q: tUI('faq4Q'), a: tUI('faq4A') },
          ]}
        />
      </div>
    </GlobalContainer>
  );
}
