'use client';

import React, { useState } from 'react';
import { useTranslations } from 'next-intl';
import { GlobalContainer } from '@/components/layout';
import { SectionHeading } from '@/components/ui';
import { ToolSeoContent } from '@/features/tools/sections/ToolSeoContent';

function generateNumbers(min: number, max: number, count: number, unique: boolean, sort: string) {
  const range = max - min + 1;
  let numbers: number[] = [];

  if (unique) {
    const pool = new Set<number>();
    while (pool.size < count) {
      pool.add(Math.floor(Math.random() * range) + min);
    }
    numbers = Array.from(pool);
  } else {
    for (let i = 0; i < count; i++) {
      numbers.push(Math.floor(Math.random() * range) + min);
    }
  }

  if (sort === 'asc') numbers.sort((a, b) => a - b);
  else if (sort === 'desc') numbers.sort((a, b) => b - a);

  return numbers;
}

export default function RandomNumberGeneratorPage() {
  const tUI = useTranslations('ToolUI.randomNumberGenerator');
  const [min, setMin] = useState('1');
  const [max, setMax] = useState('100');
  const [count, setCount] = useState('5');
  const [unique, setUnique] = useState(false);
  const [sort, setSort] = useState('none');
  const [numbers, setNumbers] = useState<number[]>([]);
  const [error, setError] = useState('');
  const [copied, setCopied] = useState(false);

  const handleGenerate = () => {
    const minNum = parseInt(min) || 0;
    const maxNum = parseInt(max) || 100;
    const countNum = Math.min(1000, Math.max(1, parseInt(count) || 1));

    if (minNum > maxNum) {
      setError(tUI('errorMinMax'));
      setNumbers([]);
      return;
    }

    const range = maxNum - minNum + 1;
    if (unique && countNum > range) {
      setError(tUI('errorRange', { count: countNum, range }));
      setNumbers([]);
      return;
    }

    setError('');
    setNumbers(generateNumbers(minNum, maxNum, countNum, unique, sort));
  };

  React.useEffect(() => {
    handleGenerate();
    // eslint-disable-next-line react-hooks/exhaustive-deps -- mount-only generation, avoids re-shuffle on state change
  }, []);

  const handleCopy = () => {
    if (numbers.length === 0) return;
    navigator.clipboard.writeText(numbers.join(', '));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const schemaData = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'SoftwareApplication',
        name: 'VelnoxLabs Random Number Generator',
        operatingSystem: 'All',
        applicationCategory: 'UtilityApplication',
        offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
        description:
          'Free online random number generator — generate random numbers in any range, with unique-only option, sorting, and bulk generation up to 1000 numbers.',
      },
      {
        '@type': 'FAQPage',
        mainEntity: [
          {
            '@type': 'Question',
            name: 'How do I generate random numbers?',
            acceptedAnswer: {
              '@type': 'Answer',
              text: 'Enter your minimum and maximum range, choose how many numbers you want, and click Generate. You can also enable unique-only mode to prevent duplicates.',
            },
          },
          {
            '@type': 'Question',
            name: 'Are these numbers truly random?',
            acceptedAnswer: {
              '@type': 'Answer',
              text: "Yes. This tool uses the browser's built-in Math.random() which is a pseudo-random number generator. For most everyday purposes (games, drawings, decisions) it is sufficiently random.",
            },
          },
          {
            '@type': 'Question',
            name: 'Is this Random Number Generator free?',
            acceptedAnswer: {
              '@type': 'Answer',
              text: 'Yes, VelnoxLabs Random Number Generator is 100% free with no sign-up required. All generation happens in your browser.',
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

          <div
            style={{
              backgroundColor: 'var(--bg-card)',
              border: '1px solid var(--border-color)',
              borderRadius: '12px',
              padding: '24px',
              marginTop: 'var(--space-6)',
            }}
          >
            {/* Inputs */}
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
                gap: '16px',
                marginBottom: '20px',
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
                  {tUI('minLabel')}
                </label>
                <input
                  type="number"
                  value={min}
                  onChange={(e) => setMin(e.target.value)}
                  placeholder="1"
                  style={{
                    width: '100%',
                    backgroundColor: 'var(--bg-page)',
                    border: '1px solid var(--border-color)',
                    borderRadius: '8px',
                    color: 'var(--text-main)',
                    padding: '14px',
                    fontSize: '1.05rem',
                    fontWeight: 700,
                    outline: 'none',
                    fontFamily: 'monospace',
                  }}
                />
              </div>
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
                  {tUI('maxLabel')}
                </label>
                <input
                  type="number"
                  value={max}
                  onChange={(e) => setMax(e.target.value)}
                  placeholder="100"
                  style={{
                    width: '100%',
                    backgroundColor: 'var(--bg-page)',
                    border: '1px solid var(--border-color)',
                    borderRadius: '8px',
                    color: 'var(--text-main)',
                    padding: '14px',
                    fontSize: '1.05rem',
                    fontWeight: 700,
                    outline: 'none',
                    fontFamily: 'monospace',
                  }}
                />
              </div>
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
                  {tUI('countLabel')}
                </label>
                <input
                  type="number"
                  value={count}
                  onChange={(e) => setCount(e.target.value)}
                  placeholder="5"
                  min="1"
                  max="1000"
                  style={{
                    width: '100%',
                    backgroundColor: 'var(--bg-page)',
                    border: '1px solid var(--border-color)',
                    borderRadius: '8px',
                    color: 'var(--text-main)',
                    padding: '14px',
                    fontSize: '1.05rem',
                    fontWeight: 700,
                    outline: 'none',
                    fontFamily: 'monospace',
                  }}
                />
              </div>
            </div>

            {/* Options */}
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                gap: '16px',
                marginBottom: '20px',
              }}
            >
              <label
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px',
                  color: 'var(--text-muted)',
                  fontSize: '0.9rem',
                  cursor: 'pointer',
                }}
              >
                <input
                  type="checkbox"
                  checked={unique}
                  onChange={(e) => setUnique(e.target.checked)}
                  style={{
                    width: '18px',
                    height: '18px',
                    cursor: 'pointer',
                    accentColor: '#3b82f6',
                  }}
                />
                {tUI('uniqueLabel')}
              </label>
              <div>
                <label
                  style={{
                    color: 'var(--text-muted)',
                    fontSize: '0.85rem',
                    fontWeight: 600,
                    display: 'block',
                    marginBottom: '6px',
                  }}
                >
                  {tUI('sortLabel')}
                </label>
                <select
                  value={sort}
                  onChange={(e) => setSort(e.target.value)}
                  style={{
                    width: '100%',
                    backgroundColor: 'var(--bg-page)',
                    border: '1px solid var(--border-color)',
                    borderRadius: '8px',
                    color: 'var(--text-main)',
                    padding: '10px',
                    fontSize: '0.9rem',
                    outline: 'none',
                    cursor: 'pointer',
                  }}
                >
                  <option value="none">{tUI('sortNone')}</option>
                  <option value="asc">{tUI('sortAsc')}</option>
                  <option value="desc">{tUI('sortDesc')}</option>
                </select>
              </div>
            </div>

            {/* Generate Button */}
            <button
              onClick={handleGenerate}
              style={{
                width: '100%',
                backgroundColor: '#2563eb',
                color: '#fff',
                border: 'none',
                borderRadius: '8px',
                padding: '14px',
                fontSize: '1rem',
                fontWeight: 700,
                cursor: 'pointer',
                transition: 'all 0.2s',
                marginBottom: '20px',
              }}
            >
              {tUI('generateButton')}
            </button>

            {error && (
              <div
                style={{
                  backgroundColor: 'rgba(248, 113, 113, 0.1)',
                  border: '1px solid rgba(248, 113, 113, 0.3)',
                  borderRadius: '8px',
                  padding: '12px',
                  color: '#f87171',
                  fontSize: '0.9rem',
                  marginBottom: '20px',
                }}
              >
                ⚠️ {error}
              </div>
            )}

            {/* Result */}
            {numbers.length > 0 && (
              <>
                <div
                  style={{
                    backgroundColor: 'rgba(59, 130, 246, 0.08)',
                    border: '1px solid rgba(59, 130, 246, 0.25)',
                    borderRadius: '12px',
                    padding: '24px',
                    marginBottom: '16px',
                  }}
                >
                  <div
                    style={{
                      color: '#93c5fd',
                      fontSize: '0.8rem',
                      fontWeight: 600,
                      textTransform: 'uppercase',
                      letterSpacing: '0.05em',
                      marginBottom: '12px',
                      textAlign: 'center',
                    }}
                  >
                    {tUI('generatedHeading', { count: numbers.length })}
                  </div>
                  <div
                    style={{
                      display: 'flex',
                      flexWrap: 'wrap',
                      gap: '8px',
                      justifyContent: 'center',
                    }}
                  >
                    {numbers.map((n, i) => (
                      <span
                        key={i}
                        style={{
                          backgroundColor: 'var(--bg-page)',
                          border: '1px solid rgba(59, 130, 246, 0.3)',
                          borderRadius: '8px',
                          padding: '8px 14px',
                          color: '#34d399',
                          fontSize: '1.1rem',
                          fontWeight: 700,
                          fontFamily: 'monospace',
                          minWidth: '50px',
                          textAlign: 'center',
                        }}
                      >
                        {n}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Copy Button */}
                <button
                  onClick={handleCopy}
                  style={{
                    width: '100%',
                    backgroundColor: copied
                      ? 'rgba(16, 185, 129, 0.3)'
                      : 'rgba(59, 130, 246, 0.15)',
                    color: copied ? '#34d399' : '#60a5fa',
                    border: '1px solid rgba(59, 130, 246, 0.3)',
                    borderRadius: '8px',
                    padding: '12px',
                    fontSize: '0.9rem',
                    fontWeight: 700,
                    cursor: 'pointer',
                    transition: 'all 0.2s',
                  }}
                >
                  {copied ? tUI('copied') : tUI('copyAll')}
                </button>
              </>
            )}
          </div>

          <ToolSeoContent toolSlug="random-number-generator" toolName={tUI('title')} />
        </div>
      </GlobalContainer>
    </>
  );
}
