'use client';

import React, { useState, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { GlobalContainer } from '@/components/layout';
import { SectionHeading } from '@/components/ui';
import { FeedbackForm } from '@/components/ui';

export default function UserAgentParserPage() {
  const t = useTranslations('ToolSeoDefaults');
  const tFaq = useTranslations('ToolFaq.userAgentParser');
  const [uaString, setUaString] = useState('');
  const [output, setOutput] = useState('');
  const [copied, setCopied] = useState(false);

  const parseUa = (ua: string) => {
    if (!ua.trim()) {
      setOutput('');
      return;
    }

    let b = 'Unknown Browser';
    let o = 'Unknown OS';
    let d = 'Desktop';

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
      d = 'Mobile / Tablet';
    } else if (ua.includes('Android')) {
      o = 'Android';
      d = 'Mobile / Tablet';
    } else if (ua.includes('Win')) {
      o = 'Windows';
    } else if (ua.includes('Mac')) {
      o = 'macOS';
    } else if (ua.includes('Linux')) {
      o = 'Linux';
    }

    setOutput(`Browser: ${b}\nOperating System: ${o}\nDevice Type: ${d}`);
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
          <SectionHeading
            title="User-Agent Parser"
            subtitle="Analyze and decode browser User-Agent strings to inspect device, operating system, and browser architecture."
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
                  Input User-Agent String:
                </label>
                <textarea
                  value={uaString}
                  onChange={handleManualParse}
                  rows={10}
                  placeholder="Enter or paste User-Agent string here..."
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
                    Parsed Output:
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
                <textarea
                  value={output}
                  readOnly
                  rows={10}
                  placeholder="Parsed output will appear here..."
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

          {/* SEO Content - Now Translated */}
          <div
            style={{
              marginTop: '48px',
              backgroundColor: 'var(--bg-card)',
              border: '1px solid var(--border-color)',
              borderRadius: '12px',
              padding: '32px',
            }}
          >
            <h2
              style={{
                fontSize: '1.5rem',
                fontWeight: 700,
                color: 'var(--text-main)',
                marginBottom: '16px',
              }}
            >
              {t('about', { name: 'User-Agent Parser' })}
            </h2>
            <p style={{ color: 'var(--text-muted)', lineHeight: 1.7, marginBottom: '24px' }}>
              {t('about', { name: 'User-Agent Parser' })}
            </p>

            <h3
              style={{
                fontSize: '1.2rem',
                fontWeight: 700,
                color: 'var(--text-main)',
                marginBottom: '12px',
                marginTop: '24px',
              }}
            >
              {t('howToUse')}
            </h3>
            <ul
              style={{
                color: 'var(--text-muted)',
                lineHeight: 1.9,
                paddingLeft: '20px',
                marginBottom: '24px',
              }}
            >
              <li>
                {t('step1Title')}: {t('step1Body')}
              </li>
              <li>
                {t('step2Title')}: {t('step2Body')}
              </li>
              <li>
                {t('step3Title')}: {t('step3Body')}
              </li>
            </ul>

            <h3
              style={{
                fontSize: '1.2rem',
                fontWeight: 700,
                color: 'var(--text-main)',
                marginBottom: '16px',
                marginTop: '24px',
              }}
            >
              FAQ
            </h3>

            <div style={{ marginBottom: '16px' }}>
              <h4
                style={{ fontSize: '1rem', fontWeight: 600, color: '#60a5fa', marginBottom: '6px' }}
              >
                {tFaq('q1')}
              </h4>
              <p style={{ color: 'var(--text-muted)', lineHeight: 1.6 }}>{tFaq('a1')}</p>
            </div>

            <div style={{ marginBottom: '16px' }}>
              <h4
                style={{ fontSize: '1rem', fontWeight: 600, color: '#60a5fa', marginBottom: '6px' }}
              >
                {tFaq('q2')}
              </h4>
              <p style={{ color: 'var(--text-muted)', lineHeight: 1.6 }}>{tFaq('a2')}</p>
            </div>

            <div style={{ marginBottom: '16px' }}>
              <h4
                style={{ fontSize: '1rem', fontWeight: 600, color: '#60a5fa', marginBottom: '6px' }}
              >
                {tFaq('q3')}
              </h4>
              <p style={{ color: 'var(--text-muted)', lineHeight: 1.6 }}>{tFaq('a3')}</p>
            </div>

            <div style={{ marginBottom: '16px' }}>
              <h4
                style={{ fontSize: '1rem', fontWeight: 600, color: '#60a5fa', marginBottom: '6px' }}
              >
                {tFaq('q4')}
              </h4>
              <p style={{ color: 'var(--text-muted)', lineHeight: 1.6 }}>{tFaq('a4')}</p>
            </div>
          </div>

          <FeedbackForm />
        </div>
      </GlobalContainer>
    </>
  );
}
