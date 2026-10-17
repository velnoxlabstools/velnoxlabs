'use client';

import React, { useState, useEffect } from 'react';
import { GlobalContainer } from '@/components/layout';
import { SectionHeading } from '@/components/ui';
import { ToolSeoContent } from '@/features/tools/sections/ToolSeoContent';

export default function RegexTesterPage() {
  const [pattern, setPattern] = useState('[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\\.[A-Za-z]{2,}');
  const [flags, setFlags] = useState('g');
  const [testString, setTestString] = useState(
    'Contact support@velnoxlabs.com or test.user@domain.co for assistance.'
  );
  const [matches, setMatches] = useState<string[]>([]);
  const [matchCount, setMatchCount] = useState(0);
  const [error, setError] = useState('');
  const availableFlags = [
    { key: 'g', label: 'Global' },
    { key: 'i', label: 'Ignore Case' },
    { key: 'm', label: 'Multiline' },
    { key: 's', label: 'Dot All' },
    { key: 'u', label: 'Unicode' },
  ];

  const toggleFlag = (flag: string) => {
    let newFlags = flags;
    if (newFlags.includes(flag)) {
      newFlags = newFlags.replace(flag, '');
    } else {
      newFlags += flag;
    }
    setFlags(newFlags);
  };

  const runTest = (pat: string, flg: string, text: string) => {
    setError('');
    setMatches([]);
    setMatchCount(0);

    if (!pat.trim() || !text.trim()) return;

    try {
      const regex = new RegExp(pat, flg);
      const results = text.match(regex);
      if (results) {
        setMatches(results);
        setMatchCount(results.length);
      } else {
        setMatches([]);
        setMatchCount(0);
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      setError(msg || 'Invalid Regular Expression');
      setMatches([]);
      setMatchCount(0);
    }
  };

  useEffect(() => {
    runTest(pattern, flags, testString);
  }, [pattern, flags, testString]);

  const handleCopyMatches = () => {
    if (matches.length === 0) return;
    navigator.clipboard.writeText(matches.join('\n'));
  };

  // Build highlighted text
  const renderHighlighted = () => {
    if (!testString || !pattern || error) return null;
    try {
      const regex = new RegExp(pattern, flags.includes('g') ? flags : flags + 'g');
      const parts: Array<{ text: string; isMatch: boolean }> = [];
      let lastIndex = 0;
      let match;
      const safeRegex = new RegExp(regex.source, regex.flags);
      while ((match = safeRegex.exec(testString)) !== null) {
        if (match.index > lastIndex) {
          parts.push({ text: testString.slice(lastIndex, match.index), isMatch: false });
        }
        parts.push({ text: match[0], isMatch: true });
        lastIndex = safeRegex.lastIndex;
        if (match[0] === '') safeRegex.lastIndex++;
      }
      if (lastIndex < testString.length) {
        parts.push({ text: testString.slice(lastIndex), isMatch: false });
      }
      return parts.map((p, i) =>
        p.isMatch ? (
          <mark
            key={i}
            style={{
              backgroundColor: '#34d399',
              color: '#000',
              padding: '1px 2px',
              borderRadius: '3px',
            }}
          >
            {p.text}
          </mark>
        ) : (
          <span key={i}>{p.text}</span>
        )
      );
    } catch {
      return null;
    }
  };

  const schemaData = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'SoftwareApplication',
        name: 'VelnoxLabs RegEx Tester',
        operatingSystem: 'All',
        applicationCategory: 'DeveloperApplication',
        offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
        description:
          'Test and debug Regular Expressions (RegEx) instantly in your browser with real-time pattern matching.',
      },
      {
        '@type': 'FAQPage',
        mainEntity: [
          {
            '@type': 'Question',
            name: 'How to test regular expressions online?',
            acceptedAnswer: {
              '@type': 'Answer',
              text: 'Enter your RegEx pattern, flags, and test string to instantly view matching results and pattern captures.',
            },
          },
          {
            '@type': 'Question',
            name: 'Is regex processing secure?',
            acceptedAnswer: {
              '@type': 'Answer',
              text: 'Yes, all expression evaluations run entirely in your local browser memory.',
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
            title="Regular Expression (RegEx) Tester"
            subtitle="Test, debug, and evaluate regular expression patterns against test strings in real-time."
          />

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
            {/* Pattern Input */}
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
                RegEx Pattern:
              </label>
              <input
                type="text"
                value={pattern}
                onChange={(e) => setPattern(e.target.value)}
                placeholder="e.g., [A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\\.[A-Za-z]{2,}"
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

            {/* Flags */}
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
                Flags:
              </label>
              <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
                {availableFlags.map((f) => (
                  <label
                    key={f.key}
                    style={{
                      color: 'var(--text-muted)',
                      fontSize: '0.85rem',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px',
                      cursor: 'pointer',
                    }}
                  >
                    <input
                      type="checkbox"
                      checked={flags.includes(f.key)}
                      onChange={() => toggleFlag(f.key)}
                    />
                    <span style={{ fontFamily: 'monospace', color: '#60a5fa', fontWeight: 600 }}>
                      {f.key}
                    </span>
                    <span>({f.label})</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Test String */}
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
                Test String:
              </label>
              <textarea
                value={testString}
                onChange={(e) => setTestString(e.target.value)}
                rows={5}
                placeholder="Enter text to test against the pattern..."
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

            {/* Error */}
            {error && (
              <div
                style={{
                  marginBottom: '20px',
                  backgroundColor: 'rgba(239, 68, 68, 0.1)',
                  border: '1px solid rgba(239, 68, 68, 0.3)',
                  borderRadius: '8px',
                  padding: '12px',
                }}
              >
                <p style={{ color: '#f87171', fontSize: '0.85rem', margin: 0 }}>❌ {error}</p>
              </div>
            )}

            {/* Match Count */}
            <div
              style={{
                marginBottom: '16px',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
              }}
            >
              <label style={{ color: 'var(--text-main)', fontSize: '0.875rem', fontWeight: 600 }}>
                Matches Found: <span style={{ color: '#34d399' }}>{matchCount}</span>
              </label>
              <button
                onClick={handleCopyMatches}
                disabled={matches.length === 0}
                style={{
                  backgroundColor:
                    matches.length > 0 ? 'rgba(59, 130, 246, 0.15)' : 'rgba(255,255,255,0.05)',
                  color: matches.length > 0 ? '#60a5fa' : '#64748b',
                  border: '1px solid rgba(59, 130, 246, 0.3)',
                  borderRadius: '6px',
                  padding: '4px 12px',
                  fontSize: '0.75rem',
                  fontWeight: 600,
                  cursor: matches.length > 0 ? 'pointer' : 'not-allowed',
                }}
              >
                Copy Matches
              </button>
            </div>

            {/* Highlighted Output */}
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
                Highlighted Output:
              </label>
              <div
                style={{
                  backgroundColor: 'var(--bg-page)',
                  border: '1px solid var(--border-color)',
                  borderRadius: '8px',
                  padding: '12px',
                  fontFamily: 'monospace',
                  fontSize: '0.85rem',
                  color: '#cbd5e1',
                  wordBreak: 'break-word',
                  minHeight: '60px',
                  whiteSpace: 'pre-wrap',
                }}
              >
                {renderHighlighted() || (
                  <span style={{ color: '#64748b', fontStyle: 'italic' }}>
                    Highlighted matches will appear here...
                  </span>
                )}
              </div>
            </div>

            {/* Match List */}
            {matches.length > 0 && (
              <div style={{ marginTop: '16px' }}>
                <label
                  style={{
                    color: 'var(--text-main)',
                    fontSize: '0.875rem',
                    fontWeight: 600,
                    display: 'block',
                    marginBottom: '8px',
                  }}
                >
                  Match List:
                </label>
                <div
                  style={{
                    backgroundColor: 'var(--bg-page)',
                    border: '1px solid var(--border-color)',
                    borderRadius: '8px',
                    padding: '12px',
                    fontFamily: 'monospace',
                    fontSize: '0.8rem',
                    color: '#34d399',
                    maxHeight: '200px',
                    overflowY: 'auto',
                  }}
                >
                  {matches.map((m, i) => (
                    <div
                      key={i}
                      style={{ padding: '4px 0', borderBottom: '1px solid rgba(255,255,255,0.05)' }}
                    >
                      <span style={{ color: '#64748b', marginRight: '8px' }}>{i + 1}.</span>
                      {m}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          <ToolSeoContent toolSlug="regex-tester" toolName="RegEx Tester" />
        </div>
      </GlobalContainer>
    </>
  );
}
