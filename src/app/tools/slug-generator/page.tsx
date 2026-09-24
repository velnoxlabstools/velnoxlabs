'use client';

import React, { useState, useEffect } from 'react';
import { GlobalContainer } from '@/components/layout';
import { SectionHeading } from '@/components/ui';

const STOP_WORDS = ['a', 'an', 'the', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'of', 'with', 'by', 'from', 'is', 'are', 'was', 'were', 'be', 'been', 'being'];

function generateSlug(text: string, separator: string, caseType: string, removeStopWords: boolean, removeNumbers: boolean) {
  let slug = text
    .toLowerCase()
    .trim()
    // ✅ FIX: Normalize Unicode and remove combining accent marks (é → e, ñ → n, ü → u)
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    // Now remove remaining non-word characters
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, separator);

  if (removeNumbers) {
    slug = slug.replace(/[0-9]/g, '').replace(new RegExp(`${separator}+`, 'g'), separator);
  }

  if (removeStopWords) {
    const parts = slug.split(separator).filter(p => !STOP_WORDS.includes(p));
    slug = parts.join(separator);
  }

  slug = slug.replace(new RegExp(`^${separator}+|${separator}+$`, 'g'), '');
  slug = slug.replace(new RegExp(`${separator}+`, 'g'), separator);

  if (caseType === 'upper') slug = slug.toUpperCase();
  else if (caseType === 'title') slug = slug.split(separator).map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(separator);
  else slug = slug.toLowerCase();

  return slug;
}

export default function SlugGeneratorPage() {
  const [text, setText] = useState('Hello World! This is VelnoxLabs 2024 Blog Post');
  const [separator, setSeparator] = useState('-');
  const [caseType, setCaseType] = useState('lower');
  const [removeStopWords, setRemoveStopWords] = useState(false);
  const [removeNumbers, setRemoveNumbers] = useState(false);
  const [slug, setSlug] = useState('');
  const [copied, setCopied] = useState(false);
  const [feedback, setFeedback] = useState('');
  const [feedbackSent, setFeedbackSent] = useState(false);

  useEffect(() => {
    setSlug(generateSlug(text, separator, caseType, removeStopWords, removeNumbers));
  }, [text, separator, caseType, removeStopWords, removeNumbers]);

  const handleCopy = () => {
    if (!slug) return;
    navigator.clipboard.writeText(slug);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const presets = [
    'Hello World! This is VelnoxLabs 2024 Blog Post',
    'Top 10 Best Coffee Shops in New York',
    'How to Build a Website from Scratch',
    'The Ultimate Guide to SEO in 2024',
  ];

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
        'name': 'VelnoxLabs Slug Generator',
        'operatingSystem': 'All',
        'applicationCategory': 'DeveloperApplication',
        'offers': { '@type': 'Offer', 'price': '0', 'priceCurrency': 'USD' },
        'description': 'Free online slug generator — convert any text into clean URL-friendly slugs for blogs, SEO, and websites. Supports custom separators, case options, and stop word removal.'
      },
      {
        '@type': 'FAQPage',
        'mainEntity': [
          {
            '@type': 'Question',
            'name': 'What is a slug?',
            'acceptedAnswer': { '@type': 'Answer', 'text': 'A slug is the URL-friendly version of a title or heading. It uses lowercase letters, hyphens or underscores instead of spaces, and removes special characters. Example: "Hello World" becomes "hello-world".' }
          },
          {
            '@type': 'Question',
            'name': 'Why are slugs important for SEO?',
            'acceptedAnswer': { '@type': 'Answer', 'text': 'Descriptive slugs improve SEO by giving search engines and users a clear idea of what a page is about. They also make URLs more shareable and easier to remember.' }
          },
          {
            '@type': 'Question',
            'name': 'Is this slug generator free?',
            'acceptedAnswer': { '@type': 'Answer', 'text': 'Yes, VelnoxLabs Slug Generator is 100% free with no sign-up required. All processing runs in your browser.' }
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
            title="Slug Generator"
            subtitle="Convert any text into clean, SEO-friendly URL slugs instantly — with custom separators and case options."
          />

          {/* Presets */}
          <div style={{ marginTop: 'var(--space-6)', display: 'flex', flexWrap: 'wrap', gap: '8px', marginBottom: '16px' }}>
            {presets.map((p, i) => (
              <button
                key={i}
                onClick={() => setText(p)}
                style={{ backgroundColor: 'rgba(59, 130, 246, 0.1)', color: '#60a5fa', border: '1px solid rgba(59, 130, 246, 0.3)', borderRadius: '20px', padding: '6px 14px', fontSize: '0.75rem', fontWeight: 600, cursor: 'pointer' }}
              >
                {p.slice(0, 30)}...
              </button>
            ))}
          </div>

          <div style={{ backgroundColor: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '12px', padding: '24px' }}>
            <div style={{ marginBottom: '20px' }}>
              <label style={{ color: '#fff', fontSize: '0.875rem', fontWeight: 600, display: 'block', marginBottom: '8px' }}>Text Input:</label>
              <textarea
                value={text}
                onChange={(e) => setText(e.target.value)}
                rows={3}
                placeholder="Enter title or heading..."
                style={{ width: '100%', backgroundColor: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', color: '#fff', padding: '12px', fontSize: '0.95rem', outline: 'none', resize: 'vertical' }}
              />
            </div>

            {/* Options */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '16px', marginBottom: '20px' }}>
              <div>
                <label style={{ color: '#fff', fontSize: '0.8rem', fontWeight: 600, display: 'block', marginBottom: '6px' }}>Separator:</label>
                <div style={{ display: 'flex', gap: '6px' }}>
                  {[
                    { v: '-', l: 'hyphen (-)' },
                    { v: '_', l: 'underscore (_)' },
                    { v: '.', l: 'dot (.)' },
                  ].map((s) => (
                    <button
                      key={s.v}
                      onClick={() => setSeparator(s.v)}
                      style={{ flex: 1, backgroundColor: separator === s.v ? 'rgba(59, 130, 246, 0.25)' : 'rgba(0,0,0,0.3)', color: separator === s.v ? '#60a5fa' : '#94a3b8', border: '1px solid rgba(59, 130, 246, 0.3)', borderRadius: '6px', padding: '8px 6px', fontSize: '0.75rem', fontWeight: 600, cursor: 'pointer' }}
                    >
                      {s.l}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label style={{ color: '#fff', fontSize: '0.8rem', fontWeight: 600, display: 'block', marginBottom: '6px' }}>Case:</label>
                <div style={{ display: 'flex', gap: '6px' }}>
                  {[
                    { v: 'lower', l: 'lower' },
                    { v: 'upper', l: 'UPPER' },
                    { v: 'title', l: 'Title' },
                  ].map((c) => (
                    <button
                      key={c.v}
                      onClick={() => setCaseType(c.v)}
                      style={{ flex: 1, backgroundColor: caseType === c.v ? 'rgba(59, 130, 246, 0.25)' : 'rgba(0,0,0,0.3)', color: caseType === c.v ? '#60a5fa' : '#94a3b8', border: '1px solid rgba(59, 130, 246, 0.3)', borderRadius: '6px', padding: '8px 6px', fontSize: '0.75rem', fontWeight: 600, cursor: 'pointer' }}
                    >
                      {c.l}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap', marginBottom: '24px' }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#94a3b8', fontSize: '0.85rem', cursor: 'pointer' }}>
                <input
                  type="checkbox"
                  checked={removeStopWords}
                  onChange={(e) => setRemoveStopWords(e.target.checked)}
                  style={{ width: '16px', height: '16px', cursor: 'pointer', accentColor: '#3b82f6' }}
                />
                Remove stop words (a, an, the...)
              </label>
              <label style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#94a3b8', fontSize: '0.85rem', cursor: 'pointer' }}>
                <input
                  type="checkbox"
                  checked={removeNumbers}
                  onChange={(e) => setRemoveNumbers(e.target.checked)}
                  style={{ width: '16px', height: '16px', cursor: 'pointer', accentColor: '#3b82f6' }}
                />
                Remove numbers
              </label>
            </div>

            {/* Output */}
            <div>
              <label style={{ color: '#fff', fontSize: '0.875rem', fontWeight: 600, display: 'block', marginBottom: '8px' }}>Generated Slug:</label>
              <div style={{ position: 'relative', backgroundColor: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', padding: '16px', paddingRight: '120px', display: 'flex', alignItems: 'center', minHeight: '60px' }}>
                <code style={{ color: '#34d399', fontFamily: 'monospace', fontSize: '1rem', wordBreak: 'break-all' }}>
                  {slug || <span style={{ color: '#64748b', fontStyle: 'italic' }}>Slug will appear here...</span>}
                </code>
                <button
                  onClick={handleCopy}
                  style={{ position: 'absolute', right: '16px', top: '50%', transform: 'translateY(-50%)', backgroundColor: copied ? 'rgba(16, 185, 129, 0.3)' : 'rgba(59, 130, 246, 0.15)', color: copied ? '#34d399' : '#60a5fa', border: '1px solid rgba(59, 130, 246, 0.3)', borderRadius: '8px', padding: '8px 16px', fontSize: '0.8rem', fontWeight: 600, cursor: 'pointer' }}
                >
                  {copied ? '✓ Copied' : 'Copy'}
                </button>
              </div>
              <div style={{ marginTop: '8px', color: '#64748b', fontSize: '0.8rem' }}>
                Slug length: <strong style={{ color: '#94a3b8' }}>{slug.length}</strong> characters
              </div>
            </div>
          </div>

          {/* Visible SEO Content */}
          <div style={{ marginTop: '48px', backgroundColor: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '12px', padding: '32px' }}>
            <h2 style={{ fontSize: '1.5rem', fontWeight: 700, color: '#ffffff', marginBottom: '16px' }}>What is a Slug Generator?</h2>
            <p style={{ color: '#94a3b8', lineHeight: 1.7, marginBottom: '24px' }}>
              A Slug Generator is a tool that converts any text — like a blog title, product name, or heading — into a clean, URL-friendly format called a "slug." Slugs use lowercase letters, hyphens or underscores instead of spaces, and remove special characters. For example, "Top 10 Best Coffee Shops in New York" becomes <code style={{ color: '#34d399' }}>top-10-best-coffee-shops-in-new-york</code>. Slugs are essential for SEO, readable URLs, and professional-looking websites.
            </p>

            <h3 style={{ fontSize: '1.2rem', fontWeight: 700, color: '#ffffff', marginBottom: '12px', marginTop: '24px' }}>How to Use This Tool</h3>
            <ul style={{ color: '#94a3b8', lineHeight: 1.9, paddingLeft: '20px', marginBottom: '24px' }}>
              <li>Enter or paste your text into the input field.</li>
              <li>Choose your separator: hyphen (-), underscore (_), or dot (.).</li>
              <li>Select case: lowercase, UPPERCASE, or Title Case.</li>
              <li>Optionally enable "Remove stop words" or "Remove numbers".</li>
              <li>Click <strong style={{ color: '#34d399' }}>Copy</strong> to copy the slug.</li>
            </ul>

            <h3 style={{ fontSize: '1.2rem', fontWeight: 700, color: '#ffffff', marginBottom: '16px', marginTop: '24px' }}>Frequently Asked Questions</h3>

            <div style={{ marginBottom: '16px' }}>
              <h4 style={{ fontSize: '1rem', fontWeight: 600, color: '#60a5fa', marginBottom: '6px' }}>What is a slug used for?</h4>
              <p style={{ color: '#94a3b8', lineHeight: 1.6 }}>Slugs are used in URLs to identify specific pages. For example, a blog post titled "How to Bake Bread" would have the slug "how-to-bake-bread" and appear as example.com/blog/how-to-bake-bread.</p>
            </div>

            <div style={{ marginBottom: '16px' }}>
              <h4 style={{ fontSize: '1rem', fontWeight: 600, color: '#60a5fa', marginBottom: '6px' }}>Hyphen or underscore — which is better for SEO?</h4>
              <p style={{ color: '#94a3b8', lineHeight: 1.6 }}>Hyphens (-) are recommended by Google for SEO because search engines treat them as word separators. Underscores (_) are treated as joining words, which can hurt readability in search results.</p>
            </div>

            <div style={{ marginBottom: '16px' }}>
              <h4 style={{ fontSize: '1rem', fontWeight: 600, color: '#60a5fa', marginBottom: '6px' }}>How long should a slug be?</h4>
              <p style={{ color: '#94a3b8', lineHeight: 1.6 }}>Keep slugs short — ideally 3 to 5 words (under 60 characters). Short slugs are easier to read, share, and remember.</p>
            </div>

            <div style={{ marginBottom: '16px' }}>
              <h4 style={{ fontSize: '1rem', fontWeight: 600, color: '#60a5fa', marginBottom: '6px' }}>Is my text stored anywhere?</h4>
              <p style={{ color: '#94a3b8', lineHeight: 1.6 }}>No. All slug generation happens entirely in your browser. Your text is never sent to any server.</p>
            </div>
          </div>

          {/* Feedback Form */}
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
