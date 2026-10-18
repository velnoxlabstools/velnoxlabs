'use client';

import React, { useState, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { GlobalContainer } from '@/components/layout';
import { SectionHeading } from '@/components/ui';
import { ToolSeoContent } from '@/features/tools/sections/ToolSeoContent';

type VariationKey =
  | 'blendAB'
  | 'blendBA'
  | 'aInitialB'
  | 'bInitialA'
  | 'underscore'
  | 'hyphenated'
  | 'camelCase'
  | 'pascalCase'
  | 'reversed'
  | 'interleaved'
  | 'first3'
  | 'vowelsConsonants';

function combineNames(a: string, b: string): { key: VariationKey; value: string }[] {
  const A = a.trim();
  const B = b.trim();
  if (!A || !B) return [];

  const aLow = A.toLowerCase();
  const bLow = B.toLowerCase();

  const results: { key: VariationKey; value: string }[] = [];

  const aHalf = A.slice(0, Math.ceil(A.length / 2));
  const bHalf = B.slice(Math.floor(B.length / 2));
  results.push({ key: 'blendAB', value: (aHalf + bHalf).toLowerCase() });

  const bFirst = B.slice(0, Math.ceil(B.length / 2));
  const aSecond = A.slice(Math.floor(A.length / 2));
  results.push({ key: 'blendBA', value: (bFirst + aSecond).toLowerCase() });

  results.push({ key: 'aInitialB', value: (A + B.charAt(0)).toLowerCase() });
  results.push({ key: 'bInitialA', value: (A.charAt(0) + B).toLowerCase() });
  results.push({ key: 'underscore', value: aLow + '_' + bLow });
  results.push({ key: 'hyphenated', value: aLow + '-' + bLow });
  results.push({
    key: 'camelCase',
    value: aLow + B.charAt(0).toUpperCase() + B.slice(1).toLowerCase(),
  });
  results.push({
    key: 'pascalCase',
    value:
      A.charAt(0).toUpperCase() +
      A.slice(1).toLowerCase() +
      B.charAt(0).toUpperCase() +
      B.slice(1).toLowerCase(),
  });
  results.push({ key: 'reversed', value: bLow + aLow });

  let shuffled = '';
  const maxLen = Math.max(A.length, B.length);
  for (let i = 0; i < maxLen; i++) {
    if (i < A.length) shuffled += A[i].toLowerCase();
    if (i < B.length) shuffled += B[i].toLowerCase();
  }
  results.push({ key: 'interleaved', value: shuffled });
  results.push({
    key: 'first3',
    value: (A.slice(0, 3) + B.slice(0, 3)).toLowerCase(),
  });

  const vowelsA = A.toLowerCase()
    .split('')
    .filter((c) => 'aeiou'.includes(c))
    .join('');
  const consB = B.toLowerCase()
    .split('')
    .filter((c) => !'aeiou'.includes(c))
    .join('');
  if (vowelsA || consB) {
    results.push({ key: 'vowelsConsonants', value: vowelsA + consB });
  }

  return results;
}

export default function NameCombinerPage() {
  const tUI = useTranslations('ToolUI.nameCombiner');
  const [nameA, setNameA] = useState('John');
  const [nameB, setNameB] = useState('Emma');
  const [results, setResults] = useState<{ key: VariationKey; value: string }[]>([]);
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);
  const [favorites, setFavorites] = useState<string[]>([]);
  useEffect(() => {
    setResults(combineNames(nameA, nameB));
  }, [nameA, nameB]);

  useEffect(() => {
    const saved = localStorage.getItem('velnox-name-favorites');
    if (saved) {
      try {
        setFavorites(JSON.parse(saved));
      } catch {}
    }
  }, []);

  const handleCopy = (text: string, index: number) => {
    if (!text) return;
    navigator.clipboard.writeText(text);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  const toggleFavorite = (value: string) => {
    const updated = favorites.includes(value)
      ? favorites.filter((f) => f !== value)
      : [...favorites, value];
    setFavorites(updated);
    localStorage.setItem('velnox-name-favorites', JSON.stringify(updated));
  };

  const handleSwap = () => {
    setNameA(nameB);
    setNameB(nameA);
  };

  const presets = [
    { a: 'John', b: 'Emma', label: '💕 John + Emma' },
    { a: 'Michael', b: 'Sarah', label: '✨ Michael + Sarah' },
    { a: 'David', b: 'Olivia', label: '❤️ David + Olivia' },
    { a: 'James', b: 'Sophia', label: '🌟 James + Sophia' },
  ];

  const shareOnWhatsApp = (value: string) => {
    window.open(
      `https://wa.me/?text=${encodeURIComponent(value + ' — made with VelnoxLabs Name Combiner')}`,
      '_blank'
    );
  };

  const shareOnTwitter = (value: string) => {
    window.open(
      `https://twitter.com/intent/tweet?text=${encodeURIComponent(value + ' — made with @VelnoxLabs')}`,
      '_blank'
    );
  };

  const schemaData = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'SoftwareApplication',
        name: 'VelnoxLabs Name Combiner',
        operatingSystem: 'All',
        applicationCategory: 'UtilityApplication',
        offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
        description:
          'Free Name Combiner tool — combine two names into creative blends, couple names, ship names, and brand names instantly. Works for any language and origin.',
      },
      {
        '@type': 'FAQPage',
        mainEntity: [
          {
            '@type': 'Question',
            name: 'What is a Name Combiner?',
            acceptedAnswer: {
              '@type': 'Answer',
              text: 'A Name Combiner merges two names into multiple creative variations like blended couple names, ship names, brand names, and baby name ideas.',
            },
          },
          {
            '@type': 'Question',
            name: 'Is this Name Combiner free?',
            acceptedAnswer: {
              '@type': 'Answer',
              text: 'Yes, VelnoxLabs Name Combiner is 100% free with no sign-up required and works with any name from any language.',
            },
          },
          {
            '@type': 'Question',
            name: 'Can I use it for brand names?',
            acceptedAnswer: {
              '@type': 'Answer',
              text: 'Absolutely. It generates camelCase, PascalCase, hyphenated, and underscore versions perfect for brand names and social media handles.',
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
                onClick={() => {
                  setNameA(p.a);
                  setNameB(p.b);
                }}
                style={{
                  backgroundColor: 'rgba(59, 130, 246, 0.1)',
                  color: '#60a5fa',
                  border: '1px solid rgba(59, 130, 246, 0.3)',
                  borderRadius: '20px',
                  padding: '6px 14px',
                  fontSize: '0.8rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                }}
              >
                {p.label}
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
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: '1fr auto 1fr',
                gap: '16px',
                alignItems: 'end',
                marginBottom: '24px',
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
                  {tUI('firstName')}
                </label>
                <input
                  type="text"
                  value={nameA}
                  onChange={(e) => setNameA(e.target.value)}
                  placeholder={tUI('firstNamePlaceholder')}
                  style={{
                    width: '100%',
                    backgroundColor: 'var(--bg-page)',
                    border: '1px solid var(--border-color)',
                    borderRadius: '8px',
                    color: 'var(--text-main)',
                    padding: '12px',
                    fontSize: '0.95rem',
                    outline: 'none',
                  }}
                />
              </div>
              <button
                onClick={handleSwap}
                title={tUI('swap')}
                style={{
                  backgroundColor: 'rgba(59, 130, 246, 0.15)',
                  color: '#60a5fa',
                  border: '1px solid rgba(59, 130, 246, 0.3)',
                  borderRadius: '8px',
                  padding: '12px',
                  fontSize: '1.2rem',
                  cursor: 'pointer',
                  marginBottom: '2px',
                }}
              >
                ⇄
              </button>
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
                  {tUI('secondName')}
                </label>
                <input
                  type="text"
                  value={nameB}
                  onChange={(e) => setNameB(e.target.value)}
                  placeholder={tUI('secondPlaceholder')}
                  style={{
                    width: '100%',
                    backgroundColor: 'var(--bg-page)',
                    border: '1px solid var(--border-color)',
                    borderRadius: '8px',
                    color: 'var(--text-main)',
                    padding: '12px',
                    fontSize: '0.95rem',
                    outline: 'none',
                  }}
                />
              </div>
            </div>

            <h3
              style={{
                color: 'var(--text-main)',
                fontSize: '1.1rem',
                fontWeight: 700,
                marginBottom: '12px',
              }}
            >
              {tUI('combinedVariations', { count: results.length })}
            </h3>

            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
                gap: '12px',
              }}
            >
              {results.map((r, idx) => (
                <div
                  key={idx}
                  style={{
                    backgroundColor:
                      copiedIndex === idx ? 'rgba(16, 185, 129, 0.15)' : 'var(--bg-page)',
                    border:
                      copiedIndex === idx
                        ? '1px solid rgba(16, 185, 129, 0.5)'
                        : '1px solid rgba(255,255,255,0.06)',
                    borderRadius: '8px',
                    padding: '12px 16px',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    gap: '12px',
                    transition: 'all 0.3s ease',
                    transform: copiedIndex === idx ? 'scale(1.02)' : 'scale(1)',
                  }}
                >
                  <div style={{ minWidth: 0, flex: 1 }}>
                    <div
                      style={{
                        color: '#64748b',
                        fontSize: '0.7rem',
                        fontWeight: 600,
                        textTransform: 'uppercase',
                        letterSpacing: '0.05em',
                        marginBottom: '2px',
                      }}
                    >
                      {tUI(r.key)}
                    </div>
                    <div
                      style={{
                        color: '#34d399',
                        fontFamily: 'monospace',
                        fontSize: '0.95rem',
                        wordBreak: 'break-all',
                      }}
                    >
                      {r.value}
                    </div>
                  </div>
                  <div style={{ display: 'flex', gap: '4px', flexShrink: 0 }}>
                    <button
                      onClick={() => toggleFavorite(r.value)}
                      title={tUI('saveFavorite')}
                      style={{
                        backgroundColor: favorites.includes(r.value)
                          ? 'rgba(239, 68, 68, 0.2)'
                          : 'rgba(255,255,255,0.05)',
                        color: favorites.includes(r.value) ? '#f87171' : '#94a3b8',
                        border: '1px solid var(--border-color)',
                        borderRadius: '6px',
                        padding: '4px 8px',
                        fontSize: '0.8rem',
                        cursor: 'pointer',
                      }}
                    >
                      {favorites.includes(r.value) ? '❤️' : '🤍'}
                    </button>
                    <button
                      onClick={() => shareOnWhatsApp(r.value)}
                      title={tUI('shareWhatsApp')}
                      style={{
                        backgroundColor: 'rgba(37, 211, 102, 0.15)',
                        color: '#4ade80',
                        border: '1px solid rgba(37, 211, 102, 0.3)',
                        borderRadius: '6px',
                        padding: '4px 8px',
                        fontSize: '0.7rem',
                        cursor: 'pointer',
                      }}
                    >
                      WA
                    </button>
                    <button
                      onClick={() => shareOnTwitter(r.value)}
                      title={tUI('shareTwitter')}
                      style={{
                        backgroundColor: 'rgba(29, 161, 242, 0.15)',
                        color: '#60a5fa',
                        border: '1px solid rgba(29, 161, 242, 0.3)',
                        borderRadius: '6px',
                        padding: '4px 8px',
                        fontSize: '0.7rem',
                        cursor: 'pointer',
                      }}
                    >
                      X
                    </button>
                    <button
                      onClick={() => handleCopy(r.value, idx)}
                      style={{
                        backgroundColor:
                          copiedIndex === idx
                            ? 'rgba(16, 185, 129, 0.3)'
                            : 'rgba(59, 130, 246, 0.15)',
                        color: copiedIndex === idx ? '#34d399' : '#60a5fa',
                        border: '1px solid rgba(59, 130, 246, 0.3)',
                        borderRadius: '6px',
                        padding: '4px 10px',
                        fontSize: '0.7rem',
                        fontWeight: 600,
                        cursor: 'pointer',
                      }}
                    >
                      {copiedIndex === idx ? tUI('copied') : tUI('copy')}
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {favorites.length > 0 && (
              <div
                style={{
                  marginTop: '24px',
                  paddingTop: '24px',
                  borderTop: '1px solid rgba(255,255,255,0.08)',
                }}
              >
                <h4
                  style={{
                    color: '#f87171',
                    fontSize: '0.9rem',
                    fontWeight: 700,
                    marginBottom: '12px',
                  }}
                >
                  {tUI('yourFavorites', { count: favorites.length })}
                </h4>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                  {favorites.map((fav, idx) => (
                    <span
                      key={idx}
                      onClick={() => handleCopy(fav, -idx - 1)}
                      style={{
                        backgroundColor: 'rgba(239, 68, 68, 0.1)',
                        color: '#f87171',
                        border: '1px solid rgba(239, 68, 68, 0.3)',
                        borderRadius: '20px',
                        padding: '6px 14px',
                        fontSize: '0.85rem',
                        cursor: 'pointer',
                        fontFamily: 'monospace',
                      }}
                    >
                      {fav}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>

          <ToolSeoContent toolSlug="name-combiner" toolName={tUI('title')} />
        </div>
      </GlobalContainer>
    </>
  );
}
