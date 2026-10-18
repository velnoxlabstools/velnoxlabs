'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useTranslations } from 'next-intl';
import { GlobalContainer } from '@/components/layout';
import { SectionHeading } from '@/components/ui';
import { ToolSeoContent } from '@/features/tools/sections/ToolSeoContent';

export default function UrlEncoderDecoderPage() {
  const tUI = useTranslations('ToolUI.urlEncoderDecoder');
  const [input, setInput] = useState('https://velnoxlabs.com/search?q=developer tools & utilities');
  const [output, setOutput] = useState('');
  const [mode, setMode] = useState<'encode' | 'decode'>('encode');
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState('');
  const handleProcess = useCallback(
    (text: string, currentMode: 'encode' | 'decode' = mode) => {
      setInput(text);
      setError('');
      if (!text.trim()) {
        setOutput('');
        return;
      }

      try {
        if (currentMode === 'encode') {
          setOutput(encodeURIComponent(text));
        } else {
          setOutput(decodeURIComponent(text));
        }
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : String(err);
        setError(msg || tUI('invalidFormat'));
        setOutput('');
      }
    },
    [mode, tUI]
  );

  const toggleMode = (newMode: 'encode' | 'decode') => {
    setMode(newMode);
    handleProcess(input, newMode);
  };

  // Auto-run on mount
  useEffect(() => {
    if (input) {
      handleProcess(input);
    }
  }, [handleProcess, input]);

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
        name: 'VelnoxLabs URL Encoder & Decoder',
        operatingSystem: 'All',
        applicationCategory: 'DeveloperApplication',
        offers: {
          '@type': 'Offer',
          price: '0',
          priceCurrency: 'USD',
        },
        description:
          'Encode and decode URLs and query parameters instantly inside your browser with secure client-side execution.',
      },
      {
        '@type': 'FAQPage',
        mainEntity: [
          {
            '@type': 'Question',
            name: 'How to encode or decode URLs online?',
            acceptedAnswer: {
              '@type': 'Answer',
              text: 'Paste your text or URL string into the input box to instantly convert it based on your selected mode.',
            },
          },
          {
            '@type': 'Question',
            name: 'Is URL processing secure?',
            acceptedAnswer: {
              '@type': 'Answer',
              text: 'Yes, everything is executed locally in your browser memory.',
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
            {/* Mode Toggle Buttons */}
            <div style={{ display: 'flex', gap: '10px', marginBottom: '20px' }}>
              <button
                onClick={() => toggleMode('encode')}
                style={{
                  backgroundColor: mode === 'encode' ? '#2563eb' : 'transparent',
                  color: mode === 'encode' ? '#fff' : '#94a3b8',
                  border: '1px solid #2563eb',
                  borderRadius: '6px',
                  padding: '8px 16px',
                  cursor: 'pointer',
                  fontSize: '0.875rem',
                  fontWeight: 600,
                }}
              >
                {tUI('encode')}
              </button>
              <button
                onClick={() => toggleMode('decode')}
                style={{
                  backgroundColor: mode === 'decode' ? '#2563eb' : 'transparent',
                  color: mode === 'decode' ? '#fff' : '#94a3b8',
                  border: '1px solid #2563eb',
                  borderRadius: '6px',
                  padding: '8px 16px',
                  cursor: 'pointer',
                  fontSize: '0.875rem',
                  fontWeight: 600,
                }}
              >
                {tUI('decode')}
              </button>
            </div>

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
                  {tUI('inputLabel')}
                </label>
                <textarea
                  value={input || ''}
                  onChange={(e) => handleProcess(e.target.value)}
                  rows={10}
                  placeholder={tUI('inputPlaceholder')}
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
                    {tUI('outputLabel')}
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
                    {copied ? tUI('copied') : tUI('copy')}
                  </button>
                </div>
                <textarea
                  value={output || ''}
                  readOnly
                  rows={10}
                  placeholder={tUI('outputPlaceholder')}
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
                {error && (
                  <p style={{ color: '#ef4444', fontSize: '0.875rem', marginTop: '8px' }}>
                    {error}
                  </p>
                )}
              </div>
            </div>
          </div>

          <ToolSeoContent toolSlug="url-encoder-decoder" toolName={tUI('title')} />
        </div>
      </GlobalContainer>
    </>
  );
}
