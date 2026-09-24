'use client';

import React, { useState, useEffect } from 'react';
import { GlobalContainer } from '@/components/layout';
import { SectionHeading } from '@/components/ui';

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
  let working = md.replace(/```(\w*)\n([\s\S]*?)```/g, (_match, lang, code) => {
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
      const joined = paragraphBuffer.join(' ').trim();
      if (joined) output.push(`<p>${processInline(joined)}</p>`);
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
    const rawLine = lines[i];
    const line = rawLine;

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

    // Normal line -> buffer as paragraph
    closeList();
    paragraphBuffer.push(line);
  }

  flushParagraph();
  closeList();

  return output.join('\n');
}

export default function Page() {
  const [input, setInput] = useState(
    '# Hello VelnoxLabs\n\nThis is **bold** and *italic*.\n\n- Item 1\n- Item 2\n\n[Link](https://velnoxlabs.com)'
  );
  const [output, setOutput] = useState('');
  const [copied, setCopied] = useState(false);
  const [feedback, setFeedback] = useState('');
  const [feedbackSent, setFeedbackSent] = useState(false);

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

  const handleFeedbackSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!feedback.trim()) return;
    setFeedbackSent(true);
    setFeedback('');
    setTimeout(() => setFeedbackSent(false), 3000);
  };

  const schemaData = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'SoftwareApplication',
        'name': 'VelnoxLabs Markdown to HTML Live Converter',
        'operatingSystem': 'All',
        'applicationCategory': 'DeveloperApplication',
        'offers': { '@type': 'Offer', 'price': '0', 'priceCurrency': 'USD' },
        'description': 'Convert Markdown text to clean HTML in real-time with support for headings, lists, bold, italics, code blocks, and links.'
      },
      {
        '@type': 'FAQPage',
        'mainEntity': [
          {
            '@type': 'Question',
            'name': 'How to convert Markdown to HTML online?',
            'acceptedAnswer': { '@type': 'Answer', 'text': 'Paste your Markdown text into the input box and instantly get clean HTML output with proper paragraph, heading, and list tags.' }
          },
          {
            '@type': 'Question',
            'name': 'Is Markdown to HTML conversion secure?',
            'acceptedAnswer': { '@type': 'Answer', 'text': 'Yes, all processing happens client-side. HTML entities are properly escaped to prevent XSS attacks.' }
          }
        ]
      }
    ]
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schemaData) }} />

      <GlobalContainer maxWidth="2xl">
        <div style={{ paddingTop: 'var(--space-8)', paddingBottom: 'var(--space-16)' }}>
          <SectionHeading
            title="Markdown to HTML Live Converter"
            subtitle="Preview and convert Markdown text to clean HTML in real-time."
          />

          {/* ========== TOOL UI ========== */}
          <div style={{ backgroundColor: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '12px', padding: '24px', marginTop: 'var(--space-6)' }}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '20px' }}>
              <div>
                <label style={{ color: '#fff', fontSize: '0.875rem', fontWeight: 600, display: 'block', marginBottom: '8px' }}>Markdown Input:</label>
                <textarea
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  rows={12}
                  placeholder="Enter Markdown..."
                  style={{ width: '100%', backgroundColor: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', color: '#fff', padding: '12px', fontFamily: 'monospace', fontSize: '0.85rem', outline: 'none', resize: 'vertical' }}
                />
              </div>
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                  <label style={{ color: '#fff', fontSize: '0.875rem', fontWeight: 600 }}>HTML Output:</label>
                  <button onClick={handleCopy} disabled={!output} style={{ backgroundColor: output ? 'rgba(59, 130, 246, 0.15)' : 'rgba(255,255,255,0.05)', color: output ? '#60a5fa' : '#64748b', border: '1px solid rgba(59, 130, 246, 0.3)', borderRadius: '6px', padding: '4px 12px', fontSize: '0.75rem', fontWeight: 600, cursor: output ? 'pointer' : 'not-allowed' }}>{copied ? 'Copied!' : 'Copy'}</button>
                </div>
                <textarea
                  value={output}
                  readOnly
                  rows={12}
                  placeholder="HTML output will appear here..."
                  style={{ width: '100%', backgroundColor: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', color: '#34d399', padding: '12px', fontFamily: 'monospace', fontSize: '0.85rem', outline: 'none', resize: 'vertical' }}
                />
              </div>
            </div>
          </div>

          {/* ========== SEO CONTENT ========== */}
          <div style={{ marginTop: '48px', backgroundColor: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '12px', padding: '32px' }}>
            <h2 style={{ fontSize: '1.5rem', fontWeight: 700, color: '#ffffff', marginBottom: '16px' }}>What is a Markdown to HTML Live Converter?</h2>
            <p style={{ color: '#94a3b8', lineHeight: 1.7, marginBottom: '24px' }}>
              The Markdown to HTML Converter transforms Markdown syntax into clean HTML in real-time. It supports headings, bold, italics, code blocks, links, lists, blockquotes, and horizontal rules. Perfect for bloggers, developers, and technical writers.
            </p>

            <h3 style={{ fontSize: '1.2rem', fontWeight: 700, color: '#ffffff', marginBottom: '12px', marginTop: '24px' }}>How to Use This Tool</h3>
            <ul style={{ color: '#94a3b8', lineHeight: 1.9, paddingLeft: '20px', marginBottom: '24px' }}>
              <li>Type or paste your Markdown into the left box.</li>
              <li>The HTML output updates automatically as you type.</li>
              <li>HTML entities are escaped to prevent XSS attacks.</li>
              <li>Click <strong style={{ color: '#34d399' }}>Copy</strong> to copy the generated HTML.</li>
            </ul>

            <h3 style={{ fontSize: '1.2rem', fontWeight: 700, color: '#ffffff', marginBottom: '16px', marginTop: '24px' }}>Supported Markdown Syntax</h3>
            <ul style={{ color: '#94a3b8', lineHeight: 1.9, paddingLeft: '20px', marginBottom: '24px' }}>
              <li>Headings: <code style={{ color: '#60a5fa' }}># H1</code> through <code style={{ color: '#60a5fa' }}>###### H6</code></li>
              <li>Bold: <code style={{ color: '#60a5fa' }}>**text**</code></li>
              <li>Italic: <code style={{ color: '#60a5fa' }}>*text*</code></li>
              <li>Links: <code style={{ color: '#60a5fa' }}>[text](url)</code></li>
              <li>Lists: <code style={{ color: '#60a5fa' }}>- item</code> or <code style={{ color: '#60a5fa' }}>1. item</code></li>
              <li>Code blocks: <code style={{ color: '#60a5fa' }}>```code```</code></li>
              <li>Blockquotes: <code style={{ color: '#60a5fa' }}>&gt; quote</code></li>
            </ul>

            <h3 style={{ fontSize: '1.2rem', fontWeight: 700, color: '#ffffff', marginBottom: '16px', marginTop: '24px' }}>Frequently Asked Questions</h3>

            <div style={{ marginBottom: '16px' }}>
              <h4 style={{ fontSize: '1rem', fontWeight: 600, color: '#60a5fa', marginBottom: '6px' }}>Is this tool free to use?</h4>
              <p style={{ color: '#94a3b8', lineHeight: 1.6 }}>Yes, VelnoxLabs Markdown to HTML Live Converter is 100% free with no sign-up required.</p>
            </div>

            <div style={{ marginBottom: '16px' }}>
              <h4 style={{ fontSize: '1rem', fontWeight: 600, color: '#60a5fa', marginBottom: '6px' }}>Is my data secure?</h4>
              <p style={{ color: '#94a3b8', lineHeight: 1.6 }}>Absolutely. All processing happens entirely in your browser using client-side JavaScript. Your data never leaves your device and is never sent to any server.</p>
            </div>

            <div style={{ marginBottom: '16px' }}>
              <h4 style={{ fontSize: '1rem', fontWeight: 600, color: '#60a5fa', marginBottom: '6px' }}>Does it work on mobile devices?</h4>
              <p style={{ color: '#94a3b8', lineHeight: 1.6 }}>Yes, this tool is fully responsive and works on desktop, tablet, and mobile browsers.</p>
            </div>
          </div>

          {/* ========== FEEDBACK FORM ========== */}
          <div className="bg-slate-900/40 border border-slate-800 p-8 rounded-2xl mt-12">
            <h3 className="text-xl font-bold text-white mb-2">Got Feedback or Feature Requests?</h3>
            <p className="text-slate-400 mb-6 text-sm">Help us enhance VelnoxLabs developer utility standards. Share your feedback below!</p>
            <form onSubmit={handleFeedbackSubmit} className="space-y-4">
              <textarea
                rows={4}
                value={feedback}
                onChange={(e) => setFeedback(e.target.value)}
                placeholder="Write your suggestions or feature requests here..."
                className="w-full bg-slate-950 border border-slate-800 rounded-xl p-4 text-slate-200 focus:outline-none focus:border-slate-600 text-sm resize-none"
              ></textarea>
              <button type="submit" className="bg-emerald-600 hover:bg-emerald-500 text-white font-medium px-6 py-2.5 rounded-xl transition text-sm">
                {feedbackSent ? 'Sent!' : 'Submit Suggestion'}
              </button>
            </form>
          </div>

        </div>
      </GlobalContainer>
    </>
  );
}
