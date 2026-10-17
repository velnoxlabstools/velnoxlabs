'use client';

import React, { useState } from 'react';
import { useTranslations } from 'next-intl';
import { GlobalContainer } from '@/components/layout';
import { SectionHeading } from '@/components/ui';
import { ToolSeoContent } from '@/features/tools/sections/ToolSeoContent';

export default function ColorConverterPage() {
  const tUI = useTranslations('ToolUI.colorConverter');
  const [hex, setHex] = useState('#3b82f6');
  const [rgb, setRgb] = useState('rgb(59, 130, 246)');
  const [hsl, setHsl] = useState('hsl(217, 91%, 60%)');
  const [copiedField, setCopiedField] = useState('');
  const [error, setError] = useState('');
  // Helper: RGB to HSL
  const rgbToHsl = (r: number, g: number, b: number) => {
    r /= 255;
    g /= 255;
    b /= 255;
    const max = Math.max(r, g, b),
      min = Math.min(r, g, b);
    const l = (max + min) / 2;
    let h = 0,
      s = 0;

    if (max !== min) {
      const d = max - min;
      s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
      switch (max) {
        case r:
          h = (g - b) / d + (g < b ? 6 : 0);
          break;
        case g:
          h = (b - r) / d + 2;
          break;
        case b:
          h = (r - g) / d + 4;
          break;
      }
      h /= 6;
    }
    return `hsl(${Math.round(h * 360)}, ${Math.round(s * 100)}%, ${Math.round(l * 100)}%)`;
  };

  // Helper: HSL to RGB
  const hslToRgb = (h: number, s: number, l: number) => {
    s /= 100;
    l /= 100;
    const k = (n: number) => (n + h / 30) % 12;
    const a = s * Math.min(l, 1 - l);
    const f = (n: number) => l - a * Math.max(-1, Math.min(k(n) - 3, Math.min(9 - k(n), 1)));
    return {
      r: Math.round(255 * f(0)),
      g: Math.round(255 * f(8)),
      b: Math.round(255 * f(4)),
    };
  };

  // Helper: RGB to HEX
  const rgbToHex = (r: number, g: number, b: number) => {
    return (
      '#' +
      [r, g, b]
        .map((x) => {
          const hex = x.toString(16);
          return hex.length === 1 ? '0' + hex : hex;
        })
        .join('')
    );
  };

  // Handle HEX input change
  const handleHexChange = (value: string) => {
    setHex(value);
    setError('');
    let cleanHex = value.replace('#', '');
    if (cleanHex.length === 3) {
      cleanHex = cleanHex
        .split('')
        .map((c) => c + c)
        .join('');
    }
    if (cleanHex.length === 6) {
      const r = parseInt(cleanHex.substring(0, 2), 16);
      const g = parseInt(cleanHex.substring(2, 4), 16);
      const b = parseInt(cleanHex.substring(4, 6), 16);
      if (!isNaN(r) && !isNaN(g) && !isNaN(b)) {
        setRgb(`rgb(${r}, ${g}, ${b})`);
        setHsl(rgbToHsl(r, g, b));
      } else {
        setError(tUI('errorInvalidHex'));
      }
    }
  };

  // Handle RGB input change
  const handleRgbChange = (value: string) => {
    setRgb(value);
    setError('');
    const match = value.match(/\d+/g);
    if (match && match.length >= 3) {
      const r = Math.min(255, Math.max(0, parseInt(match[0])));
      const g = Math.min(255, Math.max(0, parseInt(match[1])));
      const b = Math.min(255, Math.max(0, parseInt(match[2])));
      setHex(rgbToHex(r, g, b));
      setHsl(rgbToHsl(r, g, b));
    } else if (value.trim() !== '') {
      setError(tUI('errorInvalidRgb'));
    }
  };

  // Handle HSL input change
  const handleHslChange = (value: string) => {
    setHsl(value);
    setError('');
    const match = value.match(/\d+/g);
    if (match && match.length >= 3) {
      const h = parseInt(match[0]);
      const s = parseInt(match[1]);
      const l = parseInt(match[2]);
      const { r, g, b } = hslToRgb(h, s, l);
      setHex(rgbToHex(r, g, b));
      setRgb(`rgb(${r}, ${g}, ${b})`);
    } else if (value.trim() !== '') {
      setError(tUI('errorInvalidHsl'));
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
        name: 'VelnoxLabs Color Converter',
        operatingSystem: 'All',
        applicationCategory: 'DeveloperApplication',
        offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
        description:
          'Convert color codes between HEX, RGB, and HSL formats instantly inside your browser with live preview and zero latency.',
      },
      {
        '@type': 'FAQPage',
        mainEntity: [
          {
            '@type': 'Question',
            name: 'How to convert color codes online?',
            acceptedAnswer: {
              '@type': 'Answer',
              text: 'Enter or pick a HEX, RGB, or HSL color code to instantly see its converted equivalents with one-click copy.',
            },
          },
          {
            '@type': 'Question',
            name: 'Is the color converter free to use?',
            acceptedAnswer: {
              '@type': 'Answer',
              text: 'Yes! 100% free, client-side processing with zero ads or tracking.',
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

          <div
            style={{
              backgroundColor: 'var(--bg-card)',
              border: '1px solid var(--border-color)',
              borderRadius: '12px',
              padding: '24px',
              marginTop: 'var(--space-6)',
            }}
          >
            {/* Color Preview Box */}
            <div style={{ marginBottom: '24px', textAlign: 'center' }}>
              <label
                style={{
                  color: 'var(--text-main)',
                  fontSize: '0.875rem',
                  fontWeight: 600,
                  display: 'block',
                  marginBottom: '8px',
                }}
              >
                {tUI('colorPreview')}
              </label>
              <div
                style={{
                  width: '100%',
                  height: '80px',
                  borderRadius: '8px',
                  backgroundColor: hex,
                  border: '1px solid var(--border-color)',
                }}
              ></div>
            </div>

            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
                gap: '20px',
              }}
            >
              {/* HEX Input */}
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
                    {tUI('hexLabel')}
                  </label>
                  <button
                    onClick={() => handleCopy(hex, 'hex')}
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
                    {copiedField === 'hex' ? tUI('copied') : tUI('copy')}
                  </button>
                </div>
                <input
                  type="text"
                  value={hex}
                  onChange={(e) => handleHexChange(e.target.value)}
                  placeholder="#3b82f6"
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

              {/* RGB Input */}
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
                    {tUI('rgbLabel')}
                  </label>
                  <button
                    onClick={() => handleCopy(rgb, 'rgb')}
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
                    {copiedField === 'rgb' ? tUI('copied') : tUI('copy')}
                  </button>
                </div>
                <input
                  type="text"
                  value={rgb}
                  onChange={(e) => handleRgbChange(e.target.value)}
                  placeholder="rgb(59, 130, 246)"
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

              {/* HSL Input */}
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
                    {tUI('hslLabel')}
                  </label>
                  <button
                    onClick={() => handleCopy(hsl, 'hsl')}
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
                    {copiedField === 'hsl' ? tUI('copied') : tUI('copy')}
                  </button>
                </div>
                <input
                  type="text"
                  value={hsl}
                  onChange={(e) => handleHslChange(e.target.value)}
                  placeholder="hsl(217, 91%, 60%)"
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
            </div>

            {error && (
              <p
                style={{
                  color: '#ef4444',
                  fontSize: '0.875rem',
                  marginTop: '16px',
                  textAlign: 'center',
                }}
              >
                {error}
              </p>
            )}
          </div>

          <ToolSeoContent toolSlug="color-converter" toolName="Color Converter" />
        </div>
      </GlobalContainer>
    </>
  );
}
