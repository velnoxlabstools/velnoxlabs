'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { GlobalContainer } from '@/components/layout';
import { SectionHeading } from '@/components/ui';
import { ToolSeoContent } from '@/features/tools/sections/ToolSeoContent';

export default function HmacGeneratorPage() {
  const [message, setMessage] = useState('Hello VelnoxLabs!');
  const [secret, setSecret] = useState('my-secret-key');
  const [algorithm, setAlgorithm] = useState('SHA-256');
  const [hmacOutput, setHmacOutput] = useState('');
  const [copied, setCopied] = useState(false);
  const generateHmac = useCallback(async () => {
    if (!message || !secret) {
      setHmacOutput('');
      return;
    }

    try {
      const encoder = new TextEncoder();
      const keyData = encoder.encode(secret);
      const messageData = encoder.encode(message);

      const cryptoKey = await crypto.subtle.importKey(
        'raw',
        keyData,
        { name: 'HMAC', hash: { name: algorithm } },
        false,
        ['sign']
      );

      const signature = await crypto.subtle.sign('HMAC', cryptoKey, messageData);
      const hashArray = Array.from(new Uint8Array(signature));
      setHmacOutput(hashArray.map((b) => b.toString(16).padStart(2, '0')).join(''));
    } catch {
      setHmacOutput('Error generating HMAC signature');
    }
  }, [message, secret, algorithm]);

  useEffect(() => {
    generateHmac();
  }, [generateHmac]);

  const handleCopy = () => {
    if (!hmacOutput) return;
    navigator.clipboard.writeText(hmacOutput);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const schemaData = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'SoftwareApplication',
        name: 'VelnoxLabs HMAC Generator',
        operatingSystem: 'All',
        applicationCategory: 'DeveloperApplication',
        offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
        description:
          'Generate cryptographic HMAC signatures using SHA-256, SHA-384, or SHA-512 instantly inside your browser.',
      },
      {
        '@type': 'FAQPage',
        mainEntity: [
          {
            '@type': 'Question',
            name: 'How to generate HMAC signatures online?',
            acceptedAnswer: {
              '@type': 'Answer',
              text: 'Enter your secret key, message payload, and select a cryptographic hashing algorithm to generate the HMAC signature instantly.',
            },
          },
          {
            '@type': 'Question',
            name: 'Is this HMAC tool secure?',
            acceptedAnswer: {
              '@type': 'Answer',
              text: 'Yes! All signature generation runs locally using browser-native Web Crypto APIs.',
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
            title="HMAC Signature Generator"
            subtitle="Generate secure Hash-based Message Authentication Codes (HMAC) using native browser cryptographic APIs."
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
                Secret Key:
              </label>
              <input
                type="text"
                value={secret}
                onChange={(e) => setSecret(e.target.value)}
                placeholder="Enter your secret key..."
                style={{
                  width: '100%',
                  backgroundColor: 'var(--bg-page)',
                  border: '1px solid var(--border-color)',
                  borderRadius: '8px',
                  color: 'var(--text-main)',
                  padding: '12px',
                  fontFamily: 'monospace',
                  fontSize: '0.9rem',
                  outline: 'none',
                }}
              />
            </div>

            <div
              style={{
                display: 'flex',
                flexWrap: 'wrap',
                justifyContent: 'space-between',
                alignItems: 'center',
                gap: '16px',
                marginBottom: '20px',
              }}
            >
              <label style={{ color: 'var(--text-main)', fontSize: '0.875rem', fontWeight: 600 }}>
                Algorithm:
              </label>
              <select
                value={algorithm}
                onChange={(e) => setAlgorithm(e.target.value)}
                style={{
                  backgroundColor: 'var(--bg-page)',
                  border: '1px solid var(--border-color)',
                  color: 'var(--text-main)',
                  borderRadius: '8px',
                  padding: '10px 20px',
                  fontSize: '0.9rem',
                  fontWeight: 600,
                  outline: 'none',
                  cursor: 'pointer',
                }}
              >
                <option value="SHA-256">SHA-256</option>
                <option value="SHA-384">SHA-384</option>
                <option value="SHA-512">SHA-512</option>
              </select>
            </div>

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
                Message:
              </label>
              <textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                rows={5}
                placeholder="Enter message to sign..."
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
                <label style={{ color: 'var(--text-main)', fontSize: '0.875rem', fontWeight: 600 }}>
                  HMAC Signature:
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
                  {copied ? 'Copied!' : 'Copy'}
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
                {hmacOutput || (
                  <span style={{ color: '#64748b', fontStyle: 'italic' }}>
                    HMAC signature will appear here...
                  </span>
                )}
              </div>
            </div>
          </div>

          <ToolSeoContent toolSlug="hmac-generator" toolName="HMAC Generator" />
        </div>
      </GlobalContainer>
    </>
  );
}
