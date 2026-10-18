'use client';

import React, { useState } from 'react';
import { useTranslations } from 'next-intl';
import { GlobalContainer } from '@/components/layout';
import { SectionHeading } from '@/components/ui';
import QRCode from 'react-qr-code'; // ✅ Asli QR Code Library Import ki
import { ToolSeoContent } from '@/features/tools/sections/ToolSeoContent';

export default function QrCodeGeneratorPage() {
  const tUI = useTranslations('ToolUI.qrCodeGenerator');
  const [text, setText] = useState('https://velnoxlabs.com');
  const downloadQR = () => {
    const svg = document.getElementById('qr-svg');
    if (!svg) return;
    const serializer = new XMLSerializer();
    const svgStr = serializer.serializeToString(svg);
    const blob = new Blob([svgStr], { type: 'image/svg+xml' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'velnoxlabs-qr-code.svg';
    link.click();
    URL.revokeObjectURL(url);
  };

  const schemaData = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'SoftwareApplication',
        name: 'VelnoxLabs QR Code Generator',
        operatingSystem: 'All',
        applicationCategory: 'DeveloperApplication',
        offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
        description:
          'Generate custom QR codes instantly inside your browser for URLs, text, and contact data with zero server tracking.',
      },
      {
        '@type': 'FAQPage',
        mainEntity: [
          {
            '@type': 'Question',
            name: 'How to generate QR codes online?',
            acceptedAnswer: {
              '@type': 'Answer',
              text: 'Type your URL or text payload to instantly render a high-resolution QR code in your browser.',
            },
          },
          {
            '@type': 'Question',
            name: 'Are generated QR codes permanent?',
            acceptedAnswer: {
              '@type': 'Answer',
              text: 'Yes! Generated codes are rendered client-side instantly and remain fully static and secure.',
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
                  {tUI('inputText')}
                </label>
                <textarea
                  value={text}
                  onChange={(e) => setText(e.target.value)}
                  rows={8}
                  placeholder={tUI('placeholder')}
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
                <p style={{ color: '#64748b', fontSize: '0.8rem', marginTop: '8px' }}>
                  {tUI('charactersCount', { count: text.length })}
                </p>
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
                    {tUI('qrCodePreview')}
                  </label>
                  <button
                    onClick={downloadQR}
                    disabled={text.trim() === ''} // ✅ Empty input pe download disable
                    style={{
                      backgroundColor:
                        text.trim() === '' ? 'rgba(255,255,255,0.05)' : 'rgba(59, 130, 246, 0.15)',
                      color: text.trim() === '' ? '#64748b' : '#60a5fa',
                      border: '1px solid rgba(59, 130, 246, 0.3)',
                      borderRadius: '6px',
                      padding: '4px 12px',
                      fontSize: '0.75rem',
                      fontWeight: 600,
                      cursor: text.trim() === '' ? 'not-allowed' : 'pointer',
                    }}
                  >
                    {tUI('downloadSvg')}
                  </button>
                </div>
                <div
                  style={{
                    backgroundColor: 'var(--bg-page)',
                    border: '1px solid var(--border-color)',
                    borderRadius: '8px',
                    padding: '16px',
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    minHeight: '200px',
                  }}
                >
                  {/* ✅ Conditional Rendering: Empty input pe placeholder, warna asli QRCode */}
                  {text.trim() === '' ? (
                    <p
                      style={{
                        color: 'var(--text-muted)',
                        fontSize: '0.9rem',
                        textAlign: 'center',
                        margin: 0,
                      }}
                    >
                      {tUI('emptyPrompt')}
                    </p>
                  ) : (
                    <div
                      id="qr-svg"
                      style={{ padding: '10px', backgroundColor: '#ffffff', borderRadius: '8px' }}
                    >
                      <QRCode
                        value={text}
                        size={200}
                        level="H" // High error correction
                        bgColor="#ffffff"
                        fgColor="#000000"
                      />
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          <ToolSeoContent toolSlug="qr-code-generator" toolName={tUI('title')} />
        </div>
      </GlobalContainer>
    </>
  );
}
