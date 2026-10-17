'use client';
import React, { useState, useEffect } from 'react';
import { ToolSeoContent } from '@/features/tools/sections/ToolSeoContent';

export default function ChecksumClient() {
  const [text, setText] = useState('Hello VelnoxLabs!');
  const [algorithm, setAlgorithm] = useState('sha-256');
  const [hash, setHash] = useState('');
  const [copied, setCopied] = useState(false);
  const calculateHash = async (input: string, algo: string) => {
    setText(input);
    if (!input) {
      setHash('');
      return;
    }
    try {
      if (algo === 'simple') {
        let sum = 0;
        for (let i = 0; i < input.length; i++) sum += input.charCodeAt(i);
        setHash(sum.toString(16));
      } else {
        const data = new TextEncoder().encode(input);
        const buffer = await crypto.subtle.digest(algo.toUpperCase(), data);
        setHash(
          Array.from(new Uint8Array(buffer))
            .map((b) => b.toString(16).padStart(2, '0'))
            .join('')
        );
      }
    } catch {
      setHash('Error calculating hash');
    }
  };

  // Auto-run on mount
  useEffect(() => {
    if (text) calculateHash(text, algorithm);
    // eslint-disable-next-line react-hooks/exhaustive-deps -- mount-only auto-run, handleCalculate sets text internally
  }, []);

  const handleCopy = () => {
    navigator.clipboard.writeText(hash);
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
            '@graph': [
              {
                '@type': 'SoftwareApplication',
                name: 'VelnoxLabs Checksum Calculator',
                operatingSystem: 'All',
                applicationCategory: 'DeveloperApplication',
                offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
                description:
                  'Generate SHA-256, SHA-512, SHA-1, and simple checksums instantly in your browser.',
              },
              {
                '@type': 'FAQPage',
                mainEntity: [
                  {
                    '@type': 'Question',
                    name: 'Is this Checksum Calculator free to use?',
                    acceptedAnswer: {
                      '@type': 'Answer',
                      text: 'Yes, VelnoxLabs Checksum Calculator is 100% free with no sign-up required.',
                    },
                  },
                  {
                    '@type': 'Question',
                    name: 'Is my data secure?',
                    acceptedAnswer: {
                      '@type': 'Answer',
                      text: 'Absolutely. All hashing happens entirely in your browser using the Web Crypto API. Your data never leaves your device.',
                    },
                  },
                ],
              },
            ],
          }),
        }}
      />

      <div style={{ paddingTop: 'var(--space-8)', paddingBottom: 'var(--space-16)' }}>
        <div style={{ maxWidth: '960px', margin: '0 auto', padding: '0 16px' }}>
          <div style={{ textAlign: 'center', marginBottom: '32px' }}>
            <h1
              style={{
                fontSize: '2.5rem',
                fontWeight: 800,
                color: 'var(--text-main)',
                marginBottom: '12px',
              }}
            >
              Checksum Calculator
            </h1>
            <p
              style={{
                color: 'var(--text-muted)',
                fontSize: '1rem',
                maxWidth: '600px',
                margin: '0 auto',
              }}
            >
              Calculate instant cryptographic and simple hashes securely in your browser with
              absolute privacy.
            </p>
          </div>

          <div
            style={{
              backgroundColor: 'var(--bg-card)',
              border: '1px solid var(--border-color)',
              borderRadius: '16px',
              padding: '32px',
              marginBottom: '32px',
            }}
          >
            <div
              style={{
                display: 'flex',
                flexWrap: 'wrap',
                justifyContent: 'space-between',
                alignItems: 'center',
                gap: '16px',
                marginBottom: '24px',
              }}
            >
              <label
                style={{
                  color: 'var(--text-main)',
                  fontSize: '0.85rem',
                  fontWeight: 700,
                  textTransform: 'uppercase',
                  letterSpacing: '0.05em',
                }}
              >
                Select Algorithm
              </label>
              <select
                value={algorithm}
                onChange={(e) => {
                  setAlgorithm(e.target.value);
                  calculateHash(text, e.target.value);
                }}
                style={{
                  backgroundColor: 'var(--bg-page)',
                  border: '1px solid var(--border-color)',
                  color: 'var(--text-main)',
                  borderRadius: '8px',
                  padding: '12px 20px',
                  fontSize: '0.9rem',
                  fontWeight: 600,
                  outline: 'none',
                  cursor: 'pointer',
                }}
              >
                <option value="sha-256">SHA-256</option>
                <option value="sha-512">SHA-512</option>
                <option value="sha-1">SHA-1</option>
                <option value="simple">Simple Checksum</option>
              </select>
            </div>

            <div style={{ marginBottom: '24px' }}>
              <label
                style={{
                  color: 'var(--text-main)',
                  fontSize: '0.85rem',
                  fontWeight: 600,
                  display: 'block',
                  marginBottom: '8px',
                }}
              >
                Input Text
              </label>
              <textarea
                rows={5}
                placeholder="Type or paste your text here..."
                value={text}
                onChange={(e) => calculateHash(e.target.value, algorithm)}
                style={{
                  width: '100%',
                  backgroundColor: 'var(--bg-page)',
                  border: '1px solid var(--border-color)',
                  borderRadius: '8px',
                  color: 'var(--text-main)',
                  padding: '16px',
                  fontSize: '0.95rem',
                  outline: 'none',
                  resize: 'vertical',
                  fontFamily: 'monospace',
                }}
              />
            </div>

            <div>
              <label
                style={{
                  color: 'var(--text-main)',
                  fontSize: '0.85rem',
                  fontWeight: 600,
                  display: 'block',
                  marginBottom: '8px',
                }}
              >
                Generated Hash Output
              </label>
              <div
                style={{
                  position: 'relative',
                  backgroundColor: 'var(--bg-page)',
                  border: '1px solid var(--border-color)',
                  borderRadius: '8px',
                  padding: '16px',
                  fontFamily: 'monospace',
                  color: '#34d399',
                  wordBreak: 'break-all',
                  minHeight: '60px',
                  display: 'flex',
                  alignItems: 'center',
                  paddingRight: '120px',
                }}
              >
                {hash || (
                  <span style={{ color: '#64748b', fontStyle: 'italic' }}>
                    Hash output will appear here...
                  </span>
                )}
                {hash && (
                  <button
                    onClick={handleCopy}
                    style={{
                      position: 'absolute',
                      right: '16px',
                      top: '50%',
                      transform: 'translateY(-50%)',
                      backgroundColor: '#2563eb',
                      color: '#fff',
                      border: 'none',
                      padding: '8px 20px',
                      borderRadius: '8px',
                      fontSize: '0.85rem',
                      fontWeight: 600,
                      cursor: 'pointer',
                    }}
                  >
                    {copied ? 'Copied!' : 'Copy'}
                  </button>
                )}
              </div>
            </div>
          </div>

          <ToolSeoContent toolSlug="checksum-calculator" toolName="Checksum Calculator" />
        </div>
      </div>
    </>
  );
}
