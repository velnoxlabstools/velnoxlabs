'use client';

import React, { useState, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { GlobalContainer } from '@/components/layout';
import { SectionHeading } from '@/components/ui';
import CryptoJS from 'crypto-js';
import { ToolSeoContent } from '@/features/tools/sections/ToolSeoContent';

export default function HashGeneratorPage() {
  const tUI = useTranslations('ToolUI.hashGenerator');
  const [input, setInput] = useState('Hello VelnoxLabs!');
  const [md5Hash, setMd5Hash] = useState('');
  const [sha256Hash, setSha256Hash] = useState('');
  const [sha512Hash, setSha512Hash] = useState('');
  const [copiedField, setCopiedField] = useState('');
  useEffect(() => {
    generateHashes(input);
  }, [input]);

  const generateHashes = async (text: string) => {
    if (!text) {
      setMd5Hash('');
      setSha256Hash('');
      setSha512Hash('');
      return;
    }

    try {
      // ✅ Real MD5 via crypto-js
      setMd5Hash(CryptoJS.MD5(text).toString());

      const encoder = new TextEncoder();
      const data = encoder.encode(text);

      const sha256Buffer = await crypto.subtle.digest('SHA-256', data);
      setSha256Hash(
        Array.from(new Uint8Array(sha256Buffer))
          .map((b) => b.toString(16).padStart(2, '0'))
          .join('')
      );

      const sha512Buffer = await crypto.subtle.digest('SHA-512', data);
      setSha512Hash(
        Array.from(new Uint8Array(sha512Buffer))
          .map((b) => b.toString(16).padStart(2, '0'))
          .join('')
      );
    } catch {
      setSha256Hash(tUI('errGenerateHash'));
      setSha512Hash(tUI('errGenerateHash'));
    }
  };

  const handleCopy = (text: string, field: string) => {
    if (!text) return;
    navigator.clipboard.writeText(text);
    setCopiedField(field);
    setTimeout(() => setCopiedField(''), 2000);
  };

  const schemaData = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'SoftwareApplication',
        name: 'VelnoxLabs Hash Generator',
        operatingSystem: 'All',
        applicationCategory: 'DeveloperApplication',
        offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
        description:
          'Generate SHA-256, SHA-512, and MD5 cryptographic hashes instantly inside your browser with secure client-side processing.',
      },
      {
        '@type': 'FAQPage',
        mainEntity: [
          {
            '@type': 'Question',
            name: 'How to generate cryptographic hashes online?',
            acceptedAnswer: {
              '@type': 'Answer',
              text: 'Type or paste your text to instantly compute SHA-256, SHA-512, and MD5 hashes in real-time.',
            },
          },
          {
            '@type': 'Question',
            name: 'Are my inputs secure?',
            acceptedAnswer: {
              '@type': 'Answer',
              text: 'Yes! All cryptographic computations occur locally in your browser.',
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
            title="Cryptographic Hash Generator"
            subtitle="Generate SHA-256, SHA-512, and MD5 hashes instantly with browser-native cryptographic APIs."
            toolSlug="hash-generator"
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
            <div style={{ marginBottom: '20px' }}>
              <label
                style={{
                  color: 'var(--text-main)',
                  fontSize: '0.875rem',
                  fontWeight: 600,
                  display: 'block',
                  marginBottom: '8px',
                }}
              >
                {tUI('inputText')}
              </label>
              <textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                rows={5}
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

            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {/* MD5 */}
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
                    {tUI('md5Hash')}
                  </label>
                  <button
                    onClick={() => handleCopy(md5Hash, 'md5')}
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
                    {copiedField === 'md5' ? tUI('copied') : tUI('copy')}
                  </button>
                </div>
                <div
                  style={{
                    backgroundColor: 'var(--bg-page)',
                    border: '1px solid var(--border-color)',
                    borderRadius: '8px',
                    padding: '12px',
                    fontFamily: 'monospace',
                    fontSize: '0.85rem',
                    color: '#34d399',
                    wordBreak: 'break-all',
                    minHeight: '44px',
                  }}
                >
                  {md5Hash || (
                    <span style={{ color: '#64748b', fontStyle: 'italic' }}>
                      {tUI('md5Placeholder')}
                    </span>
                  )}
                </div>
              </div>

              {/* SHA-256 */}
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
                    {tUI('sha256Hash')}
                  </label>
                  <button
                    onClick={() => handleCopy(sha256Hash, 'sha256')}
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
                    {copiedField === 'sha256' ? tUI('copied') : tUI('copy')}
                  </button>
                </div>
                <div
                  style={{
                    backgroundColor: 'var(--bg-page)',
                    border: '1px solid var(--border-color)',
                    borderRadius: '8px',
                    padding: '12px',
                    fontFamily: 'monospace',
                    fontSize: '0.85rem',
                    color: '#34d399',
                    wordBreak: 'break-all',
                    minHeight: '44px',
                  }}
                >
                  {sha256Hash || (
                    <span style={{ color: '#64748b', fontStyle: 'italic' }}>
                      {tUI('sha256Placeholder')}
                    </span>
                  )}
                </div>
              </div>

              {/* SHA-512 */}
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
                    {tUI('sha512Hash')}
                  </label>
                  <button
                    onClick={() => handleCopy(sha512Hash, 'sha512')}
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
                    {copiedField === 'sha512' ? tUI('copied') : tUI('copy')}
                  </button>
                </div>
                <div
                  style={{
                    backgroundColor: 'var(--bg-page)',
                    border: '1px solid var(--border-color)',
                    borderRadius: '8px',
                    padding: '12px',
                    fontFamily: 'monospace',
                    fontSize: '0.85rem',
                    color: '#34d399',
                    wordBreak: 'break-all',
                    minHeight: '44px',
                  }}
                >
                  {sha512Hash || (
                    <span style={{ color: '#64748b', fontStyle: 'italic' }}>
                      {tUI('sha512Placeholder')}
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>

          <ToolSeoContent toolSlug="hash-generator" toolName="Hash Generator" />
        </div>
      </GlobalContainer>
    </>
  );
}
