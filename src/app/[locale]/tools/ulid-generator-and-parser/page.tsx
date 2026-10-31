'use client';

import React, { useState, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { GlobalContainer } from '@/components/layout';
import { SectionHeading } from '@/components/ui';
import { ToolSeoContent } from '@/features/tools/sections/ToolSeoContent';

const CHARS = '0123456789ABCDEFGHJKMNPQRSTVWXYZ';

interface UlidParseResult {
  valid: boolean;
  timestamp: number;
  date: string;
  isoDate: string;
  randomness: string;
  timestampPart: string;
}

export default function Page() {
  const tUI = useTranslations('ToolUI.ulidGenerator');
  const [input, setInput] = useState('5');
  const [output, setOutput] = useState('');
  const [error, setError] = useState('');
  const [copied, setCopied] = useState(false);
  // Parser state
  const [parseInput, setParseInput] = useState('');
  const [parseResult, setParseResult] = useState<UlidParseResult | null>(null);
  const [parseError, setParseError] = useState('');

  // Generator logic
  const handleProcess = (val: string) => {
    setInput(val);
    setError('');
    if (!val.trim()) {
      setOutput('');
      return;
    }
    try {
      const fn = function ulidGen(val: string) {
        const count = Math.min(20, Math.max(1, parseInt(val) || 5));
        const result = [];
        for (let i = 0; i < count; i++) {
          let time = Date.now() + i;
          let timeStr = '';
          for (let j = 0; j < 10; j++) {
            timeStr = CHARS[time % 32] + timeStr;
            time = Math.floor(time / 32);
          }
          let randomStr = '';
          const arr = new Uint32Array(16);
          crypto.getRandomValues(arr);
          for (let j = 0; j < 16; j++) randomStr += CHARS[arr[j] % 32];
          result.push(timeStr + randomStr);
        }
        return result.join('\n');
      };
      setOutput(fn(val));
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      setError(msg);
      setOutput('');
    }
  };

  // Parser logic
  const handleParse = (val: string) => {
    setParseInput(val);
    setParseError('');
    setParseResult(null);

    if (!val.trim()) return;

    const clean = val.trim().toUpperCase();

    if (clean.length !== 26) {
      setParseError(tUI('invalidLength', { length: clean.length }));
      return;
    }

    if (!/^[0-9A-HJKMNP-TV-Z]{26}$/.test(clean)) {
      setParseError(tUI('invalidChars'));
      return;
    }

    // Decode first 10 chars as timestamp
    let time = 0;
    for (let i = 0; i < 10; i++) {
      time = time * 32 + CHARS.indexOf(clean[i]);
    }
    const date = new Date(time);
    const randomPart = clean.substring(10);

    setParseResult({
      valid: true,
      timestamp: time,
      date: date.toString(),
      isoDate: date.toISOString(),
      randomness: randomPart,
      timestampPart: clean.substring(0, 10),
    });
  };

  useEffect(() => {
    if (input) {
      try {
        handleProcess(input);
      } catch {}
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps -- mount-only generation, handleProcess sets input internally
  }, []);

  const handleCopy = () => {
    if (!output) return;
    navigator.clipboard.writeText(output);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'SoftwareApplication',
            name: 'VelnoxLabs ULID Generator & Parser',
            operatingSystem: 'All',
            applicationCategory: 'DeveloperApplication',
            offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
            description: 'Generate and parse ULIDs instantly.',
          }),
        }}
      />

      <GlobalContainer maxWidth="2xl">
        <div style={{ paddingTop: 'var(--space-8)', paddingBottom: 'var(--space-16)' }}>
          <SectionHeading title={tUI('title')} subtitle={tUI('subtitle')} />

          {/* ========== GENERATOR SECTION ========== */}
          <div
            style={{
              backgroundColor: 'var(--bg-card)',
              border: '1px solid var(--border-color)',
              borderRadius: '12px',
              padding: '24px',
              marginTop: 'var(--space-6)',
            }}
          >
            <h3
              style={{
                color: 'var(--text-main)',
                fontSize: '1rem',
                fontWeight: 700,
                marginBottom: '16px',
              }}
            >
              🔄 {tUI('title')}
            </h3>
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
                  {tUI('countLabel')}
                </label>
                <textarea
                  value={input}
                  onChange={(e) => handleProcess(e.target.value)}
                  rows={8}
                  placeholder={tUI('countPlaceholder')}
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
                {error && (
                  <p style={{ color: '#f87171', fontSize: '0.8rem', marginTop: '8px' }}>{error}</p>
                )}
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
                    {tUI('generatedUlids')}
                  </label>
                  <button
                    onClick={handleCopy}
                    style={{
                      backgroundColor: 'rgba(59,130,246,0.15)',
                      color: '#60a5fa',
                      border: '1px solid rgba(59,130,246,0.3)',
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
                  rows={8}
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
              </div>
            </div>
          </div>

          {/* ========== PARSER SECTION ========== */}
          <div
            style={{
              backgroundColor: 'var(--bg-card)',
              border: '1px solid var(--border-color)',
              borderRadius: '12px',
              padding: '24px',
              marginTop: '20px',
            }}
          >
            <h3
              style={{
                color: 'var(--text-main)',
                fontSize: '1rem',
                fontWeight: 700,
                marginBottom: '16px',
              }}
            >
              {tUI('parseHeading')}
            </h3>
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
                  {tUI('parseInputLabel')}
                </label>
                <textarea
                  value={parseInput}
                  onChange={(e) => handleParse(e.target.value)}
                  rows={8}
                  placeholder={tUI('parsePlaceholder')}
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
                {parseError && (
                  <p style={{ color: '#f87171', fontSize: '0.8rem', marginTop: '8px' }}>
                    {parseError}
                  </p>
                )}
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
                  {tUI('parsedResult')}
                </label>
                {parseResult ? (
                  <div
                    style={{
                      backgroundColor: 'var(--bg-page)',
                      border: '1px solid rgba(59,130,246,0.3)',
                      borderRadius: '8px',
                      padding: '16px',
                      fontSize: '0.85rem',
                    }}
                  >
                    <p style={{ color: '#34d399', fontWeight: 600, marginBottom: '12px' }}>
                      {tUI('validUlid')}
                    </p>
                    <div style={{ marginBottom: '10px' }}>
                      <span style={{ color: 'var(--text-muted)' }}>{tUI('timestampPart')} </span>
                      <span style={{ color: '#60a5fa', fontFamily: 'monospace' }}>
                        {parseResult.timestampPart}
                      </span>
                    </div>
                    <div style={{ marginBottom: '10px' }}>
                      <span style={{ color: 'var(--text-muted)' }}>{tUI('randomnessPart')} </span>
                      <span style={{ color: '#60a5fa', fontFamily: 'monospace' }}>
                        {parseResult.randomness}
                      </span>
                    </div>
                    <div style={{ marginBottom: '10px' }}>
                      <span style={{ color: 'var(--text-muted)' }}>{tUI('unixTimestamp')} </span>
                      <span style={{ color: 'var(--text-main)', fontFamily: 'monospace' }}>
                        {parseResult.timestamp}
                      </span>
                    </div>
                    <div style={{ marginBottom: '10px' }}>
                      <span style={{ color: 'var(--text-muted)' }}>{tUI('generatedOn')} </span>
                      <span style={{ color: 'var(--text-main)' }}>{parseResult.date}</span>
                    </div>
                    <div>
                      <span style={{ color: 'var(--text-muted)' }}>{tUI('iso8601')} </span>
                      <span style={{ color: 'var(--text-main)', fontFamily: 'monospace' }}>
                        {parseResult.isoDate}
                      </span>
                    </div>
                  </div>
                ) : (
                  <div
                    style={{
                      backgroundColor: 'var(--bg-page)',
                      border: '1px solid var(--border-color)',
                      borderRadius: '8px',
                      padding: '16px',
                      color: '#64748b',
                      fontSize: '0.85rem',
                      textAlign: 'center',
                    }}
                  >
                    {tUI('pasteUlidPrompt')}
                  </div>
                )}
              </div>
            </div>
          </div>

          <ToolSeoContent
            toolSlug="ulid-generator-and-parser"
            toolName={tUI('title')}
            description={tUI('subtitle')}
            customAbout={tUI('aboutText')}
            customFeatures={[tUI('feature1'), tUI('feature2'), tUI('feature3'), tUI('feature4')]}
            customSteps={[
              { title: tUI('step1Title'), body: tUI('step1Body') },
              { title: tUI('step2Title'), body: tUI('step2Body') },
              { title: tUI('step3Title'), body: tUI('step3Body') },
            ]}
            customFaqs={[
              { q: tUI('faq1Q'), a: tUI('faq1A') },
              { q: tUI('faq2Q'), a: tUI('faq2A') },
              { q: tUI('faq3Q'), a: tUI('faq3A') },
              { q: tUI('faq4Q'), a: tUI('faq4A') },
            ]}
          />
        </div>
      </GlobalContainer>
    </>
  );
}
