'use client';

import React, { useState, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { GlobalContainer } from '@/components/layout';
import { SectionHeading } from '@/components/ui';
import { ToolSeoContent } from '@/features/tools/sections/ToolSeoContent';

export default function UserAgentParserPage() {
  const tUI = useTranslations('ToolUI.userAgentParser');
  const [uaString, setUaString] = useState('');
  const [output, setOutput] = useState('');
  const [copied, setCopied] = useState(false);

  const parseUa = (ua: string) => {
    if (!ua.trim()) {
      setOutput('');
      return;
    }

    let b = tUI('unknownBrowser');
    let o = tUI('unknownOs');
    let d = tUI('desktop');

    if (ua.includes('Firefox/')) {
      b = 'Mozilla Firefox';
    } else if (ua.includes('Edg/')) {
      b = 'Microsoft Edge';
    } else if (ua.includes('Chrome/') && !ua.includes('Edg/')) {
      b = 'Google Chrome';
    } else if (ua.includes('Safari/') && !ua.includes('Chrome')) {
      b = 'Apple Safari';
    } else if (ua.includes('MSIE') || ua.includes('Trident/')) {
      b = 'Internet Explorer';
    }

    if (ua.includes('iPhone') || ua.includes('iPad')) {
      o = 'iOS';
      d = tUI('mobileTablet');
    } else if (ua.includes('Android')) {
      o = 'Android';
      d = tUI('mobileTablet');
    } else if (ua.includes('Win')) {
      o = 'Windows';
    } else if (ua.includes('Mac')) {
      o = 'macOS';
    } else if (ua.includes('Linux')) {
      o = 'Linux';
    }

    setOutput(
      `${tUI('browser')}: ${b}\n${tUI('operatingSystem')}: ${o}\n${tUI('deviceType')}: ${d}`
    );
  };

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const currentUa = navigator.userAgent;
      setUaString(currentUa);
      parseUa(currentUa);
    }
  }, []);

  const handleManualParse = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const val = e.target.value;
    setUaString(val);
    parseUa(val);
  };

  const handleCopy = () => {
    if (!output) return;
    navigator.clipboard.writeText(output);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const schemaData = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'SoftwareApplication',
        name: 'VelnoxLabs User-Agent Parser',
        operatingSystem: 'All',
        applicationCategory: 'DeveloperApplication',
        offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
        description:
          'Parse and analyze browser User-Agent strings instantly in your browser to detect device, OS, and browser details.',
      },
      {
        '@type': 'FAQPage',
        mainEntity: [
          {
            '@type': 'Question',
            name: 'How to parse User-Agent strings online?',
            acceptedAnswer: {
              '@type': 'Answer',
              text: 'Paste any User-Agent string or use your current browser signature to instantly analyze browser, OS, and device type.',
            },
          },
          {
            '@type': 'Question',
            name: 'Is user-agent parsing performed securely?',
            acceptedAnswer: {
              '@type': 'Answer',
              text: 'Yes! Everything is processed locally on your client machine with absolute privacy.',
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
                  {tUI('inputLabel')}
                </label>
                <textarea
                  value={uaString}
                  onChange={handleManualParse}
                  rows={10}
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
                    {tUI('parsedOutput')}
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
                    {copied ? tUI('copied') : tUI('copy')}
                  </button>
                </div>
                <textarea
                  value={output}
                  readOnly
                  rows={10}
                  placeholder={tUI('outputPlaceholder')}
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
                    resize: 'vertical',
                  }}
                />
              </div>
            </div>
          </div>

          <ToolSeoContent toolSlug="user-agent-parser" toolName="User-Agent Parser" />
        </div>
      </GlobalContainer>
    </>
  );
}
