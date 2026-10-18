'use client';

import React, { useState, useCallback } from 'react';
import { useTranslations } from 'next-intl';
import { GlobalContainer } from '@/components/layout';
import { SectionHeading } from '@/components/ui';
import { ToolSeoContent } from '@/features/tools/sections/ToolSeoContent';

type Mode = 'of' | 'isWhatPercent' | 'increase' | 'decrease' | 'difference';

export default function PercentageCalculatorPage() {
  const tUI = useTranslations('ToolUI.percentageCalculator');
  const [mode, setMode] = useState<Mode>('of');
  const [a, setA] = useState('15');
  const [b, setB] = useState('200');
  const [result, setResult] = useState('');
  const [copied, setCopied] = useState(false);

  const calculate = useCallback(
    (currentMode: Mode, aVal: string, bVal: string) => {
      const numA = parseFloat(aVal);
      const numB = parseFloat(bVal);
      if (isNaN(numA) || isNaN(numB)) return '';

      switch (currentMode) {
        case 'of':
          return ((numA / 100) * numB).toFixed(4).replace(/\.?0+$/, '');
        case 'isWhatPercent':
          if (numB === 0) return tUI('cannotDivideByZero');
          return ((numA / numB) * 100).toFixed(4).replace(/\.?0+$/, '') + '%';
        case 'increase':
          if (numA === 0) return tUI('cannotDivideByZero');
          return (((numB - numA) / numA) * 100).toFixed(4).replace(/\.?0+$/, '') + '%';
        case 'decrease':
          if (numA === 0) return tUI('cannotDivideByZero');
          return (((numA - numB) / numA) * 100).toFixed(4).replace(/\.?0+$/, '') + '%';
        case 'difference':
          if (numA === 0 && numB === 0) return '0%';
          return (
            ((Math.abs(numA - numB) / ((numA + numB) / 2)) * 100).toFixed(4).replace(/\.?0+$/, '') +
            '%'
          );
        default:
          return '';
      }
    },
    [tUI]
  );

  const handleCalculate = useCallback(
    (newMode: Mode, newA: string, newB: string) => {
      setResult(calculate(newMode, newA, newB));
    },
    [calculate]
  );

  React.useEffect(() => {
    handleCalculate(mode, a, b);
  }, [mode, a, b, handleCalculate]);

  const getLabels = () => {
    switch (mode) {
      case 'of':
        return { a: tUI('percentageLabel'), b: tUI('ofNumberLabel'), prefix: tUI('resultPrefix') };
      case 'isWhatPercent':
        return {
          a: tUI('firstNumberLabel'),
          b: tUI('secondNumberLabel'),
          prefix: tUI('isWhatPercentPrefix'),
        };
      case 'increase':
        return {
          a: tUI('originalValueLabel'),
          b: tUI('newValueLabel'),
          prefix: tUI('increasePrefix'),
        };
      case 'decrease':
        return {
          a: tUI('originalValueLabel'),
          b: tUI('newValueLabel'),
          prefix: tUI('decreasePrefix'),
        };
      case 'difference':
        return {
          a: tUI('firstValueLabel'),
          b: tUI('secondValueLabel'),
          prefix: tUI('differencePrefix'),
        };
    }
  };

  const labels = getLabels();

  const modes: { key: Mode; label: string }[] = [
    { key: 'of', label: tUI('modeOf') },
    { key: 'isWhatPercent', label: tUI('modeIsWhatPercent') },
    { key: 'increase', label: tUI('modeIncrease') },
    { key: 'decrease', label: tUI('modeDecrease') },
    { key: 'difference', label: tUI('modeDifference') },
  ];

  const handleCopy = () => {
    if (!result) return;
    navigator.clipboard.writeText(result);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const schemaData = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'SoftwareApplication',
        name: 'VelnoxLabs Percentage Calculator',
        operatingSystem: 'All',
        applicationCategory: 'UtilityApplication',
        offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
        description:
          'Free online percentage calculator — calculate percentages, percentage increase, decrease, and difference instantly. Perfect for students, shoppers, finance, and daily math.',
      },
      {
        '@type': 'FAQPage',
        mainEntity: [
          {
            '@type': 'Question',
            name: 'How do I calculate a percentage?',
            acceptedAnswer: {
              '@type': 'Answer',
              text: 'To find X% of Y, multiply Y by X and divide by 100. Example: 15% of 200 = (15 × 200) / 100 = 30.',
            },
          },
          {
            '@type': 'Question',
            name: 'How do I calculate percentage increase?',
            acceptedAnswer: {
              '@type': 'Answer',
              text: 'Percentage increase = ((New Value − Original Value) / Original Value) × 100. Example: from 100 to 125 = 25% increase.',
            },
          },
          {
            '@type': 'Question',
            name: 'Is this Percentage Calculator free?',
            acceptedAnswer: {
              '@type': 'Answer',
              text: 'Yes, VelnoxLabs Percentage Calculator is 100% free with no sign-up required. All calculations happen in your browser.',
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
            {/* Mode Tabs */}
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginBottom: '24px' }}>
              {modes.map((m) => (
                <button
                  key={m.key}
                  onClick={() => setMode(m.key)}
                  style={{
                    backgroundColor: mode === m.key ? 'rgba(59, 130, 246, 0.25)' : 'var(--bg-page)',
                    color: mode === m.key ? '#60a5fa' : '#94a3b8',
                    border:
                      mode === m.key
                        ? '1px solid rgba(59, 130, 246, 0.5)'
                        : '1px solid rgba(255,255,255,0.1)',
                    borderRadius: '8px',
                    padding: '10px 16px',
                    fontSize: '0.85rem',
                    fontWeight: 600,
                    cursor: 'pointer',
                    transition: 'all 0.2s',
                  }}
                >
                  {m.label}
                </button>
              ))}
            </div>

            {/* Inputs */}
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                gap: '16px',
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
                  {labels.a}:
                </label>
                <input
                  type="number"
                  value={a}
                  onChange={(e) => setA(e.target.value)}
                  placeholder={tUI('enterValue')}
                  style={{
                    width: '100%',
                    backgroundColor: 'var(--bg-page)',
                    border: '1px solid var(--border-color)',
                    borderRadius: '8px',
                    color: 'var(--text-main)',
                    padding: '14px',
                    fontSize: '1.1rem',
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
                  {labels.b}:
                </label>
                <input
                  type="number"
                  value={b}
                  onChange={(e) => setB(e.target.value)}
                  placeholder={tUI('enterValue')}
                  style={{
                    width: '100%',
                    backgroundColor: 'var(--bg-page)',
                    border: '1px solid var(--border-color)',
                    borderRadius: '8px',
                    color: 'var(--text-main)',
                    padding: '14px',
                    fontSize: '1.1rem',
                    fontWeight: 700,
                    outline: 'none',
                    fontFamily: 'monospace',
                  }}
                />
              </div>
            </div>

            {/* Result */}
            <div
              style={{
                backgroundColor: 'rgba(59, 130, 246, 0.08)',
                border: '1px solid rgba(59, 130, 246, 0.25)',
                borderRadius: '12px',
                padding: '24px',
                textAlign: 'center',
                marginBottom: '16px',
              }}
            >
              <div
                style={{
                  color: '#93c5fd',
                  fontSize: '0.85rem',
                  fontWeight: 600,
                  textTransform: 'uppercase',
                  letterSpacing: '0.05em',
                  marginBottom: '8px',
                }}
              >
                {labels.prefix}
              </div>
              <div
                style={{
                  color: 'var(--text-main)',
                  fontSize: '2.5rem',
                  fontWeight: 800,
                  fontFamily: 'monospace',
                  wordBreak: 'break-all',
                }}
              >
                {result || '—'}
              </div>
            </div>

            {/* Copy Button */}
            <button
              onClick={handleCopy}
              style={{
                width: '100%',
                backgroundColor: copied ? 'rgba(16, 185, 129, 0.3)' : 'rgba(59, 130, 246, 0.15)',
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
              {copied ? tUI('copied') : tUI('copyResult')}
            </button>

            {/* Common Examples */}
            <div
              style={{
                marginTop: '20px',
                backgroundColor: 'var(--bg-page)',
                border: '1px solid var(--border-color)',
                borderRadius: '8px',
                padding: '16px',
              }}
            >
              <div
                style={{
                  color: 'var(--text-muted)',
                  fontSize: '0.8rem',
                  fontWeight: 600,
                  marginBottom: '10px',
                }}
              >
                {tUI('commonExamples')}
              </div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                {[
                  { a: '15', b: '200', label: tUI('example1') },
                  { a: '20', b: '150', label: tUI('example2') },
                  { a: '10', b: '100', label: tUI('example3') },
                  { a: '25', b: '80', label: tUI('example4') },
                ].map((ex, i) => (
                  <button
                    key={i}
                    onClick={() => {
                      setMode('of');
                      setA(ex.a);
                      setB(ex.b);
                    }}
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
                    {ex.label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <ToolSeoContent toolSlug="percentage-calculator" toolName={tUI('title')} />
        </div>
      </GlobalContainer>
    </>
  );
}
