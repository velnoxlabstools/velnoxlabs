'use client';

import React, { useState, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { GlobalContainer } from '@/components/layout';
import { SectionHeading } from '@/components/ui';
import { ToolSeoContent } from '@/features/tools/sections/ToolSeoContent';

function escapeHtml(str: string): string {
  return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

function processInline(text: string): string {
  // Step 1: Escape HTML entities in user text
  let out = escapeHtml(text);

  // Step 2: Inline code (must be first to avoid other regexes messing inside)
  out = out.replace(/`([^`]+)`/g, '<code>$1</code>');

  // Step 3: Images: ![alt](url)
  out = out.replace(/!\[([^\]]*)\]\(([^)]+)\)/g, '<img src="$2" alt="$1" />');

  // Step 4: Links: [text](url)
  out = out.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" rel="noopener noreferrer">$1</a>');

  // Step 5: Bold: **text** or __text__
  out = out.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');
  out = out.replace(/__(.+?)__/g, '<strong>$1</strong>');

  // Step 6: Italic: *text* or _text_
  out = out.replace(/\*(.+?)\*/g, '<em>$1</em>');
  out = out.replace(/_(.+?)_/g, '<em>$1</em>');

  // Step 7: Strikethrough: ~~text~~
  out = out.replace(/~~(.+?)~~/g, '<del>$1</del>');

  return out;
}

function markdownToHtml(md: string): string {
  // Step 1: Extract fenced code blocks first (so they aren't processed)
  const codeBlocks: string[] = [];
  const working = md.replace(/```(\w*)\n([\s\S]*?)```/g, (_match, lang, code) => {
    const placeholder = `\n__CODEBLOCK_${codeBlocks.length}__\n`;
    const langClass = lang ? ` class="language-${lang}"` : '';
    codeBlocks.push(`<pre><code${langClass}>${escapeHtml(code.replace(/\n$/, ''))}</code></pre>`);
    return placeholder;
  });

  const lines = working.split('\n');
  const output: string[] = [];
  let listType: 'ul' | 'ol' | null = null;
  let paragraphBuffer: string[] = [];

  const flushParagraph = () => {
    if (paragraphBuffer.length > 0) {
      // ✅ FIX: Join lines with <br> to preserve line breaks
      const joined = paragraphBuffer.map((l) => processInline(l.trim())).join('<br />\n');
      if (joined) output.push(`<p>${joined}</p>`);
      paragraphBuffer = [];
    }
  };

  const closeList = () => {
    if (listType) {
      output.push(listType === 'ul' ? '</ul>' : '</ol>');
      listType = null;
    }
  };

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];

    // Code block placeholder
    const codeMatch = line.match(/^__CODEBLOCK_(\d+)__$/);
    if (codeMatch) {
      flushParagraph();
      closeList();
      output.push(codeBlocks[parseInt(codeMatch[1])]);
      continue;
    }

    // Empty line -> close list, flush paragraph
    if (!line.trim()) {
      flushParagraph();
      closeList();
      continue;
    }

    // Heading: # through ######
    const headingMatch = line.match(/^(#{1,6})\s+(.*)$/);
    if (headingMatch) {
      flushParagraph();
      closeList();
      const level = headingMatch[1].length;
      output.push(`<h${level}>${processInline(headingMatch[2])}</h${level}>`);
      continue;
    }

    // Horizontal rule: --- or *** or ___
    if (/^(\-{3,}|\*{3,}|_{3,})$/.test(line.trim())) {
      flushParagraph();
      closeList();
      output.push('<hr />');
      continue;
    }

    // Blockquote: > text
    const bqMatch = line.match(/^>\s?(.*)$/);
    if (bqMatch) {
      flushParagraph();
      closeList();
      output.push(`<blockquote>${processInline(bqMatch[1])}</blockquote>`);
      continue;
    }

    // Unordered list: -, *, +
    const ulMatch = line.match(/^[-*+]\s+(.*)$/);
    if (ulMatch) {
      flushParagraph();
      if (listType !== 'ul') {
        closeList();
        output.push('<ul>');
        listType = 'ul';
      }
      output.push(`<li>${processInline(ulMatch[1])}</li>`);
      continue;
    }

    // Ordered list: 1. 2. 3.
    const olMatch = line.match(/^\d+\.\s+(.*)$/);
    if (olMatch) {
      flushParagraph();
      if (listType !== 'ol') {
        closeList();
        output.push('<ol>');
        listType = 'ol';
      }
      output.push(`<li>${processInline(olMatch[1])}</li>`);
      continue;
    }

    // Normal line -> buffer as paragraph (preserving line breaks)
    closeList();
    paragraphBuffer.push(line);
  }

  flushParagraph();
  closeList();

  return output.join('\n');
}

export default function Page() {
  const tUI = useTranslations('ToolUI.markdownToHtml');
  const [input, setInput] = useState(tUI('sampleMarkdown'));
  const [output, setOutput] = useState('');
  const [copied, setCopied] = useState(false);
  useEffect(() => {
    if (input.trim()) {
      setOutput(markdownToHtml(input));
    } else {
      setOutput('');
    }
  }, [input]);

  const handleCopy = () => {
    if (!output) return;
    navigator.clipboard.writeText(output);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const schemaData = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'SoftwareApplication',
        name: 'VelnoxLabs Markdown to HTML Live Converter',
        operatingSystem: 'All',
        applicationCategory: 'DeveloperApplication',
        offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
        description:
          'Convert Markdown text to clean HTML in real-time with support for headings, lists, bold, italics, code blocks, and links.',
      },
      {
        '@type': 'FAQPage',
        mainEntity: [
          {
            '@type': 'Question',
            name: 'How to convert Markdown to HTML online?',
            acceptedAnswer: {
              '@type': 'Answer',
              text: 'Paste your Markdown text into the input box and instantly get clean HTML output with proper paragraph, heading, and list tags.',
            },
          },
          {
            '@type': 'Question',
            name: 'Is Markdown to HTML conversion secure?',
            acceptedAnswer: {
              '@type': 'Answer',
              text: 'Yes, all processing happens client-side. HTML entities are properly escaped to prevent XSS attacks.',
            },
          },
        ],
      },
    ],
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(schemaData) }}
      />

      <GlobalContainer maxWidth="2xl">
        <div style={{ paddingTop: 'var(--space-8)', paddingBottom: 'var(--space-16)' }}>
          <SectionHeading title={tUI('title')} subtitle={tUI('subtitle')} />

          {/* ========== TOOL UI ========== */}
          <div
            style={{
              backgroundColor: 'var(--bg-card)',
              border: '1px solid var(--border-color)',
              borderRadius: '12px',
              padding: '24px',
              marginTop: 'var(--space-6)',
            }}
          >
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
                gap: '20px',
              }}
            >
              <div>
                <label
                  style={{
                    color: 'var(--text-main)',
                    fontSize: '0.875rem',
                    fontWeight: 600,
                    display: 'block',
                    marginBottom: '8px',
                  }}
                >
                  {tUI('markdownInput')}
                </label>
                <textarea
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  rows={12}
                  placeholder={tUI('markdownPlaceholder')}
                  style={{
                    width: '100%',
                    backgroundColor: 'var(--bg-page)',
                    border: '1px solid var(--border-color)',
                    borderRadius: '8px',
                    color: 'var(--text-main)',
                    padding: '12px',
                    fontFamily: 'monospace',
                    fontSize: '0.85rem',
                    outline: 'none',
                    resize: 'vertical',
                  }}
                />
              </div>
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
                    style={{ color: 'var(--text-main)', fontSize: '0.875rem', fontWeight: 600 }}
                  >
                    {tUI('htmlOutput')}
                  </label>
                  <button
                    onClick={handleCopy}
                    disabled={!output}
                    style={{
                      backgroundColor: output
                        ? 'rgba(59, 130, 246, 0.15)'
                        : 'rgba(255,255,255,0.05)',
                      color: output ? '#60a5fa' : '#64748b',
                      border: '1px solid rgba(59, 130, 246, 0.3)',
                      borderRadius: '6px',
                      padding: '4px 12px',
                      fontSize: '0.75rem',
                      fontWeight: 600,
                      cursor: output ? 'pointer' : 'not-allowed',
                    }}
                  >
                    {copied ? tUI('copied') : tUI('copy')}
                  </button>
                </div>
                <textarea
                  value={output}
                  readOnly
                  rows={12}
                  placeholder={tUI('htmlPlaceholder')}
                  style={{
                    width: '100%',
                    backgroundColor: 'var(--bg-page)',
                    border: '1px solid var(--border-color)',
                    borderRadius: '8px',
                    color: '#34d399',
                    padding: '12px',
                    fontFamily: 'monospace',
                    fontSize: '0.85rem',
                    outline: 'none',
                    resize: 'vertical',
                  }}
                />
              </div>
            </div>
          </div>

          <ToolSeoContent toolSlug="markdown-to-html-live-converter" toolName={tUI('title')} />
        </div>
      </GlobalContainer>
    </>
  );
}
