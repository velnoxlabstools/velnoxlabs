'use client';

import React, { useState } from 'react';
import { GlobalContainer } from '@/components/layout';
import { SectionHeading } from '@/components/ui';
import { ToolSeoContent } from '@/features/tools/sections/ToolSeoContent';

export default function CaseConverterPage() {
  const [input, setInput] = useState('hello world from velnoxlabs');
  const [output, setOutput] = useState('');
  const [copied, setCopied] = useState(false);
  const handleUpper = () => setOutput(input.toUpperCase());
  const handleLower = () => setOutput(input.toLowerCase());
  const handleTitle = () => {
    setOutput(
      input.replace(/\w\S*/g, (txt) => txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase())
    );
  };
  const handleCamel = () => {
    const words = input.trim().split(/[\s_-]+/);
    if (words.length === 0) return;
    const camel = words
      .map((w, index) => {
        if (index === 0) return w.toLowerCase();
        return w.charAt(0).toUpperCase() + w.slice(1).toLowerCase();
      })
      .join('');
    setOutput(camel);
  };
  const handleSnake = () => setOutput(input.trim().replace(/\s+/g, '_').toLowerCase());
  const handleKebab = () => setOutput(input.trim().replace(/\s+/g, '-').toLowerCase());

  const handleCopy = () => {
    if (!output) return;
    navigator.clipboard.writeText(output);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleClear = () => {
    setInput('');
    setOutput('');
  };

  const schemaData = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'SoftwareApplication',
        name: 'VelnoxLabs Case Converter',
        operatingSystem: 'All',
        applicationCategory: 'DeveloperApplication',
        offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
        description:
          'Convert text case between UPPERCASE, lowercase, camelCase, snake_case, kebab-case, and Title Case instantly inside your browser.',
      },
      {
        '@type': 'FAQPage',
        mainEntity: [
          {
            '@type': 'Question',
            name: 'How to convert text case online?',
            acceptedAnswer: {
              '@type': 'Answer',
              text: 'Type or paste your text in the box and click any case transformation button to instantly change the format.',
            },
          },
          {
            '@type': 'Question',
            name: 'Is this tool free and private?',
            acceptedAnswer: {
              '@type': 'Answer',
              text: 'Yes, 100% free with client-side text processing and zero data tracking.',
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
          <SectionHeading
            title="Case Converter"
            subtitle="Transform text formats seamlessly between UPPERCASE, lowercase, camelCase, snake_case, and more."
          />

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
                  Input:
                </label>
                <textarea
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  rows={10}
                  placeholder="Enter your text here..."
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
                    Output:
                  </label>
                  <button
                    onClick={handleCopy}
                    style={{
                      backgroundColor: 'rgba(59, 130, 246, 0.15)',
                      color: '#60a5fa',
                      border: '1px solid rgba(59, 130, 246, 0.3)',
                      borderRadius: '6px',
                      padding: '4px 12px',
                      fontSize: '0.75rem',
                      fontWeight: 600,
                      cursor: 'pointer',
                    }}
                  >
                    {copied ? 'Copied!' : 'Copy'}
                  </button>
                </div>
                <textarea
                  value={output}
                  readOnly
                  rows={10}
                  placeholder="Click a case button below to see the result..."
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
                  }}
                />
              </div>
            </div>

            {/* 👇 BUTTONS AB YAHAN HAIN (SEO KE UPAR) 👇 */}
            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginTop: '20px' }}>
              <button
                onClick={handleUpper}
                style={{
                  backgroundColor: '#2563eb',
                  color: '#fff',
                  border: 'none',
                  borderRadius: '8px',
                  padding: '8px 16px',
                  fontSize: '0.85rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                }}
              >
                UPPERCASE
              </button>
              <button
                onClick={handleLower}
                style={{
                  backgroundColor: '#2563eb',
                  color: '#fff',
                  border: 'none',
                  borderRadius: '8px',
                  padding: '8px 16px',
                  fontSize: '0.85rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                }}
              >
                lowercase
              </button>
              <button
                onClick={handleTitle}
                style={{
                  backgroundColor: '#2563eb',
                  color: '#fff',
                  border: 'none',
                  borderRadius: '8px',
                  padding: '8px 16px',
                  fontSize: '0.85rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                }}
              >
                Title Case
              </button>
              <button
                onClick={handleCamel}
                style={{
                  backgroundColor: '#2563eb',
                  color: '#fff',
                  border: 'none',
                  borderRadius: '8px',
                  padding: '8px 16px',
                  fontSize: '0.85rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                }}
              >
                camelCase
              </button>
              <button
                onClick={handleSnake}
                style={{
                  backgroundColor: '#2563eb',
                  color: '#fff',
                  border: 'none',
                  borderRadius: '8px',
                  padding: '8px 16px',
                  fontSize: '0.85rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                }}
              >
                snake_case
              </button>
              <button
                onClick={handleKebab}
                style={{
                  backgroundColor: '#2563eb',
                  color: '#fff',
                  border: 'none',
                  borderRadius: '8px',
                  padding: '8px 16px',
                  fontSize: '0.85rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                }}
              >
                kebab-case
              </button>
              <button
                onClick={handleClear}
                style={{
                  backgroundColor: 'var(--bg-card)',
                  color: 'var(--text-muted)',
                  border: '1px solid var(--border-color)',
                  borderRadius: '8px',
                  padding: '8px 16px',
                  fontSize: '0.85rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                }}
              >
                Clear
              </button>
            </div>
            {/* 👆 BUTTONS YAHAN KHATAM 👆 */}
          </div>

          <ToolSeoContent toolSlug="case-converter" toolName="Case Converter" />
        </div>
      </GlobalContainer>
    </>
  );
}
