'use client';

import React, { useState, useMemo } from 'react';
import { GlobalContainer } from '@/components/layout';
import { SectionHeading } from '@/components/ui';

type DiffLine = {
  type: 'same' | 'added' | 'removed';
  originalLine?: string;
  modifiedLine?: string;
  originalNum?: number;
  modifiedNum?: number;
};

export default function TextDiffCheckerPage() {
  const [original, setOriginal] = useState(
    'VelnoxLabs developer tools v1.0\nFast and reliable\nBuilt for developers\nAll tools free forever'
  );
  const [modified, setModified] = useState(
    'VelnoxLabs enterprise developer tools v2.0\nFast and reliable\nBuilt for professional developers\nAll tools free forever\nNew AI-powered features added'
  );
  const [copied, setCopied] = useState(false);
  const [feedback, setFeedback] = useState('');
  const [feedbackSent, setFeedbackSent] = useState(false);

  // LCS-based line diff
  const diff = useMemo(() => {
    const origLines = original.split('\n');
    const modLines = modified.split('\n');
    const m = origLines.length;
    const n = modLines.length;

    const lcs: number[][] = Array(m + 1)
      .fill(null)
      .map(() => Array(n + 1).fill(0));

    for (let i = 1; i <= m; i++) {
      for (let j = 1; j <= n; j++) {
        if (origLines[i - 1] === modLines[j - 1]) {
          lcs[i][j] = lcs[i - 1][j - 1] + 1;
        } else {
          lcs[i][j] = Math.max(lcs[i - 1][j], lcs[i][j - 1]);
        }
      }
    }

    const result: DiffLine[] = [];
    let i = m;
    let j = n;

    while (i > 0 || j > 0) {
      if (i > 0 && j > 0 && origLines[i - 1] === modLines[j - 1]) {
        result.unshift({
          type: 'same',
          originalLine: origLines[i - 1],
          modifiedLine: modLines[j - 1],
          originalNum: i,
          modifiedNum: j,
        });
        i--;
        j--;
      } else if (j > 0 && (i === 0 || lcs[i][j - 1] >= lcs[i - 1][j])) {
        result.unshift({
          type: 'added',
          modifiedLine: modLines[j - 1],
          modifiedNum: j,
        });
        j--;
      } else if (i > 0) {
        result.unshift({
          type: 'removed',
          originalLine: origLines[i - 1],
          originalNum: i,
        });
        i--;
      }
    }

    return result;
  }, [original, modified]);

  const stats = useMemo(() => {
    const added = diff.filter((d) => d.type === 'added').length;
    const removed = diff.filter((d) => d.type === 'removed').length;
    const same = diff.filter((d) => d.type === 'same').length;
    return { added, removed, same };
  }, [diff]);

  const handleCopy = () => {
    const text = diff
      .map((d) => {
        if (d.type === 'added') return `+ ${d.modifiedLine}`;
        if (d.type === 'removed') return `- ${d.originalLine}`;
        return `  ${d.originalLine}`;
      })
      .join('\n');
    navigator.clipboard.writeText(text);
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
        'name': 'VelnoxLabs Text Diff Checker',
        'operatingSystem': 'All',
        'applicationCategory': 'DeveloperApplication',
        'offers': { '@type': 'Offer', 'price': '0', 'priceCurrency': 'USD' },
        'description': 'Compare two blocks of text or code snippets to find differences instantly inside your browser.'
      },
      {
        '@type': 'FAQPage',
        'mainEntity': [
          {
            '@type': 'Question',
            'name': 'How to compare text differences online?',
            'acceptedAnswer': { '@type': 'Answer', 'text': 'Paste your original and modified text blocks into the respective boxes to inspect changes instantly.' }
          },
          {
            '@type': 'Question',
            'name': 'Is text comparison secure?',
            'acceptedAnswer': { '@type': 'Answer', 'text': 'Yes, 100% client-side processing ensuring your data never leaves your device.' }
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
            title="Text Difference Checker"
            subtitle="Compare two versions of text or code to instantly analyze modifications and updates."
          />

          {/* ========== TOOL UI ========== */}
          <div style={{ backgroundColor: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '12px', padding: '24px', marginTop: 'var(--space-6)' }}>

            {/* Two inputs side by side */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '20px' }}>
              <div>
                <label style={{ color: '#fff', fontSize: '0.875rem', fontWeight: 600, display: 'block', marginBottom: '8px' }}>
                  Original Text:
                </label>
                <textarea
                  value={original}
                  onChange={(e) => setOriginal(e.target.value)}
                  rows={8}
                  placeholder="Paste original text here..."
                  style={{ width: '100%', backgroundColor: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', color: '#fff', padding: '12px', fontFamily: 'monospace', fontSize: '0.85rem', outline: 'none', resize: 'vertical' }}
                />
              </div>
              <div>
                <label style={{ color: '#fff', fontSize: '0.875rem', fontWeight: 600, display: 'block', marginBottom: '8px' }}>
                  Modified Text:
                </label>
                <textarea
                  value={modified}
                  onChange={(e) => setModified(e.target.value)}
                  rows={8}
                  placeholder="Paste modified text here..."
                  style={{ width: '100%', backgroundColor: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', color: '#fff', padding: '12px', fontFamily: 'monospace', fontSize: '0.85rem', outline: 'none', resize: 'vertical' }}
                />
              </div>
            </div>

            {/* Stats */}
            <div style={{ display: 'flex', gap: '20px', marginTop: '20px', flexWrap: 'wrap', alignItems: 'center' }}>
              <span style={{ color: '#34d399', fontSize: '0.85rem', fontWeight: 600 }}>
                ✅ {stats.same} unchanged
              </span>
              <span style={{ color: '#4ade80', fontSize: '0.85rem', fontWeight: 600 }}>
                ➕ {stats.added} added
              </span>
              <span style={{ color: '#f87171', fontSize: '0.85rem', fontWeight: 600 }}>
                ➖ {stats.removed} removed
              </span>
              <button
                onClick={handleCopy}
                style={{ marginLeft: 'auto', backgroundColor: 'rgba(59, 130, 246, 0.15)', color: '#60a5fa', border: '1px solid rgba(59, 130, 246, 0.3)', borderRadius: '6px', padding: '6px 14px', fontSize: '0.75rem', fontWeight: 600, cursor: 'pointer' }}
              >
                {copied ? 'Copied!' : 'Copy Diff'}
              </button>
            </div>

            {/* Diff Output */}
            <div style={{ marginTop: '16px' }}>
              <label style={{ color: '#fff', fontSize: '0.875rem', fontWeight: 600, display: 'block', marginBottom: '8px' }}>
                Diff Result:
              </label>
              <div style={{ backgroundColor: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', padding: '12px', fontFamily: 'monospace', fontSize: '0.85rem', maxHeight: '400px', overflowY: 'auto' }}>
                {diff.map((line, idx) => {
                  let bgColor = 'transparent';
                  let textColor = '#94a3b8';
                  let prefix = '  ';

                  if (line.type === 'added') {
                    bgColor = 'rgba(52, 211, 153, 0.1)';
                    textColor = '#34d399';
                    prefix = '+ ';
                  } else if (line.type === 'removed') {
                    bgColor = 'rgba(248, 113, 113, 0.1)';
                    textColor = '#f87171';
                    prefix = '- ';
                  }

                  return (
                    <div
                      key={idx}
                      style={{
                        backgroundColor: bgColor,
                        color: textColor,
                        padding: '4px 8px',
                        borderRadius: '4px',
                        marginBottom: '2px',
                        wordBreak: 'break-word',
                        whiteSpace: 'pre-wrap',
                      }}
                    >
                      {prefix}
                      {line.type === 'added' ? line.modifiedLine : line.originalLine}
                    </div>
                  );
                })}
                {diff.length === 0 && (
                  <p style={{ color: '#64748b', fontStyle: 'italic', margin: 0 }}>
                    Diff will appear here when you enter text...
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* ========== SEO CONTENT ========== */}
          <div style={{ marginTop: '48px', backgroundColor: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '12px', padding: '32px' }}>
            <h2 style={{ fontSize: '1.5rem', fontWeight: 700, color: '#ffffff', marginBottom: '16px' }}>What is a Text Difference Checker?</h2>
            <p style={{ color: '#94a3b8', lineHeight: 1.7, marginBottom: '24px' }}>
              The Text Diff Checker compares two text blocks and highlights differences. It is useful for code review, document editing, and tracking changes.
            </p>

            <h3 style={{ fontSize: '1.2rem', fontWeight: 700, color: '#ffffff', marginBottom: '12px', marginTop: '24px' }}>How to Use This Tool</h3>
            <ul style={{ color: '#94a3b8', lineHeight: 1.9, paddingLeft: '20px', marginBottom: '24px' }}>
              <li>Paste the original text in the left box.</li>
              <li>Paste the modified text in the right box.</li>
              <li>The diff is calculated instantly line-by-line.</li>
              <li>Green lines show additions, red lines show removals.</li>
              <li>Click <strong style={{ color: '#34d399' }}>Copy Diff</strong> to copy the unified diff output.</li>
            </ul>

            <h3 style={{ fontSize: '1.2rem', fontWeight: 700, color: '#ffffff', marginBottom: '16px', marginTop: '24px' }}>Frequently Asked Questions</h3>

            <div style={{ marginBottom: '16px' }}>
              <h4 style={{ fontSize: '1rem', fontWeight: 600, color: '#60a5fa', marginBottom: '6px' }}>Is this tool free to use?</h4>
              <p style={{ color: '#94a3b8', lineHeight: 1.6 }}>Yes, VelnoxLabs Text Difference Checker is 100% free with no sign-up required.</p>
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