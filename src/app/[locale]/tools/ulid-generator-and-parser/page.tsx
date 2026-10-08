'use client';

import React, { useState, useEffect } from 'react';
import { GlobalContainer } from '@/components/layout';
import { SectionHeading } from '@/components/ui';

const CHARS = '0123456789ABCDEFGHJKMNPQRSTVWXYZ';

export default function Page() {
  const [input, setInput] = useState("5");
  const [output, setOutput] = useState('');
  const [error, setError] = useState('');
  const [copied, setCopied] = useState(false);
  const [feedback, setFeedback] = useState('');
  const [feedbackSent, setFeedbackSent] = useState(false);

  // Parser state
  const [parseInput, setParseInput] = useState('');
  const [parseResult, setParseResult] = useState<any>(null);
  const [parseError, setParseError] = useState('');

  // Generator logic
  const handleProcess = (val: string) => {
    setInput(val);
    setError('');
    if (!val.trim()) { setOutput(''); return; }
    try {
      const fn = function ulidGen(val: string) {
        const count = Math.min(20, Math.max(1, parseInt(val) || 5));
        const result = [];
        for (let i = 0; i < count; i++) {
          let time = Date.now() + i;
          let timeStr = '';
          for (let j = 0; j < 10; j++) {
            timeStr = CHARS[time % 32] + timeStr;
            time = Math.floor(time / 32);
          }
          let randomStr = '';
          const arr = new Uint32Array(16);
          crypto.getRandomValues(arr);
          for (let j = 0; j < 16; j++) randomStr += CHARS[arr[j] % 32];
          result.push(timeStr + randomStr);
        }
        return result.join('\n');
      };
      setOutput(fn(val));
    } catch (e: any) {
      setError(e.message);
      setOutput('');
    }
  };

  // Parser logic
  const handleParse = (val: string) => {
    setParseInput(val);
    setParseError('');
    setParseResult(null);

    if (!val.trim()) return;

    const clean = val.trim().toUpperCase();

    if (clean.length !== 26) {
      setParseError(`Invalid ULID length: ${clean.length} characters (expected 26)`);
      return;
    }

    if (!/^[0-9A-HJKMNP-TV-Z]{26}$/.test(clean)) {
      setParseError('Invalid ULID characters. Only Crockford Base32 allowed (excludes I, L, O, U).');
      return;
    }

    // Decode first 10 chars as timestamp
    let time = 0;
    for (let i = 0; i < 10; i++) {
      time = time * 32 + CHARS.indexOf(clean[i]);
    }
    const date = new Date(time);
    const randomPart = clean.substring(10);

    setParseResult({
      valid: true,
      timestamp: time,
      date: date.toString(),
      isoDate: date.toISOString(),
      randomness: randomPart,
      timestampPart: clean.substring(0, 10),
    });
  };

  useEffect(() => {
    if (input) {
      try { handleProcess(input); } catch(e) {}
    }
  }, []);

  const handleCopy = () => {
    if (!output) return;
    navigator.clipboard.writeText(output);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleFeedbackSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!feedback.trim()) return;
    setFeedbackSent(true);
    setFeedback('');
    setTimeout(() => setFeedbackSent(false), 3000);
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify({
        "@context": "https://schema.org",
        "@type": "SoftwareApplication",
        "name": "VelnoxLabs ULID Generator & Parser",
        "operatingSystem": "All",
        "applicationCategory": "DeveloperApplication",
        "offers": { "@type": "Offer", "price": "0", "priceCurrency": "USD" },
        "description": "Generate and parse ULIDs instantly."
      }) }} />

      <GlobalContainer maxWidth="2xl">
        <div style={{ paddingTop: 'var(--space-8)', paddingBottom: 'var(--space-16)' }}>
          <SectionHeading title="ULID Generator & Parser" subtitle="Generate Universally Unique Lexicographically Sortable Identifiers." />

          {/* ========== GENERATOR SECTION ========== */}
          <div style={{ backgroundColor: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '12px', padding: '24px', marginTop: 'var(--space-6)' }}>
            <h3 style={{ color: '#fff', fontSize: '1rem', fontWeight: 700, marginBottom: '16px' }}>🔄 Generate ULIDs</h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '20px' }}>
              <div>
                <label style={{ color: '#fff', fontSize: '0.875rem', fontWeight: 600, display: 'block', marginBottom: '8px' }}>Count:</label>
                <textarea value={input} onChange={(e) => handleProcess(e.target.value)} rows={8} placeholder="How many ULIDs? (1-20)" style={{ width: '100%', backgroundColor: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', color: '#fff', padding: '12px', fontFamily: 'monospace', fontSize: '0.85rem', outline: 'none' }} />
                {error && <p style={{ color: '#f87171', fontSize: '0.8rem', marginTop: '8px' }}>{error}</p>}
              </div>
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                  <label style={{ color: '#fff', fontSize: '0.875rem', fontWeight: 600 }}>Generated ULIDs:</label>
                  <button onClick={handleCopy} style={{ backgroundColor: 'rgba(59,130,246,0.15)', color: '#60a5fa', border: '1px solid rgba(59,130,246,0.3)', borderRadius: '6px', padding: '4px 12px', fontSize: '0.75rem', fontWeight: 600, cursor: 'pointer' }}>{copied ? 'Copied!' : 'Copy'}</button>
                </div>
                <textarea value={output} readOnly rows={8} placeholder="Output will appear here..." style={{ width: '100%', backgroundColor: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', color: '#34d399', padding: '12px', fontFamily: 'monospace', fontSize: '0.85rem', outline: 'none' }} />
              </div>
            </div>
          </div>

          {/* ========== PARSER SECTION ========== */}
          <div style={{ backgroundColor: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '12px', padding: '24px', marginTop: '20px' }}>
            <h3 style={{ color: '#fff', fontSize: '1rem', fontWeight: 700, marginBottom: '16px' }}>🔍 Parse ULID</h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '20px' }}>
              <div>
                <label style={{ color: '#fff', fontSize: '0.875rem', fontWeight: 600, display: 'block', marginBottom: '8px' }}>Paste ULID to Parse:</label>
                <textarea
                  value={parseInput}
                  onChange={(e) => handleParse(e.target.value)}
                  rows={8}
                  placeholder="e.g., 01M38YQ455NA9Z760PC16G3E9D"
                  style={{ width: '100%', backgroundColor: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', color: '#fff', padding: '12px', fontFamily: 'monospace', fontSize: '0.85rem', outline: 'none' }}
                />
                {parseError && <p style={{ color: '#f87171', fontSize: '0.8rem', marginTop: '8px' }}>{parseError}</p>}
              </div>
              <div>
                <label style={{ color: '#fff', fontSize: '0.875rem', fontWeight: 600, display: 'block', marginBottom: '8px' }}>Parsed Result:</label>
                {parseResult ? (
                  <div style={{ backgroundColor: 'rgba(0,0,0,0.3)', border: '1px solid rgba(59,130,246,0.3)', borderRadius: '8px', padding: '16px', fontSize: '0.85rem' }}>
                    <p style={{ color: '#34d399', fontWeight: 600, marginBottom: '12px' }}>✅ Valid ULID</p>
                    <div style={{ marginBottom: '10px' }}>
                      <span style={{ color: '#94a3b8' }}>Timestamp Part: </span>
                      <span style={{ color: '#60a5fa', fontFamily: 'monospace' }}>{parseResult.timestampPart}</span>
                    </div>
                    <div style={{ marginBottom: '10px' }}>
                      <span style={{ color: '#94a3b8' }}>Randomness Part: </span>
                      <span style={{ color: '#60a5fa', fontFamily: 'monospace' }}>{parseResult.randomness}</span>
                    </div>
                    <div style={{ marginBottom: '10px' }}>
                      <span style={{ color: '#94a3b8' }}>Unix Timestamp: </span>
                      <span style={{ color: '#fff', fontFamily: 'monospace' }}>{parseResult.timestamp}</span>
                    </div>
                    <div style={{ marginBottom: '10px' }}>
                      <span style={{ color: '#94a3b8' }}>Generated On: </span>
                      <span style={{ color: '#fff' }}>{parseResult.date}</span>
                    </div>
                    <div>
                      <span style={{ color: '#94a3b8' }}>ISO 8601: </span>
                      <span style={{ color: '#fff', fontFamily: 'monospace' }}>{parseResult.isoDate}</span>
                    </div>
                  </div>
                ) : (
                  <div style={{ backgroundColor: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', padding: '16px', color: '#64748b', fontSize: '0.85rem', textAlign: 'center' }}>
                    Paste a ULID to see its details
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Visible SEO Content */}
          <div style={{ marginTop: '48px', backgroundColor: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '12px', padding: '32px' }}>
            <h2 style={{ fontSize: '1.5rem', fontWeight: 700, color: '#ffffff', marginBottom: '16px' }}>What is a ULID Generator & Parser?</h2>
            <p style={{ color: '#94a3b8', lineHeight: 1.7, marginBottom: '24px' }}>
              The ULID Generator & Parser produces Universally Unique Lexicographically Sortable Identifiers and parses existing ones. ULIDs are ideal for databases where sortable IDs matter.
            </p>

            <h3 style={{ fontSize: '1.2rem', fontWeight: 700, color: '#ffffff', marginBottom: '12px', marginTop: '24px' }}>How to Use This Tool</h3>
            <ul style={{ color: '#94a3b8', lineHeight: 1.9, paddingLeft: '20px', marginBottom: '24px' }}>
              <li>Enter or paste your data into the input field above.</li>
              <li>The tool processes your input instantly in real-time.</li>
              <li>View the result in the output panel on the right.</li>
              <li>Click the <strong style={{ color: '#34d399' }}>Copy</strong> button to copy the result to your clipboard.</li>
            </ul>

            <h3 style={{ fontSize: '1.2rem', fontWeight: 700, color: '#ffffff', marginBottom: '16px', marginTop: '24px' }}>Frequently Asked Questions</h3>

            <div style={{ marginBottom: '16px' }}>
              <h4 style={{ fontSize: '1rem', fontWeight: 600, color: '#60a5fa', marginBottom: '6px' }}>Is this tool free to use?</h4>
              <p style={{ color: '#94a3b8', lineHeight: 1.6 }}>Yes, VelnoxLabs ULID Generator & Parser is 100% free with no sign-up required.</p>
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

          <div className="bg-slate-900/40 border border-slate-800 p-8 rounded-2xl mt-12">
            <h3 className="text-xl font-bold text-white mb-2">Got Feedback or Feature Requests?</h3>
            <p className="text-slate-400 mb-6 text-sm">Help us enhance VelnoxLabs developer utility standards.</p>
            <form onSubmit={handleFeedbackSubmit} className="space-y-4">
              <textarea rows={4} value={feedback} onChange={(e) => setFeedback(e.target.value)} placeholder="Write your suggestions..." className="w-full bg-slate-950 border border-slate-800 rounded-xl p-4 text-slate-200 text-sm resize-none"></textarea>
              <button type="submit" className="bg-emerald-600 hover:bg-emerald-500 text-white font-medium px-6 py-2.5 rounded-xl text-sm">{feedbackSent ? 'Sent!' : 'Submit Suggestion'}</button>
            </form>
          </div>
        </div>
      </GlobalContainer>
    </>
  );
}