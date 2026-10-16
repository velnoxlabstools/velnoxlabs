'use client';

import React, { useState, useEffect } from 'react';
import { GlobalContainer } from '@/components/layout';
import { SectionHeading } from '@/components/ui';
import { ToolSeoContent } from '@/features/tools/sections/ToolSeoContent';

export default function JwtDecoderPage() {
  const [token, setToken] = useState(
    'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IlZlbG5veExhYnMiLCJpYXQiOjE1MTYyMzkwMjJ9.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c'
  );
  const [header, setHeader] = useState('');
  const [payload, setPayload] = useState('');
  const [signature, setSignature] = useState('');
  const [error, setError] = useState('');
  const [copiedField, setCopiedField] = useState('');
  const handleDecode = (jwt: string) => {
    setToken(jwt);
    setError('');
    if (!jwt.trim()) {
      setHeader('');
      setPayload('');
      setSignature('');
      return;
    }

    try {
      const parts = jwt.trim().split('.');
      if (parts.length !== 3) {
        throw new Error('Invalid JWT format. A valid token must have 3 parts separated by dots.');
      }

      const decodeBase64Url = (str: string) => {
        let base64 = str.replace(/-/g, '+').replace(/_/g, '/');
        while (base64.length % 4) {
          base64 += '=';
        }
        return decodeURIComponent(
          atob(base64)
            .split('')
            .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
            .join('')
        );
      };

      const decodedHeader = JSON.parse(decodeBase64Url(parts[0]));
      const decodedPayload = JSON.parse(decodeBase64Url(parts[1]));

      setHeader(JSON.stringify(decodedHeader, null, 2));
      setPayload(JSON.stringify(decodedPayload, null, 2));
      setSignature(parts[2]);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      setError(msg || 'Failed to decode JWT token');
      setHeader('');
      setPayload('');
      setSignature('');
    }
  };

  // Auto-run on mount
  useEffect(() => {
    if (token) handleDecode(token);
    // eslint-disable-next-line react-hooks/exhaustive-deps -- mount-only decode of initial sample token
  }, []);

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
        name: 'VelnoxLabs JWT Decoder & Inspector',
        operatingSystem: 'All',
        applicationCategory: 'DeveloperApplication',
        offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
        description:
          'Decode and inspect JSON Web Tokens (JWT) headers, payloads, and signatures securely inside your browser.',
      },
      {
        '@type': 'FAQPage',
        mainEntity: [
          {
            '@type': 'Question',
            name: 'How to decode a JWT token online?',
            acceptedAnswer: {
              '@type': 'Answer',
              text: 'Paste your encoded JWT string into the input box to instantly inspect header claims, payload data, and signature.',
            },
          },
          {
            '@type': 'Question',
            name: 'Is token decoding secure?',
            acceptedAnswer: {
              '@type': 'Answer',
              text: 'Yes, 100% client-side decoding ensures your sensitive auth tokens never leave your browser.',
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
            title="JWT Decoder & Inspector"
            subtitle="Inspect JSON Web Token (JWT) headers, custom claims, expiration dates, and signatures securely."
          />

          {/* ========== TOOL UI ========== */}
          <div
            style={{
              backgroundColor: 'rgba(255,255,255,0.02)',
              border: '1px solid rgba(255,255,255,0.08)',
              borderRadius: '12px',
              padding: '24px',
              marginTop: 'var(--space-6)',
            }}
          >
            <div style={{ marginBottom: '20px' }}>
              <label
                style={{
                  color: '#fff',
                  fontSize: '0.875rem',
                  fontWeight: 600,
                  display: 'block',
                  marginBottom: '8px',
                }}
              >
                JWT Token:
              </label>
              <textarea
                value={token}
                onChange={(e) => handleDecode(e.target.value)}
                rows={4}
                placeholder="Paste your JWT token here..."
                style={{
                  width: '100%',
                  backgroundColor: 'rgba(0,0,0,0.3)',
                  border: '1px solid rgba(255,255,255,0.1)',
                  borderRadius: '8px',
                  color: '#fff',
                  padding: '12px',
                  fontFamily: 'monospace',
                  fontSize: '0.8rem',
                  outline: 'none',
                  resize: 'vertical',
                  wordBreak: 'break-all',
                }}
              />
              {error && (
                <p style={{ color: '#f87171', fontSize: '0.85rem', marginTop: '8px' }}>{error}</p>
              )}
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {/* Header */}
              <div>
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    marginBottom: '8px',
                  }}
                >
                  <label style={{ color: '#60a5fa', fontSize: '0.875rem', fontWeight: 600 }}>
                    Header:
                  </label>
                  <button
                    onClick={() => handleCopy(header, 'header')}
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
                    {copiedField === 'header' ? 'Copied!' : 'Copy'}
                  </button>
                </div>
                <pre
                  style={{
                    backgroundColor: 'rgba(0,0,0,0.3)',
                    border: '1px solid rgba(255,255,255,0.1)',
                    borderRadius: '8px',
                    padding: '12px',
                    fontFamily: 'monospace',
                    fontSize: '0.85rem',
                    color: '#34d399',
                    overflow: 'auto',
                    margin: 0,
                    minHeight: '60px',
                  }}
                >
                  {header || (
                    <span style={{ color: '#64748b', fontStyle: 'italic' }}>
                      Decoded header will appear here...
                    </span>
                  )}
                </pre>
              </div>

              {/* Payload */}
              <div>
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    marginBottom: '8px',
                  }}
                >
                  <label style={{ color: '#a78bfa', fontSize: '0.875rem', fontWeight: 600 }}>
                    Payload:
                  </label>
                  <button
                    onClick={() => handleCopy(payload, 'payload')}
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
                    {copiedField === 'payload' ? 'Copied!' : 'Copy'}
                  </button>
                </div>
                <pre
                  style={{
                    backgroundColor: 'rgba(0,0,0,0.3)',
                    border: '1px solid rgba(255,255,255,0.1)',
                    borderRadius: '8px',
                    padding: '12px',
                    fontFamily: 'monospace',
                    fontSize: '0.85rem',
                    color: '#34d399',
                    overflow: 'auto',
                    margin: 0,
                    minHeight: '60px',
                  }}
                >
                  {payload || (
                    <span style={{ color: '#64748b', fontStyle: 'italic' }}>
                      Decoded payload will appear here...
                    </span>
                  )}
                </pre>
              </div>

              {/* Signature */}
              <div>
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    marginBottom: '8px',
                  }}
                >
                  <label style={{ color: '#fbbf24', fontSize: '0.875rem', fontWeight: 600 }}>
                    Signature:
                  </label>
                  <button
                    onClick={() => handleCopy(signature, 'signature')}
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
                    {copiedField === 'signature' ? 'Copied!' : 'Copy'}
                  </button>
                </div>
                <div
                  style={{
                    backgroundColor: 'rgba(0,0,0,0.3)',
                    border: '1px solid rgba(255,255,255,0.1)',
                    borderRadius: '8px',
                    padding: '12px',
                    fontFamily: 'monospace',
                    fontSize: '0.8rem',
                    color: '#34d399',
                    wordBreak: 'break-all',
                    minHeight: '44px',
                  }}
                >
                  {signature || (
                    <span style={{ color: '#64748b', fontStyle: 'italic' }}>
                      Signature will appear here...
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>

          <ToolSeoContent toolSlug="jwt-decoder-&-inspector" toolName="JWT Decoder & Inspector" />
        </div>
      </GlobalContainer>
    </>
  );
}
