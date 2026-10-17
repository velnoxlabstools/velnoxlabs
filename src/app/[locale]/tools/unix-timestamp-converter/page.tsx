'use client';

import React, { useState, useEffect } from 'react';
import { GlobalContainer } from '@/components/layout';
import { SectionHeading } from '@/components/ui';
import { ToolSeoContent } from '@/features/tools/sections/ToolSeoContent';

export default function UnixTimestampPage() {
  const [timestamp, setTimestamp] = useState<string>(String(Math.floor(Date.now() / 1000)));
  const [currentTime, setCurrentTime] = useState(Math.floor(Date.now() / 1000));
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const interval = setInterval(() => setCurrentTime(Math.floor(Date.now() / 1000)), 1000);
    return () => clearInterval(interval);
  }, []);

  const parsedTimestamp = Number(timestamp);
  const isValid = timestamp.trim() !== '' && !isNaN(parsedTimestamp);

  const date = isValid ? new Date(parsedTimestamp * 1000) : null;
  const humanDate = date ? date.toString() : 'Invalid Timestamp';
  const isoDate = date ? date.toISOString() : 'Invalid Timestamp';

  const handleTimestampChange = (val: string) => {
    setTimestamp(val);
  };

  const handleDateChange = (val: string) => {
    const d = new Date(val);
    if (!isNaN(d.getTime())) {
      setTimestamp(String(Math.floor(d.getTime() / 1000)));
    }
  };

  const handleCopy = () => {
    if (!isValid) return;
    navigator.clipboard.writeText(timestamp);
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
            '@type': 'SoftwareApplication',
            name: 'VelnoxLabs Unix Timestamp Converter',
            operatingSystem: 'All',
            applicationCategory: 'DeveloperApplication',
            offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
            description: 'Convert Unix timestamps to human-readable dates.',
          }),
        }}
      />

      <GlobalContainer maxWidth="2xl">
        <div style={{ paddingTop: 'var(--space-8)', paddingBottom: 'var(--space-16)' }}>
          <SectionHeading
            title="Unix Timestamp Converter"
            subtitle="Convert between Unix timestamps and human-readable dates instantly."
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
                gap: '12px',
                alignItems: 'center',
                marginBottom: '20px',
                flexWrap: 'wrap',
              }}
            >
              <span style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                Current Unix Time:
              </span>
              <span
                style={{
                  color: '#34d399',
                  fontFamily: 'monospace',
                  fontSize: '1rem',
                  fontWeight: 600,
                }}
              >
                {currentTime}
              </span>
              <button
                onClick={() => setTimestamp(String(currentTime))}
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
                Use Now
              </button>
            </div>

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
                  Unix Timestamp:
                </label>
                <input
                  type="text"
                  inputMode="numeric"
                  value={timestamp}
                  onChange={(e) => handleTimestampChange(e.target.value)}
                  placeholder="Enter Unix timestamp..."
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
                  Pick a Date:
                </label>
                <input
                  type="datetime-local"
                  onChange={(e) => handleDateChange(e.target.value)}
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

            <div style={{ marginTop: '20px' }}>
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  marginBottom: '8px',
                }}
              >
                <label style={{ color: 'var(--text-main)', fontSize: '0.875rem', fontWeight: 600 }}>
                  Human Readable:
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
                  {copied ? 'Copied!' : 'Copy Timestamp'}
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
                  color: isValid ? '#34d399' : '#ef4444',
                }}
              >
                {humanDate}
              </div>
            </div>

            <div style={{ marginTop: '12px' }}>
              <label
                style={{
                  color: 'var(--text-main)',
                  fontSize: '0.875rem',
                  fontWeight: 600,
                  display: 'block',
                  marginBottom: '8px',
                }}
              >
                ISO 8601:
              </label>
              <div
                style={{
                  backgroundColor: 'var(--bg-page)',
                  border: '1px solid var(--border-color)',
                  borderRadius: '8px',
                  padding: '12px',
                  fontFamily: 'monospace',
                  fontSize: '0.85rem',
                  color: isValid ? '#60a5fa' : '#ef4444',
                }}
              >
                {isoDate}
              </div>
            </div>
          </div>

          <ToolSeoContent toolSlug="unix-timestamp-converter" toolName="Unix Timestamp Converter" />
        </div>
      </GlobalContainer>
    </>
  );
}
