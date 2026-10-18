'use client';

import React, { useState, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { GlobalContainer } from '@/components/layout';
import { SectionHeading } from '@/components/ui';
import { ToolSeoContent } from '@/features/tools/sections/ToolSeoContent';

const STOP_WORDS = [
  'a',
  'an',
  'the',
  'and',
  'or',
  'but',
  'in',
  'on',
  'at',
  'to',
  'for',
  'of',
  'with',
  'by',
  'from',
  'is',
  'are',
  'was',
  'were',
  'be',
  'been',
  'being',
];

function generateSlug(
  text: string,
  separator: string,
  caseType: string,
  removeStopWords: boolean,
  removeNumbers: boolean
) {
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
    const parts = slug.split(separator).filter((p) => !STOP_WORDS.includes(p));
    slug = parts.join(separator);
  }

  slug = slug.replace(new RegExp(`^${separator}+|${separator}+$`, 'g'), '');
  slug = slug.replace(new RegExp(`${separator}+`, 'g'), separator);

  if (caseType === 'upper') slug = slug.toUpperCase();
  else if (caseType === 'title')
    slug = slug
      .split(separator)
      .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
      .join(separator);
  else slug = slug.toLowerCase();

  return slug;
}

export default function SlugGeneratorPage() {
  const tUI = useTranslations('ToolUI.slugGenerator');
  const [text, setText] = useState('Hello World! This is VelnoxLabs 2024 Blog Post');
  const [separator, setSeparator] = useState('-');
  const [caseType, setCaseType] = useState('lower');
  const [removeStopWords, setRemoveStopWords] = useState(false);
  const [removeNumbers, setRemoveNumbers] = useState(false);
  const [slug, setSlug] = useState('');
  const [copied, setCopied] = useState(false);
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

  const schemaData = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'SoftwareApplication',
        name: 'VelnoxLabs Slug Generator',
        operatingSystem: 'All',
        applicationCategory: 'DeveloperApplication',
        offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
        description:
          'Free online slug generator — convert any text into clean URL-friendly slugs for blogs, SEO, and websites. Supports custom separators, case options, and stop word removal.',
      },
      {
        '@type': 'FAQPage',
        mainEntity: [
          {
            '@type': 'Question',
            name: 'What is a slug?',
            acceptedAnswer: {
              '@type': 'Answer',
              text: 'A slug is the URL-friendly version of a title or heading. It uses lowercase letters, hyphens or underscores instead of spaces, and removes special characters. Example: "Hello World" becomes "hello-world".',
            },
          },
          {
            '@type': 'Question',
            name: 'Why are slugs important for SEO?',
            acceptedAnswer: {
              '@type': 'Answer',
              text: 'Descriptive slugs improve SEO by giving search engines and users a clear idea of what a page is about. They also make URLs more shareable and easier to remember.',
            },
          },
          {
            '@type': 'Question',
            name: 'Is this slug generator free?',
            acceptedAnswer: {
              '@type': 'Answer',
              text: 'Yes, VelnoxLabs Slug Generator is 100% free with no sign-up required. All processing runs in your browser.',
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

          {/* Presets */}
          <div
            style={{
              marginTop: 'var(--space-6)',
              display: 'flex',
              flexWrap: 'wrap',
              gap: '8px',
              marginBottom: '16px',
            }}
          >
            {presets.map((p, i) => (
              <button
                key={i}
                onClick={() => setText(p)}
                style={{
                  backgroundColor: 'rgba(59, 130, 246, 0.1)',
                  color: '#60a5fa',
                  border: '1px solid rgba(59, 130, 246, 0.3)',
                  borderRadius: '20px',
                  padding: '6px 14px',
                  fontSize: '0.75rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                }}
              >
                {p.slice(0, 30)}...
              </button>
            ))}
          </div>

          <div
            style={{
              backgroundColor: 'var(--bg-card)',
              border: '1px solid var(--border-color)',
              borderRadius: '12px',
              padding: '24px',
            }}
          >
            <div style={{ marginBottom: '20px' }}>
              <label
                style={{
                  color: 'var(--text-main)',
                  fontSize: '0.875rem',
                  fontWeight: 600,
                  display: 'block',
                  marginBottom: '8px',
                }}
              >
                {tUI('textInput')}
              </label>
              <textarea
                value={text}
                onChange={(e) => setText(e.target.value)}
                rows={3}
                placeholder={tUI('placeholder')}
                style={{
                  width: '100%',
                  backgroundColor: 'var(--bg-page)',
                  border: '1px solid var(--border-color)',
                  borderRadius: '8px',
                  color: 'var(--text-main)',
                  padding: '12px',
                  fontSize: '0.95rem',
                  outline: 'none',
                  resize: 'vertical',
                }}
              />
            </div>

            {/* Options */}
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
                gap: '16px',
                marginBottom: '20px',
              }}
            >
              <div>
                <label
                  style={{
                    color: 'var(--text-main)',
                    fontSize: '0.8rem',
                    fontWeight: 600,
                    display: 'block',
                    marginBottom: '6px',
                  }}
                >
                  {tUI('separator')}
                </label>
                <div style={{ display: 'flex', gap: '6px' }}>
                  {[
                    { v: '-', l: tUI('hyphen') },
                    { v: '_', l: tUI('underscore') },
                    { v: '.', l: tUI('dot') },
                  ].map((s) => (
                    <button
                      key={s.v}
                      onClick={() => setSeparator(s.v)}
                      style={{
                        flex: 1,
                        backgroundColor:
                          separator === s.v ? 'rgba(59, 130, 246, 0.25)' : 'var(--bg-page)',
                        color: separator === s.v ? '#60a5fa' : '#94a3b8',
                        border: '1px solid rgba(59, 130, 246, 0.3)',
                        borderRadius: '6px',
                        padding: '8px 6px',
                        fontSize: '0.75rem',
                        fontWeight: 600,
                        cursor: 'pointer',
                      }}
                    >
                      {s.l}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label
                  style={{
                    color: 'var(--text-main)',
                    fontSize: '0.8rem',
                    fontWeight: 600,
                    display: 'block',
                    marginBottom: '6px',
                  }}
                >
                  {tUI('case')}
                </label>
                <div style={{ display: 'flex', gap: '6px' }}>
                  {[
                    { v: 'lower', l: tUI('lower') },
                    { v: 'upper', l: tUI('upper') },
                    { v: 'title', l: tUI('titleCase') },
                  ].map((c) => (
                    <button
                      key={c.v}
                      onClick={() => setCaseType(c.v)}
                      style={{
                        flex: 1,
                        backgroundColor:
                          caseType === c.v ? 'rgba(59, 130, 246, 0.25)' : 'var(--bg-page)',
                        color: caseType === c.v ? '#60a5fa' : '#94a3b8',
                        border: '1px solid rgba(59, 130, 246, 0.3)',
                        borderRadius: '6px',
                        padding: '8px 6px',
                        fontSize: '0.75rem',
                        fontWeight: 600,
                        cursor: 'pointer',
                      }}
                    >
                      {c.l}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap', marginBottom: '24px' }}>
              <label
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  color: 'var(--text-muted)',
                  fontSize: '0.85rem',
                  cursor: 'pointer',
                }}
              >
                <input
                  type="checkbox"
                  checked={removeStopWords}
                  onChange={(e) => setRemoveStopWords(e.target.checked)}
                  style={{
                    width: '16px',
                    height: '16px',
                    cursor: 'pointer',
                    accentColor: '#3b82f6',
                  }}
                />
                {tUI('removeStopWords')}
              </label>
              <label
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  color: 'var(--text-muted)',
                  fontSize: '0.85rem',
                  cursor: 'pointer',
                }}
              >
                <input
                  type="checkbox"
                  checked={removeNumbers}
                  onChange={(e) => setRemoveNumbers(e.target.checked)}
                  style={{
                    width: '16px',
                    height: '16px',
                    cursor: 'pointer',
                    accentColor: '#3b82f6',
                  }}
                />
                {tUI('removeNumbers')}
              </label>
            </div>

            {/* Output */}
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
                {tUI('generatedSlug')}
              </label>
              <div
                style={{
                  position: 'relative',
                  backgroundColor: 'var(--bg-page)',
                  border: '1px solid var(--border-color)',
                  borderRadius: '8px',
                  padding: '16px',
                  paddingRight: '120px',
                  display: 'flex',
                  alignItems: 'center',
                  minHeight: '60px',
                }}
              >
                <code
                  style={{
                    color: '#34d399',
                    fontFamily: 'monospace',
                    fontSize: '1rem',
                    wordBreak: 'break-all',
                  }}
                >
                  {slug || (
                    <span style={{ color: '#64748b', fontStyle: 'italic' }}>
                      {tUI('slugPlaceholder')}
                    </span>
                  )}
                </code>
                <button
                  onClick={handleCopy}
                  style={{
                    position: 'absolute',
                    right: '16px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    backgroundColor: copied
                      ? 'rgba(16, 185, 129, 0.3)'
                      : 'rgba(59, 130, 246, 0.15)',
                    color: copied ? '#34d399' : '#60a5fa',
                    border: '1px solid rgba(59, 130, 246, 0.3)',
                    borderRadius: '8px',
                    padding: '8px 16px',
                    fontSize: '0.8rem',
                    fontWeight: 600,
                    cursor: 'pointer',
                  }}
                >
                  {copied ? tUI('copied') : tUI('copy')}
                </button>
              </div>
              <div style={{ marginTop: '8px', color: '#64748b', fontSize: '0.8rem' }}>
                {tUI('slugLength')}{' '}
                <strong style={{ color: 'var(--text-muted)' }}>{slug.length}</strong>{' '}
                {tUI('characters')}
              </div>
            </div>
          </div>

          <ToolSeoContent toolSlug="slug-generator" toolName={tUI('title')} />
        </div>
      </GlobalContainer>
    </>
  );
}
