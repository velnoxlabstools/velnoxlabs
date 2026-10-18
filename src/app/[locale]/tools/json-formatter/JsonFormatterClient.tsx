'use client';

import React, { useState, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { GlobalContainer } from '@/components/layout';
import { SectionHeading, FeedbackForm } from '@/components/ui';

export default function JsonFormatterPage() {
  const t = useTranslations('Tools.json-formatter');
  const tUI = useTranslations('ToolUI.jsonFormatter');

  const [inputJson, setInputJson] = useState(
    '{\n  "name": "VelnoxLabs",\n  "version": "1.0.0",\n  "active": true,\n  "features": ["tools", "api"]\n}'
  );
  const [outputJson, setOutputJson] = useState('');
  const [error, setError] = useState('');
  const [copied, setCopied] = useState(false);

  const handleFormat = (val?: string) => {
    const data = val !== undefined ? val : inputJson;
    setError('');
    if (!data.trim()) {
      setOutputJson('');
      return;
    }
    try {
      const parsed = JSON.parse(data);
      setOutputJson(JSON.stringify(parsed, null, 2));
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      setError(msg);
      setOutputJson('');
    }
  };

  const handleMinify = () => {
    setError('');
    if (!inputJson.trim()) {
      setOutputJson('');
      return;
    }
    try {
      const parsed = JSON.parse(inputJson);
      setOutputJson(JSON.stringify(parsed));
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      setError(msg);
      setOutputJson('');
    }
  };

  useEffect(() => {
    if (inputJson) {
      try {
        handleFormat(inputJson);
      } catch {}
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps -- mount-only format of initial sample JSON
  }, []);

  const handleCopy = () => {
    if (!outputJson) return;
    navigator.clipboard.writeText(outputJson);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const schemaData = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'SoftwareApplication',
        name: 'VelnoxLabs JSON Formatter & Validator',
        operatingSystem: 'All',
        applicationCategory: 'DeveloperApplication',
        offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
        description:
          'Format, validate, and beautify JSON payloads instantly inside your browser with absolute client-side privacy.',
      },
      {
        '@type': 'FAQPage',
        mainEntity: [
          {
            '@type': 'Question',
            name: 'How to format and validate JSON online?',
            acceptedAnswer: {
              '@type': 'Answer',
              text: 'Paste your raw or minified JSON into the editor, click Format / Beautify to instantly fix indentation, or validate syntax errors with precise line feedback.',
            },
          },
          {
            '@type': 'Question',
            name: 'Is my JSON data secure?',
            acceptedAnswer: {
              '@type': 'Answer',
              text: 'Yes! All JSON parsing and validation happens 100% client-side in your browser. Your sensitive payloads never leave your machine.',
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
          <SectionHeading title={t('title')} subtitle={t('subtitle')} />

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
                  value={inputJson}
                  onChange={(e) => {
                    setInputJson(e.target.value);
                    try {
                      handleFormat(e.target.value);
                    } catch {}
                  }}
                  rows={12}
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
                    {tUI('outputLabel')}
                  </label>
                  <button
                    onClick={handleCopy}
                    disabled={!outputJson}
                    style={{
                      backgroundColor: outputJson
                        ? 'rgba(59, 130, 246, 0.15)'
                        : 'rgba(255,255,255,0.05)',
                      color: outputJson ? '#60a5fa' : '#64748b',
                      border: '1px solid rgba(59, 130, 246, 0.3)',
                      borderRadius: '6px',
                      padding: '4px 12px',
                      fontSize: '0.75rem',
                      fontWeight: 600,
                      cursor: outputJson ? 'pointer' : 'not-allowed',
                    }}
                  >
                    {copied ? tUI('copied') : tUI('copyBtn')}
                  </button>
                </div>
                <textarea
                  value={outputJson}
                  readOnly
                  rows={12}
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

            {/* Action buttons */}
            <div style={{ display: 'flex', gap: '12px', marginTop: '20px', flexWrap: 'wrap' }}>
              <button
                onClick={() => handleFormat()}
                style={{
                  backgroundColor: '#2563eb',
                  color: '#fff',
                  border: 'none',
                  borderRadius: '8px',
                  padding: '10px 24px',
                  fontSize: '0.9rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                }}
              >
                {tUI('formatBtn')}
              </button>
              <button
                onClick={handleMinify}
                style={{
                  backgroundColor: 'rgba(59, 130, 246, 0.15)',
                  color: '#60a5fa',
                  border: '1px solid rgba(59, 130, 246, 0.3)',
                  borderRadius: '8px',
                  padding: '10px 24px',
                  fontSize: '0.9rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                }}
              >
                {tUI('minifyBtn')}
              </button>
            </div>

            {/* Error message */}
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
                <p style={{ color: '#f87171', fontSize: '0.85rem', margin: 0 }}>
                  ❌ {tUI('invalidJson', { error })}
                </p>
              </div>
            )}
          </div>

          {/* ========== SEO CONTENT ========== */}
          <div
            style={{
              marginTop: '48px',
              backgroundColor: 'var(--bg-card)',
              border: '1px solid var(--border-color)',
              borderRadius: '12px',
              padding: '32px',
            }}
          >
            <h2
              style={{
                fontSize: '1.5rem',
                fontWeight: 700,
                color: 'var(--text-main)',
                marginBottom: '16px',
              }}
            >
              {t('whatIsHeading')}
            </h2>
            <p style={{ color: 'var(--text-muted)', lineHeight: 1.7, marginBottom: '24px' }}>
              {t('whatIsText')}
            </p>

            <h3
              style={{
                fontSize: '1.2rem',
                fontWeight: 700,
                color: 'var(--text-main)',
                marginBottom: '12px',
                marginTop: '24px',
              }}
            >
              {t('howToHeading')}
            </h3>
            <ul
              style={{
                color: 'var(--text-muted)',
                lineHeight: 1.9,
                paddingLeft: '20px',
                marginBottom: '24px',
              }}
            >
              <li>{t('howTo1')}</li>
              <li>{t('howTo2')}</li>
              <li>{t('howTo3')}</li>
              <li>{t('howTo4')}</li>
              <li>{t('howTo5')}</li>
            </ul>

            <h3
              style={{
                fontSize: '1.2rem',
                fontWeight: 700,
                color: 'var(--text-main)',
                marginBottom: '16px',
                marginTop: '24px',
              }}
            >
              {t('faqHeading')}
            </h3>

            <div style={{ marginBottom: '16px' }}>
              <h4
                style={{ fontSize: '1rem', fontWeight: 600, color: '#60a5fa', marginBottom: '6px' }}
              >
                {t('faq1Q')}
              </h4>
              <p style={{ color: 'var(--text-muted)', lineHeight: 1.6 }}>{t('faq1A')}</p>
            </div>

            <div style={{ marginBottom: '16px' }}>
              <h4
                style={{ fontSize: '1rem', fontWeight: 600, color: '#60a5fa', marginBottom: '6px' }}
              >
                {t('faq2Q')}
              </h4>
              <p style={{ color: 'var(--text-muted)', lineHeight: 1.6 }}>{t('faq2A')}</p>
            </div>

            <div style={{ marginBottom: '16px' }}>
              <h4
                style={{ fontSize: '1rem', fontWeight: 600, color: '#60a5fa', marginBottom: '6px' }}
              >
                {t('faq3Q')}
              </h4>
              <p style={{ color: 'var(--text-muted)', lineHeight: 1.6 }}>{t('faq3A')}</p>
            </div>
          </div>

          {/* ========== FEEDBACK FORM ========== */}
          <FeedbackForm />
        </div>
      </GlobalContainer>
    </>
  );
}
