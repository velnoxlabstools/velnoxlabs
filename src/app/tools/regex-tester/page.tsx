'use client';

import React, { useState, useEffect } from 'react';
import { GlobalContainer } from '@/components/layout';
import { SectionHeading } from '@/components/ui';

export default function RegexTesterPage() {
  const [pattern, setPattern] = useState('[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\\.[A-Za-z]{2,}');
  const [flags, setFlags] = useState('g');
  const [testString, setTestString] = useState('Contact support@velnoxlabs.com or test.user@domain.co for assistance.');
  const [matches, setMatches] = useState<string[]>([]);
  const [matchCount, setMatchCount] = useState(0);
  const [error, setError] = useState('');
  const [feedback, setFeedback] = useState('');
  const [feedbackSent, setFeedbackSent] = useState(false);

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
    } catch (err: any) {
      setError(err.message || 'Invalid Regular Expression');
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
          <mark key={i} style={{ backgroundColor: '#34d399', color: '#000', padding: '1px 2px', borderRadius: '3px' }}>{p.text}</mark>
        ) : (
          <span key={i}>{p.text}</span>
        )
      );
    } catch {
      return null;
    }
  };

  const handleFeedbackSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!feedback.trim()) return;
    setFeedbackSent(true);
    setFeedback('');
    setTimeout(() => setFeedbackSent(false), 3000);
  };

  const schemaData = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'SoftwareApplication',
        'name': 'VelnoxLabs RegEx Tester',
        'operatingSystem': 'All',
        'applicationCategory': 'DeveloperApplication',
        'offers': { '@type': 'Offer', 'price': '0', 'priceCurrency': 'USD' },
        'description': 'Test and debug Regular Expressions (RegEx) instantly in your browser with real-time pattern matching.'
      },
      {
        '@type': 'FAQPage',
        'mainEntity': [
          {
            '@type': 'Question',
            'name': 'How to test regular expressions online?',
            'acceptedAnswer': { '@type': 'Answer', 'text': 'Enter your RegEx pattern, flags, and test string to instantly view matching results and pattern captures.' }
          },
          {
            '@type': 'Question',
            'name': 'Is regex processing secure?',
            'acceptedAnswer': { '@type': 'Answer', 'text': 'Yes, all expression evaluations run entirely in your local browser memory.' }
          }
        ]
      }
    ]
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schemaData) }} />

      <GlobalContainer maxWidth="2xl">
        <div style={{ paddingTop: 'var(--space-8)', paddingBottom: 'var(--space-16)' }}>
          <SectionHeading
            title="Regular Expression (RegEx) Tester"
            subtitle="Test, debug, and evaluate regular expression patterns against test strings in real-time."
          />

          {/* ========== TOOL UI ========== */}
          <div style={{ backgroundColor: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '12px', padding: '24px', marginTop: 'var(--space-6)' }}>

            {/* Pattern Input */}
            <div style={{ marginBottom: '20px' }}>
              <label style={{ color: '#fff', fontSize: '0.875rem', fontWeight: 600, display: 'block', marginBottom: '8px' }}>RegEx Pattern:</label>
              <input
                type="text"
                value={pattern}
                onChange={(e) => setPattern(e.target.value)}
                placeholder="e.g., [A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\\.[A-Za-z]{2,}"
                style={{ width: '100%', backgroundColor: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', color: '#fff', padding: '12px', fontFamily: 'monospace', fontSize: '0.9rem', outline: 'none' }}
              />
            </div>

            {/* Flags */}
            <div style={{ marginBottom: '20px' }}>
              <label style={{ color: '#fff', fontSize: '0.875rem', fontWeight: 600, display: 'block', marginBottom: '8px' }}>Flags:</label>
              <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
                {availableFlags.map((f) => (
                  <label key={f.key} style={{ color: '#94a3b8', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer' }}>
                    <input type="checkbox" checked={flags.includes(f.key)} onChange={() => toggleFlag(f.key)} />
                    <span style={{ fontFamily: 'monospace', color: '#60a5fa', fontWeight: 600 }}>{f.key}</span>
                    <span>({f.label})</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Test String */}
            <div style={{ marginBottom: '20px' }}>
              <label style={{ color: '#fff', fontSize: '0.875rem', fontWeight: 600, display: 'block', marginBottom: '8px' }}>Test String:</label>
              <textarea
                value={testString}
                onChange={(e) => setTestString(e.target.value)}
                rows={5}
                placeholder="Enter text to test against the pattern..."
                style={{ width: '100%', backgroundColor: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', color: '#fff', padding: '12px', fontFamily: 'monospace', fontSize: '0.85rem', outline: 'none', resize: 'vertical' }}
              />
            </div>

            {/* Error */}
            {error && (
              <div style={{ marginBottom: '20px', backgroundColor: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.3)', borderRadius: '8px', padding: '12px' }}>
                <p style={{ color: '#f87171', fontSize: '0.85rem', margin: 0 }}>❌ {error}</p>
              </div>
            )}

            {/* Match Count */}
            <div style={{ marginBottom: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <label style={{ color: '#fff', fontSize: '0.875rem', fontWeight: 600 }}>
                Matches Found: <span style={{ color: '#34d399' }}>{matchCount}</span>
              </label>
              <button
                onClick={handleCopyMatches}
                disabled={matches.length === 0}
                style={{ backgroundColor: matches.length > 0 ? 'rgba(59, 130, 246, 0.15)' : 'rgba(255,255,255,0.05)', color: matches.length > 0 ? '#60a5fa' : '#64748b', border: '1px solid rgba(59, 130, 246, 0.3)', borderRadius: '6px', padding: '4px 12px', fontSize: '0.75rem', fontWeight: 600, cursor: matches.length > 0 ? 'pointer' : 'not-allowed' }}
              >
                Copy Matches
              </button>
            </div>

            {/* Highlighted Output */}
            <div>
              <label style={{ color: '#fff', fontSize: '0.875rem', fontWeight: 600, display: 'block', marginBottom: '8px' }}>Highlighted Output:</label>
              <div style={{ backgroundColor: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', padding: '12px', fontFamily: 'monospace', fontSize: '0.85rem', color: '#cbd5e1', wordBreak: 'break-word', minHeight: '60px', whiteSpace: 'pre-wrap' }}>
                {renderHighlighted() || <span style={{ color: '#64748b', fontStyle: 'italic' }}>Highlighted matches will appear here...</span>}
              </div>
            </div>

            {/* Match List */}
            {matches.length > 0 && (
              <div style={{ marginTop: '16px' }}>
                <label style={{ color: '#fff', fontSize: '0.875rem', fontWeight: 600, display: 'block', marginBottom: '8px' }}>Match List:</label>
                <div style={{ backgroundColor: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', padding: '12px', fontFamily: 'monospace', fontSize: '0.8rem', color: '#34d399', maxHeight: '200px', overflowY: 'auto' }}>
                  {matches.map((m, i) => (
                    <div key={i} style={{ padding: '4px 0', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                      <span style={{ color: '#64748b', marginRight: '8px' }}>{i + 1}.</span>
                      {m}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* ========== SEO CONTENT ========== */}
          <div style={{ marginTop: '48px', backgroundColor: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '12px', padding: '32px' }}>
            <h2 style={{ fontSize: '1.5rem', fontWeight: 700, color: '#ffffff', marginBottom: '16px' }}>What is a RegEx Tester?</h2>
            <p style={{ color: '#94a3b8', lineHeight: 1.7, marginBottom: '24px' }}>
              The RegEx Tester helps developers test regular expressions against sample text with real-time matching. It supports flags, groups, and pattern highlighting.
            </p>

            <h3 style={{ fontSize: '1.2rem', fontWeight: 700, color: '#ffffff', marginBottom: '12px', marginTop: '24px' }}>How to Use This Tool</h3>
            <ul style={{ color: '#94a3b8', lineHeight: 1.9, paddingLeft: '20px', marginBottom: '24px' }}>
              <li>Enter your RegEx pattern in the pattern field above.</li>
              <li>Toggle flags (g, i, m, s, u) as needed.</li>
              <li>Paste your test string to see matches highlighted in real-time.</li>
              <li>Click <strong style={{ color: '#34d399' }}>Copy Matches</strong> to copy all found matches.</li>
            </ul>

            <h3 style={{ fontSize: '1.2rem', fontWeight: 700, color: '#ffffff', marginBottom: '16px', marginTop: '24px' }}>Frequently Asked Questions</h3>

            <div style={{ marginBottom: '16px' }}>
              <h4 style={{ fontSize: '1rem', fontWeight: 600, color: '#60a5fa', marginBottom: '6px' }}>Is this tool free to use?</h4>
              <p style={{ color: '#94a3b8', lineHeight: 1.6 }}>Yes, VelnoxLabs RegEx Tester is 100% free with no sign-up required.</p>
            </div>

            <div style={{ marginBottom: '16px' }}>
              <h4 style={{ fontSize: '1rem', fontWeight: 600, color: '#60a5fa', marginBottom: '6px' }}>Is my data secure?</h4>
              <p style={{ color: '#94a3b8', lineHeight: 1.6 }}>Absolutely. All processing happens entirely in your browser using client-side JavaScript. Your data never leaves your device and is never sent to any server.</p>
            </div>

            <div style={{ marginBottom: '16px' }}>
              <h4 style={{ fontSize: '1rem', fontWeight: 600, color: '#60a5fa', marginBottom: '6px' }}>Does it work on mobile devices?</h4>
              <p style={{ color: '#94a3b8', lineHeight: 1.6 }}>Yes, this tool is fully responsive and works on desktop, tablet, and mobile browsers.</p>
            </div>
          </div>

          {/* ========== FEEDBACK FORM ========== */}
          <div className="bg-slate-900/40 border border-slate-800 p-8 rounded-2xl mt-12">
            <h3 className="text-xl font-bold text-white mb-2">Got Feedback or Feature Requests?</h3>
            <p className="text-slate-400 mb-6 text-sm">Help us enhance VelnoxLabs developer utility standards. Share your feedback below!</p>
            <form onSubmit={handleFeedbackSubmit} className="space-y-4">
              <textarea
                rows={4}
                value={feedback}
                onChange={(e) => setFeedback(e.target.value)}
                placeholder="Write your suggestions or feature requests here..."
                className="w-full bg-slate-950 border border-slate-800 rounded-xl p-4 text-slate-200 focus:outline-none focus:border-slate-600 text-sm resize-none"
              ></textarea>
              <button type="submit" className="bg-emerald-600 hover:bg-emerald-500 text-white font-medium px-6 py-2.5 rounded-xl transition text-sm">
                {feedbackSent ? 'Sent!' : 'Submit Suggestion'}
              </button>
            </form>
          </div>

        </div>
      </GlobalContainer>
    </>
  );
}