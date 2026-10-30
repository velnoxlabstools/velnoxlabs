'use client';

import React, { useState, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { GlobalContainer } from '@/components/layout';
import { SectionHeading } from '@/components/ui';
import { ToolSeoContent } from '@/features/tools/sections/ToolSeoContent';

export default function JwtDecoderPage() {
  const tUI = useTranslations('ToolUI.jwtDecoder');
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
        throw new Error(tUI('invalidFormat'));
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
      setError(msg || tUI('decodeFailed'));
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

  return (
    <>
      <GlobalContainer maxWidth="2xl">
        <div style={{ paddingTop: 'var(--space-8)', paddingBottom: 'var(--space-16)' }}>
          <SectionHeading title={tUI('title')} subtitle={tUI('subtitle')} />

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
                {tUI('tokenInput')}
              </label>
              <textarea
                value={token}
                onChange={(e) => handleDecode(e.target.value)}
                rows={4}
                placeholder={tUI('tokenPlaceholder')}
                style={{
                  width: '100%',
                  backgroundColor: 'var(--bg-page)',
                  border: '1px solid var(--border-color)',
                  borderRadius: '8px',
                  color: 'var(--text-main)',
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
                    {tUI('header')}
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
                    {copiedField === 'header' ? tUI('copied') : tUI('copy')}
                  </button>
                </div>
                <pre
                  style={{
                    backgroundColor: 'var(--bg-page)',
                    border: '1px solid var(--border-color)',
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
                      {tUI('headerPlaceholder')}
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
                    {tUI('payload')}
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
                    {copiedField === 'payload' ? tUI('copied') : tUI('copy')}
                  </button>
                </div>
                <pre
                  style={{
                    backgroundColor: 'var(--bg-page)',
                    border: '1px solid var(--border-color)',
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
                      {tUI('payloadPlaceholder')}
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
                    {tUI('signature')}
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
                    {copiedField === 'signature' ? tUI('copied') : tUI('copy')}
                  </button>
                </div>
                <div
                  style={{
                    backgroundColor: 'var(--bg-page)',
                    border: '1px solid var(--border-color)',
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
                      {tUI('signaturePlaceholder')}
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>

          <ToolSeoContent
            toolSlug="jwt-decoder-&-inspector"
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
