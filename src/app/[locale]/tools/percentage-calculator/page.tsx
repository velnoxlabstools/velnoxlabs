'use client';

import React, { useState, useCallback } from 'react';
import { GlobalContainer } from '@/components/layout';
import { SectionHeading } from '@/components/ui';
import { ToolSeoContent } from '@/features/tools/sections/ToolSeoContent';

type Mode = 'of' | 'isWhatPercent' | 'increase' | 'decrease' | 'difference';

export default function PercentageCalculatorPage() {
  const [mode, setMode] = useState<Mode>('of');
  const [a, setA] = useState('15');
  const [b, setB] = useState('200');
  const [result, setResult] = useState('');
  const [copied, setCopied] = useState(false);
  const calculate = (currentMode: Mode, aVal: string, bVal: string) => {
    const numA = parseFloat(aVal);
    const numB = parseFloat(bVal);
    if (isNaN(numA) || isNaN(numB)) return '';

    switch (currentMode) {
      case 'of':
        return ((numA / 100) * numB).toFixed(4).replace(/\.?0+$/, '');
      case 'isWhatPercent':
        if (numB === 0) return 'Cannot divide by zero';
        return ((numA / numB) * 100).toFixed(4).replace(/\.?0+$/, '') + '%';
      case 'increase':
        if (numA === 0) return 'Cannot divide by zero';
        return (((numB - numA) / numA) * 100).toFixed(4).replace(/\.?0+$/, '') + '%';
      case 'decrease':
        if (numA === 0) return 'Cannot divide by zero';
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
  };

  const handleCalculate = useCallback((newMode: Mode, newA: string, newB: string) => {
    setResult(calculate(newMode, newA, newB));
  }, []);

  React.useEffect(() => {
    handleCalculate(mode, a, b);
  }, [mode, a, b, handleCalculate]);

  const getLabels = () => {
    switch (mode) {
      case 'of':
        return { a: 'Percentage (%)', b: 'Of Number', prefix: 'Result:' };
      case 'isWhatPercent':
        return { a: 'First Number', b: 'Second Number', prefix: 'is what % of' };
      case 'increase':
        return { a: 'Original Value', b: 'New Value', prefix: 'Percentage Increase:' };
      case 'decrease':
        return { a: 'Original Value', b: 'New Value', prefix: 'Percentage Decrease:' };
      case 'difference':
        return { a: 'First Value', b: 'Second Value', prefix: 'Percentage Difference:' };
    }
  };

  const labels = getLabels();

  const modes: { key: Mode; label: string }[] = [
    { key: 'of', label: 'X% of Y' },
    { key: 'isWhatPercent', label: 'X is what % of Y' },
    { key: 'increase', label: '% Increase' },
    { key: 'decrease', label: '% Decrease' },
    { key: 'difference', label: '% Difference' },
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
          <SectionHeading
            title="Percentage Calculator"
            subtitle="Calculate percentages, increases, decreases, and differences instantly with our free online tool."
          />

          <div
            style={{
              backgroundColor: 'rgba(255,255,255,0.02)',
              border: '1px solid rgba(255,255,255,0.08)',
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
                    backgroundColor:
                      mode === m.key ? 'rgba(59, 130, 246, 0.25)' : 'rgba(0,0,0,0.3)',
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
                    color: '#fff',
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
                  placeholder="Enter value"
                  style={{
                    width: '100%',
                    backgroundColor: 'rgba(0,0,0,0.3)',
                    border: '1px solid rgba(255,255,255,0.1)',
                    borderRadius: '8px',
                    color: '#fff',
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
                    color: '#fff',
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
                  placeholder="Enter value"
                  style={{
                    width: '100%',
                    backgroundColor: 'rgba(0,0,0,0.3)',
                    border: '1px solid rgba(255,255,255,0.1)',
                    borderRadius: '8px',
                    color: '#fff',
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
                  color: '#fff',
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
              {copied ? '✓ Copied!' : '📋 Copy Result'}
            </button>

            {/* Common Examples */}
            <div
              style={{
                marginTop: '20px',
                backgroundColor: 'rgba(0,0,0,0.3)',
                border: '1px solid rgba(255,255,255,0.08)',
                borderRadius: '8px',
                padding: '16px',
              }}
            >
              <div
                style={{
                  color: '#94a3b8',
                  fontSize: '0.8rem',
                  fontWeight: 600,
                  marginBottom: '10px',
                }}
              >
                💡 Common Examples:
              </div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                {[
                  { a: '15', b: '200', label: '15% of 200' },
                  { a: '20', b: '150', label: '20% of 150 (tip)' },
                  { a: '10', b: '100', label: '10% of 100 (discount)' },
                  { a: '25', b: '80', label: '25% of 80' },
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

          <ToolSeoContent toolSlug="percentage-calculator" toolName="Percentage Calculator" />
        </div>
      </GlobalContainer>
    </>
  );
}
