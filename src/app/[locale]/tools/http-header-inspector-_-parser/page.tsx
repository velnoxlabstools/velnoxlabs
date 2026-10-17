'use client';

import React, { useState } from 'react';
import { useTranslations } from 'next-intl';
import { GlobalContainer } from '@/components/layout';
import { SectionHeading } from '@/components/ui';
import { ToolSeoContent } from '@/features/tools/sections/ToolSeoContent';

export default function HttpHeaderInspectorPage() {
  const tUI = useTranslations('ToolUI.httpHeaderInspector');
  const [rawHeaders, setRawHeaders] = useState(
    `content-type: application/json; charset=utf-8
cache-control: no-cache, no-store, must-revalidate
strict-transport-security: max-age=63072000; includeSubDomains
x-frame-options: DENY
server: nginx/1.18.0`
  );
  const [copied, setCopied] = useState(false);
  const parsedList = rawHeaders
    .split('\n')
    .map((line) => {
      const idx = line.indexOf(':');
      if (idx === -1) return { key: line.trim(), val: '' };
      return {
        key: line.slice(0, idx).trim(),
        val: line.slice(idx + 1).trim(),
      };
    })
    .filter((item) => item.key);

  const handleCopy = () => {
    navigator.clipboard.writeText(rawHeaders);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const schemaData = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'SoftwareApplication',
        name: 'VelnoxLabs HTTP Header Inspector & Parser',
        operatingSystem: 'All',
        applicationCategory: 'DeveloperApplication',
        offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
        description:
          'Inspect, parse, and analyze raw HTTP request and response headers instantly inside your browser.',
      },
      {
        '@type': 'FAQPage',
        mainEntity: [
          {
            '@type': 'Question',
            name: 'How to parse raw HTTP headers online?',
            acceptedAnswer: {
              '@type': 'Answer',
              text: 'Paste your raw header text block to instantly break down keys and values into structured tables.',
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

          {/* TOOL UI */}
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
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: '8px',
              }}
            >
              <label style={{ color: 'var(--text-main)', fontSize: '0.875rem', fontWeight: 600 }}>
                {tUI('rawHeaders')}
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
                {copied ? tUI('copied') : tUI('copyRaw')}
              </button>
            </div>

            <textarea
              value={rawHeaders}
              onChange={(e) => setRawHeaders(e.target.value)}
              placeholder={tUI('placeholder')}
              rows={6}
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
                marginBottom: '24px',
                resize: 'vertical',
              }}
            />

            <h3
              style={{
                fontSize: '1.1rem',
                fontWeight: 700,
                color: 'var(--text-main)',
                marginBottom: '12px',
              }}
            >
              {tUI('parsedStructure', { count: parsedList.length })}
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {parsedList.map((item, idx) => (
                <div
                  key={idx}
                  style={{
                    backgroundColor: 'var(--bg-page)',
                    padding: '10px 14px',
                    borderRadius: '6px',
                    border: '1px solid var(--border-color)',
                    display: 'grid',
                    gridTemplateColumns: '220px 1fr',
                    gap: '12px',
                    alignItems: 'center',
                  }}
                >
                  <span
                    style={{
                      color: '#60a5fa',
                      fontFamily: 'monospace',
                      fontSize: '0.85rem',
                      fontWeight: 600,
                      wordBreak: 'break-all',
                    }}
                  >
                    {item.key}
                  </span>
                  <span
                    style={{
                      color: '#34d399',
                      fontFamily: 'monospace',
                      fontSize: '0.85rem',
                      wordBreak: 'break-all',
                    }}
                  >
                    {item.val}
                  </span>
                </div>
              ))}
            </div>
          </div>

          <ToolSeoContent toolSlug="http-header-inspector-_-parser" toolName={tUI('title')} />
        </div>
      </GlobalContainer>
    </>
  );
}
