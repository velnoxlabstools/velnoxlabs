'use client';

import React, { useState, useEffect } from 'react';
import { GlobalContainer } from '@/components/layout';
import { SectionHeading } from '@/components/ui';
import { ToolSeoContent } from '@/features/tools/sections/ToolSeoContent';

export default function Page() {
  const [input, setInput] = useState('21');
  const [output, setOutput] = useState('');
  const [error, setError] = useState('');
  const [copied, setCopied] = useState(false);
  const handleProcess = (val: string) => {
    setInput(val);
    setError('');
    if (!val.trim()) {
      setOutput('');
      return;
    }
    try {
      const fn = function nanoidGen(val: string) {
        const size = Math.min(64, Math.max(1, parseInt(val) || 21));
        const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789_-';
        const array = new Uint32Array(size);
        crypto.getRandomValues(array);
        let result = '';
        for (let i = 0; i < size; i++) result += chars[array[i] % chars.length];
        return result;
      };
      setOutput(fn(val));
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      setError(msg);
      setOutput('');
    }
  };

  // Auto-run on mount
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
            name: 'VelnoxLabs NanoID Generator',
            operatingSystem: 'All',
            applicationCategory: 'DeveloperApplication',
            offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
            description: 'Generate compact, URL-friendly unique identifiers.',
          }),
        }}
      />

      <GlobalContainer maxWidth="2xl">
        <div style={{ paddingTop: 'var(--space-8)', paddingBottom: 'var(--space-16)' }}>
          <SectionHeading
            title="NanoID Generator"
            subtitle="Generate compact, URL-friendly unique IDs."
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
                  Length:
                </label>
                <textarea
                  value={input}
                  onChange={(e) => handleProcess(e.target.value)}
                  rows={12}
                  placeholder="Enter length (default 21)"
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
                    Generated NanoID:
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
                    {copied ? 'Copied!' : 'Copy'}
                  </button>
                </div>
                <textarea
                  value={output}
                  readOnly
                  rows={12}
                  placeholder="Output will appear here..."
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

          <ToolSeoContent toolSlug="nanoid-generator" toolName="NanoID Generator" />
        </div>
      </GlobalContainer>
    </>
  );
}
