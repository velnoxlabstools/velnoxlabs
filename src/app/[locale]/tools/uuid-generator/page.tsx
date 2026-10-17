'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { GlobalContainer } from '@/components/layout';
import { SectionHeading } from '@/components/ui';
import { ToolSeoContent } from '@/features/tools/sections/ToolSeoContent';

export default function UuidGeneratorPage() {
  const [uuids, setUuids] = useState<string[]>([]);
  const [count, setCount] = useState<number>(5);
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);
  const [allCopied, setAllCopied] = useState(false);
  const generateUuids = useCallback(() => {
    const list: string[] = [];
    for (let i = 0; i < count; i++) {
      const uuid = typeof window !== 'undefined' && window.crypto ? window.crypto.randomUUID() : '';
      if (uuid) list.push(uuid);
    }
    setUuids(list);
  }, [count]);

  useEffect(() => {
    generateUuids();
  }, [generateUuids]);

  const handleCopySingle = (text: string, index: number) => {
    navigator.clipboard.writeText(text);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  const handleCopyAll = () => {
    navigator.clipboard.writeText(uuids.join('\n'));
    setAllCopied(true);
    setTimeout(() => setAllCopied(false), 2000);
  };

  const schemaData = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'SoftwareApplication',
        name: 'VelnoxLabs UUID v4 Generator',
        operatingSystem: 'All',
        applicationCategory: 'DeveloperApplication',
        offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
        description:
          'Generate secure version 4 UUIDs instantly in bulk or single format inside your browser.',
      },
      {
        '@type': 'FAQPage',
        mainEntity: [
          {
            '@type': 'Question',
            name: 'How to generate UUID v4 online?',
            acceptedAnswer: {
              '@type': 'Answer',
              text: 'Click generate to instantly create cryptographically secure Version 4 UUIDs using browser crypto APIs.',
            },
          },
          {
            '@type': 'Question',
            name: 'Are generated UUIDs unique?',
            acceptedAnswer: {
              '@type': 'Answer',
              text: 'Yes, UUID v4 standards ensure exceptionally high collision resistance.',
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
            title="UUID v4 Generator"
            subtitle="Generate cryptographically secure Version 4 Universally Unique Identifiers (UUIDs) instantly."
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
                display: 'flex',
                gap: '16px',
                alignItems: 'flex-end',
                flexWrap: 'wrap',
                marginBottom: '20px',
              }}
            >
              <div style={{ flex: '1', minWidth: '150px' }}>
                <label
                  style={{
                    color: 'var(--text-main)',
                    fontSize: '0.875rem',
                    fontWeight: 600,
                    display: 'block',
                    marginBottom: '8px',
                  }}
                >
                  How many UUIDs?
                </label>
                <input
                  type="number"
                  min="1"
                  max="100"
                  value={count}
                  onChange={(e) => setCount(Math.min(100, Math.max(1, Number(e.target.value))))}
                  style={{
                    width: '100%',
                    backgroundColor: 'var(--bg-page)',
                    border: '1px solid var(--border-color)',
                    borderRadius: '8px',
                    color: 'var(--text-main)',
                    padding: '10px',
                    fontSize: '0.9rem',
                    outline: 'none',
                  }}
                />
              </div>
              <button
                onClick={generateUuids}
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
                Generate UUIDs
              </button>
              <button
                onClick={handleCopyAll}
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
                {allCopied ? 'All Copied!' : 'Copy All'}
              </button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {uuids.map((uuid, idx) => (
                <div
                  key={idx}
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    backgroundColor: 'var(--bg-page)',
                    padding: '12px 16px',
                    borderRadius: '8px',
                    border: '1px solid var(--border-color)',
                  }}
                >
                  <span
                    style={{
                      color: '#34d399',
                      fontFamily: 'monospace',
                      fontSize: '0.85rem',
                      wordBreak: 'break-all',
                    }}
                  >
                    {uuid}
                  </span>
                  <button
                    onClick={() => handleCopySingle(uuid, idx)}
                    style={{
                      backgroundColor: 'rgba(59, 130, 246, 0.15)',
                      color: '#60a5fa',
                      border: '1px solid rgba(59, 130, 246, 0.3)',
                      borderRadius: '6px',
                      padding: '4px 12px',
                      fontSize: '0.75rem',
                      fontWeight: 600,
                      cursor: 'pointer',
                      marginLeft: '12px',
                      flexShrink: 0,
                    }}
                  >
                    {copiedIndex === idx ? 'Copied!' : 'Copy'}
                  </button>
                </div>
              ))}
            </div>
          </div>

          <ToolSeoContent toolSlug="uuid-generator" toolName="UUID v4 Generator" />
        </div>
      </GlobalContainer>
    </>
  );
}
