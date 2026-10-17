'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useTranslations } from 'next-intl';
import { GlobalContainer } from '@/components/layout';
import { SectionHeading } from '@/components/ui';
import { ToolSeoContent } from '@/features/tools/sections/ToolSeoContent';

export default function HtmlEncoderDecoderPage() {
  const tUI = useTranslations('ToolUI.htmlEncoderDecoder');
  const [input, setInput] = useState('<div class="container">Hello VelnoxLabs!</div>');
  const [output, setOutput] = useState('');
  const [mode, setMode] = useState<'encode' | 'decode'>('encode');
  const [copied, setCopied] = useState(false);
  const handleProcess = useCallback(
    (text: string, currentMode: 'encode' | 'decode' = mode) => {
      setInput(text);
      if (!text) {
        setOutput('');
        return;
      }

      if (currentMode === 'encode') {
        const encoded = text
          .replace(/&/g, '&amp;')
          .replace(/</g, '&lt;')
          .replace(/>/g, '&gt;')
          .replace(/"/g, '&quot;')
          .replace(/'/g, '&#039;');
        setOutput(encoded);
      } else {
        const decoded = text
          .replace(/&amp;/g, '&')
          .replace(/&lt;/g, '<')
          .replace(/&gt;/g, '>')
          .replace(/&quot;/g, '"')
          .replace(/&#039;/g, "'");
        setOutput(decoded);
      }
    },
    [mode]
  );

  const toggleMode = (newMode: 'encode' | 'decode') => {
    setMode(newMode);
    handleProcess(input, newMode);
  };

  // Auto-run on mount
  useEffect(() => {
    if (input) {
      handleProcess(input, mode);
    }
  }, [handleProcess, input, mode]);

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
        name: 'VelnoxLabs HTML Encoder & Decoder',
        operatingSystem: 'All',
        applicationCategory: 'DeveloperApplication',
        offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
        description:
          'Encode special characters into safe HTML entities or decode entities back to plain text instantly in your browser.',
      },
      {
        '@type': 'FAQPage',
        mainEntity: [
          {
            '@type': 'Question',
            name: 'How to encode or decode HTML entities online?',
            acceptedAnswer: {
              '@type': 'Answer',
              text: 'Type or paste your raw text or HTML entities to convert them instantly based on your selected mode.',
            },
          },
          {
            '@type': 'Question',
            name: 'Is HTML processing secure?',
            acceptedAnswer: {
              '@type': 'Answer',
              text: 'Yes, 100% client-side processing ensuring total privacy and lightning-fast execution.',
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
            title="HTML Encoder & Decoder"
            subtitle="Safely convert special characters into HTML entities or decode entities back into readable strings."
            toolSlug="html-encoder-decoder"
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
            <div style={{ display: 'flex', gap: '8px', marginBottom: '20px' }}>
              <button
                onClick={() => toggleMode('encode')}
                style={{
                  backgroundColor:
                    mode === 'encode' ? 'rgba(59, 130, 246, 0.25)' : 'var(--bg-page)',
                  color: mode === 'encode' ? '#60a5fa' : '#94a3b8',
                  border: '1px solid rgba(59, 130, 246, 0.3)',
                  borderRadius: '8px',
                  padding: '8px 20px',
                  fontSize: '0.9rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                }}
              >
                {tUI('encode')}
              </button>
              <button
                onClick={() => toggleMode('decode')}
                style={{
                  backgroundColor:
                    mode === 'decode' ? 'rgba(59, 130, 246, 0.25)' : 'var(--bg-page)',
                  color: mode === 'decode' ? '#60a5fa' : '#94a3b8',
                  border: '1px solid rgba(59, 130, 246, 0.3)',
                  borderRadius: '8px',
                  padding: '8px 20px',
                  fontSize: '0.9rem',
                  fontWeight: 600,
                  cursor: 'pointer',
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
                  {mode === 'encode' ? tUI('rawInput') : tUI('encodedInput')}
                </label>
                <textarea
                  value={input}
                  onChange={(e) => handleProcess(e.target.value, mode)}
                  rows={10}
                  placeholder={
                    mode === 'encode' ? tUI('rawPlaceholder') : tUI('encodedPlaceholder')
                  }
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
                    resize: 'vertical',
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
                    {mode === 'encode' ? tUI('encodedOutput') : tUI('decodedOutput')}
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
                  value={output}
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
                    resize: 'vertical',
                  }}
                />
              </div>
            </div>
          </div>

          <ToolSeoContent toolSlug="html-encoder-decoder" toolName="HTML Encoder & Decoder" />
        </div>
      </GlobalContainer>
    </>
  );
}
