'use client';

import React, { useState, useEffect } from 'react';
import { GlobalContainer } from '@/components/layout';
import { SectionHeading } from '@/components/ui';
import { ToolSeoContent } from '@/features/tools/sections/ToolSeoContent';

export default function SecurePasswordGeneratorPage() {
  const [password, setPassword] = useState('');
  const [length, setLength] = useState(20);
  const [useUpper, setUseUpper] = useState(true);
  const [useLower, setUseLower] = useState(true);
  const [useNumbers, setUseNumbers] = useState(true);
  const [useSymbols, setUseSymbols] = useState(true);
  const [excludeSimilar, setExcludeSimilar] = useState(false);
  const [copied, setCopied] = useState(false);
  const [strength, setStrength] = useState('');
  const generate = () => {
    let chars = '';
    if (useUpper) chars += 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    if (useLower) chars += 'abcdefghijklmnopqrstuvwxyz';
    if (useNumbers) chars += '0123456789';
    if (useSymbols) chars += '!@#$%^&*()_+-=[]{}|;:,.<>?';
    if (excludeSimilar) chars = chars.replace(/[il1Lo0O]/g, '');
    if (!chars) {
      setPassword('');
      setStrength('');
      return;
    }
    const array = new Uint32Array(length);
    crypto.getRandomValues(array);
    let pass = '';
    for (let i = 0; i < length; i++) pass += chars[array[i] % chars.length];
    setPassword(pass);

    let score = 0;
    if (length >= 12) score++;
    if (length >= 16) score++;
    if (useUpper && useLower) score++;
    if (useNumbers) score++;
    if (useSymbols) score++;
    if (score <= 2) setStrength('Weak');
    else if (score <= 3) setStrength('Medium');
    else if (score <= 4) setStrength('Strong');
    else setStrength('Very Strong');
  };

  useEffect(() => {
    generate();
    // eslint-disable-next-line react-hooks/exhaustive-deps -- mount-only generation, avoids overwriting user password
  }, []);

  const handleCopy = () => {
    if (!password) return;
    navigator.clipboard.writeText(password);
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
            name: 'VelnoxLabs Secure Password Generator',
            operatingSystem: 'All',
            applicationCategory: 'DeveloperApplication',
            offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
            description: 'Generate cryptographically secure passwords.',
          }),
        }}
      />

      <GlobalContainer maxWidth="2xl">
        <div style={{ paddingTop: 'var(--space-8)', paddingBottom: 'var(--space-16)' }}>
          <SectionHeading
            title="Secure Password Generator"
            subtitle="Create cryptographically secure passwords with custom character sets."
          />

          <div
            style={{
              backgroundColor: 'rgba(255,255,255,0.02)',
              border: '1px solid rgba(255,255,255,0.08)',
              borderRadius: '12px',
              padding: '24px',
              marginTop: 'var(--space-6)',
            }}
          >
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: '16px',
                flexWrap: 'wrap',
                gap: '12px',
              }}
            >
              <label style={{ color: '#fff', fontSize: '0.875rem', fontWeight: 600 }}>
                Generated Password:
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
                backgroundColor: 'rgba(0,0,0,0.3)',
                border: '1px solid rgba(255,255,255,0.1)',
                borderRadius: '8px',
                padding: '16px',
                fontFamily: 'monospace',
                fontSize: '1.1rem',
                color: '#34d399',
                wordBreak: 'break-all',
                marginBottom: '8px',
              }}
            >
              {password || 'Generate password...'}
            </div>
            {strength && (
              <div
                style={{
                  color:
                    strength === 'Weak' ? '#f87171' : strength === 'Medium' ? '#fbbf24' : '#34d399',
                  fontSize: '0.85rem',
                  marginBottom: '16px',
                }}
              >
                Strength: <strong>{strength}</strong>
              </div>
            )}

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
                Length: {length}
              </label>
              <input
                type="range"
                min="8"
                max="64"
                value={length}
                onChange={(e) => setLength(Number(e.target.value))}
                style={{ width: '100%' }}
              />
            </div>

            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                gap: '12px',
                marginBottom: '20px',
              }}
            >
              <label
                style={{
                  color: '#94a3b8',
                  fontSize: '0.85rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  cursor: 'pointer',
                }}
              >
                <input
                  type="checkbox"
                  checked={useUpper}
                  onChange={(e) => setUseUpper(e.target.checked)}
                />{' '}
                Uppercase (A-Z)
              </label>
              <label
                style={{
                  color: '#94a3b8',
                  fontSize: '0.85rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  cursor: 'pointer',
                }}
              >
                <input
                  type="checkbox"
                  checked={useLower}
                  onChange={(e) => setUseLower(e.target.checked)}
                />{' '}
                Lowercase (a-z)
              </label>
              <label
                style={{
                  color: '#94a3b8',
                  fontSize: '0.85rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  cursor: 'pointer',
                }}
              >
                <input
                  type="checkbox"
                  checked={useNumbers}
                  onChange={(e) => setUseNumbers(e.target.checked)}
                />{' '}
                Numbers (0-9)
              </label>
              <label
                style={{
                  color: '#94a3b8',
                  fontSize: '0.85rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  cursor: 'pointer',
                }}
              >
                <input
                  type="checkbox"
                  checked={useSymbols}
                  onChange={(e) => setUseSymbols(e.target.checked)}
                />{' '}
                Symbols (!@#$)
              </label>
              <label
                style={{
                  color: '#94a3b8',
                  fontSize: '0.85rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  cursor: 'pointer',
                }}
              >
                <input
                  type="checkbox"
                  checked={excludeSimilar}
                  onChange={(e) => setExcludeSimilar(e.target.checked)}
                />{' '}
                Exclude similar (il1Lo0O)
              </label>
            </div>

            <button
              onClick={generate}
              style={{
                backgroundColor: '#2563eb',
                color: '#ffffff',
                border: 'none',
                borderRadius: '8px',
                padding: '10px 24px',
                fontSize: '0.9rem',
                fontWeight: 600,
                cursor: 'pointer',
              }}
            >
              Generate New Password
            </button>
          </div>

          <ToolSeoContent
            toolSlug="secure-password-generator"
            toolName="Secure Password Generator"
          />
        </div>
      </GlobalContainer>
    </>
  );
}
