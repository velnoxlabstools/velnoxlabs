'use client';

import React, { useState, useEffect } from 'react';
import { GlobalContainer } from '@/components/layout';
import { SectionHeading } from '@/components/ui';
import { ToolSeoContent } from '@/features/tools/sections/ToolSeoContent';

export default function Page() {
  const [input, setInput] = useState(
    'https://example.com/path/to/page?search=hello&page=2#section'
  );
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
      const fn = function urlParser(val: string) {
        const u = new URL(val.trim());
        const lines = [];
        lines.push('Protocol:   ' + u.protocol);
        lines.push('Host:       ' + u.host);
        lines.push('Hostname:   ' + u.hostname);
        lines.push('Port:       ' + (u.port || '(default)'));
        lines.push('Pathname:   ' + u.pathname);
        lines.push('Search:     ' + (u.search || '(none)'));
        lines.push('Hash:       ' + (u.hash || '(none)'));
        lines.push('');
        lines.push('Query Parameters:');
        if (u.searchParams.toString()) {
          u.searchParams.forEach(function (v, k) {
            lines.push('  ' + k + ' = ' + v);
          });
        } else {
          lines.push('  (none)');
        }
        return lines.join('\n');
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
    // eslint-disable-next-line react-hooks/exhaustive-deps -- mount-only parse of default URL
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
            name: 'VelnoxLabs URL Parser & Query Extractor',
            operatingSystem: 'All',
            applicationCategory: 'DeveloperApplication',
            offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
            description: 'Deconstruct URLs into components and query params.',
          }),
        }}
      />

      <GlobalContainer maxWidth="2xl">
        <div style={{ paddingTop: 'var(--space-8)', paddingBottom: 'var(--space-16)' }}>
          <SectionHeading
            title="URL Parser & Query Extractor"
            subtitle="Deconstruct URLs into components and query params."
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
                  URL:
                </label>
                <textarea
                  value={input}
                  onChange={(e) => handleProcess(e.target.value)}
                  rows={12}
                  placeholder="Paste a URL..."
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
                    Parsed Components:
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

          <ToolSeoContent
            toolSlug="url-parser-and-query-string-extractor"
            toolName="URL Parser & Query Extractor"
          />
        </div>
      </GlobalContainer>
    </>
  );
}
