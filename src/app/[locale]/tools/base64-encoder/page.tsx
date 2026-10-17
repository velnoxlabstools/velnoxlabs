'use client';

import React, { useState, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { GlobalContainer } from '@/components/layout';
import { SectionHeading } from '@/components/ui';
import { ToolSeoContent } from '@/features/tools/sections/ToolSeoContent';

export default function Base64EncoderPage() {
  const t = useTranslations('ToolUI.base64Encoder');
  const [input, setInput] = useState('Hello VelnoxLabs!');
  const [output, setOutput] = useState('');
  const [mode, setMode] = useState<'encode' | 'decode'>('encode');
  const [error, setError] = useState('');
  const [copied, setCopied] = useState(false);

  const process = React.useCallback(
    (text: string, currentMode: 'encode' | 'decode') => {
      setError('');
      if (!text.trim()) {
        setOutput('');
        return;
      }
      try {
        if (currentMode === 'encode') {
          setOutput(btoa(unescape(encodeURIComponent(text))));
        } else {
          setOutput(decodeURIComponent(escape(atob(text))));
        }
      } catch {
        setError(t('invalidInput'));
        setOutput('');
      }
    },
    [t]
  );

  // Auto-run on input/mode change
  useEffect(() => {
    process(input, mode);
  }, [input, mode, process]);

  const handleCopy = () => {
    if (!output) return;
    navigator.clipboard.writeText(output);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleClear = () => {
    setInput('');
    setOutput('');
    setError('');
  };

  const schemaData = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'SoftwareApplication',
        name: 'VelnoxLabs Base64 Encoder & Decoder',
        operatingSystem: 'All',
        applicationCategory: 'DeveloperApplication',
        offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
        description:
          'Encode and decode Base64 strings instantly in your browser with secure, zero-latency client-side processing.',
      },
      {
        '@type': 'FAQPage',
        mainEntity: [
          {
            '@type': 'Question',
            name: 'How to encode or decode Base64 online?',
            acceptedAnswer: {
              '@type': 'Answer',
              text: 'Paste your text or Base64 string into the input box, select Encode or Decode mode, and the result appears instantly.',
            },
          },
          {
            '@type': 'Question',
            name: 'Is this Base64 tool secure?',
            acceptedAnswer: {
              '@type': 'Answer',
              text: 'Absolutely. All encoding and decoding functions are performed locally in your browser. No data is sent to our servers.',
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
            title="Base64 Encoder & Decoder"
            subtitle="Encode text to Base64 or decode Base64 strings instantly with absolute client-side privacy."
          />

          {/* ========== TOOL UI ========== */}
          <div
            style={{
              backgroundColor: 'var(--bg-card)',
              border: '1px solid var(--border-color)',
              borderRadius: '12px',
              padding: '24px',
              marginTop: 'var(--space-6)',
            }}
          >
            {/* Mode tabs */}
            <div style={{ display: 'flex', gap: '8px', marginBottom: '20px' }}>
              <button
                onClick={() => setMode('encode')}
                style={{
                  backgroundColor:
                    mode === 'encode' ? 'rgba(59, 130, 246, 0.25)' : 'var(--bg-page)',
                  color: mode === 'encode' ? '#60a5fa' : '#94a3b8',
                  border: '1px solid rgba(59, 130, 246, 0.3)',
                  borderRadius: '6px',
                  padding: '8px 20px',
                  fontSize: '0.85rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                }}
              >
                {t('encode')}
              </button>
              <button
                onClick={() => setMode('decode')}
                style={{
                  backgroundColor:
                    mode === 'decode' ? 'rgba(59, 130, 246, 0.25)' : 'var(--bg-page)',
                  color: mode === 'decode' ? '#60a5fa' : '#94a3b8',
                  border: '1px solid rgba(59, 130, 246, 0.3)',
                  borderRadius: '6px',
                  padding: '8px 20px',
                  fontSize: '0.85rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                }}
              >
                {t('decode')}
              </button>
            </div>

            {/* Input / Output */}
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
                  {mode === 'encode' ? t('textInput') : t('base64Input')}
                </label>
                <textarea
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  rows={10}
                  placeholder={
                    mode === 'encode' ? t('enterTextPlaceholder') : t('pasteBase64Placeholder')
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
                    {mode === 'encode' ? t('base64Output') : t('decodedOutput')}
                  </label>
                  <button
                    onClick={handleCopy}
                    disabled={!output}
                    style={{
                      backgroundColor: output ? 'rgba(59, 130, 246, 0.15)' : 'var(--bg-card)',
                      color: output ? '#60a5fa' : '#64748b',
                      border: '1px solid rgba(59, 130, 246, 0.3)',
                      borderRadius: '6px',
                      padding: '4px 12px',
                      fontSize: '0.75rem',
                      fontWeight: 600,
                      cursor: output ? 'pointer' : 'not-allowed',
                    }}
                  >
                    {copied ? t('copied') : t('copy')}
                  </button>
                </div>
                <textarea
                  value={output}
                  readOnly
                  rows={10}
                  placeholder={t('outputPlaceholder')}
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

            {/* Error */}
            {error && (
              <div
                style={{
                  marginTop: '12px',
                  backgroundColor: 'rgba(239, 68, 68, 0.1)',
                  border: '1px solid rgba(239, 68, 68, 0.3)',
                  borderRadius: '8px',
                  padding: '12px',
                }}
              >
                <p style={{ color: '#f87171', fontSize: '0.85rem', margin: 0 }}>❌ {error}</p>
              </div>
            )}

            {/* Action buttons */}
            <div style={{ display: 'flex', gap: '12px', marginTop: '20px' }}>
              <button
                onClick={() => process(input, mode)}
                style={{
                  backgroundColor: '#2563eb',
                  color: '#ffffff',
                  border: 'none',
                  borderRadius: '8px',
                  padding: '10px 24px',
                  fontSize: '0.9rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                }}
              >
                {mode === 'encode' ? t('encode') : t('decode')}
              </button>
              <button
                onClick={handleClear}
                style={{
                  backgroundColor: 'var(--bg-card)',
                  color: 'var(--text-muted)',
                  border: '1px solid var(--border-color)',
                  borderRadius: '8px',
                  padding: '10px 24px',
                  fontSize: '0.9rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                }}
              >
                {t('clear')}
              </button>
            </div>
          </div>

          <ToolSeoContent toolSlug="base64-encoder" toolName="Base64 Encoder & Decoder" />
        </div>
      </GlobalContainer>
    </>
  );
}
