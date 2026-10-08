'use client';

import React, { useState, useEffect } from 'react';
import { GlobalContainer } from '@/components/layout';
import { SectionHeading } from '@/components/ui';

export default function Base64EncoderPage() {
  const [input, setInput] = useState('Hello VelnoxLabs!');
  const [output, setOutput] = useState('');
  const [mode, setMode] = useState<'encode' | 'decode'>('encode');
  const [error, setError] = useState('');
  const [copied, setCopied] = useState(false);
  const [feedback, setFeedback] = useState('');
  const [feedbackSent, setFeedbackSent] = useState(false);

  const process = (text: string, currentMode: 'encode' | 'decode') => {
    setError('');
    if (!text.trim()) {
      setOutput('');
      return;
    }
    try {
      if (currentMode === 'encode') {
        setOutput(btoa(unescape(encodeURIComponent(text))));
      } else {
        setOutput(decodeURIComponent(escape(atob(text))));
      }
    } catch (err: any) {
      setError('Invalid input for the selected mode. Please check your data.');
      setOutput('');
    }
  };

  // Auto-run on input/mode change
  useEffect(() => {
    process(input, mode);
  }, [input, mode]);

  const handleCopy = () => {
    if (!output) return;
    navigator.clipboard.writeText(output);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleClear = () => {
    setInput('');
    setOutput('');
    setError('');
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
        'name': 'VelnoxLabs Base64 Encoder & Decoder',
        'operatingSystem': 'All',
        'applicationCategory': 'DeveloperApplication',
        'offers': { '@type': 'Offer', 'price': '0', 'priceCurrency': 'USD' },
        'description': 'Encode and decode Base64 strings instantly in your browser with secure, zero-latency client-side processing.'
      },
      {
        '@type': 'FAQPage',
        'mainEntity': [
          {
            '@type': 'Question',
            'name': 'How to encode or decode Base64 online?',
            'acceptedAnswer': { '@type': 'Answer', 'text': 'Paste your text or Base64 string into the input box, select Encode or Decode mode, and the result appears instantly.' }
          },
          {
            '@type': 'Question',
            'name': 'Is this Base64 tool secure?',
            'acceptedAnswer': { '@type': 'Answer', 'text': 'Absolutely. All encoding and decoding functions are performed locally in your browser. No data is sent to our servers.' }
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
            title="Base64 Encoder & Decoder"
            subtitle="Encode text to Base64 or decode Base64 strings instantly with absolute client-side privacy."
          />

          {/* ========== TOOL UI ========== */}
          <div style={{ backgroundColor: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '12px', padding: '24px', marginTop: 'var(--space-6)' }}>

            {/* Mode tabs */}
            <div style={{ display: 'flex', gap: '8px', marginBottom: '20px' }}>
              <button
                onClick={() => setMode('encode')}
                style={{ backgroundColor: mode === 'encode' ? 'rgba(59, 130, 246, 0.25)' : 'rgba(0,0,0,0.3)', color: mode === 'encode' ? '#60a5fa' : '#94a3b8', border: '1px solid rgba(59, 130, 246, 0.3)', borderRadius: '6px', padding: '8px 20px', fontSize: '0.85rem', fontWeight: 600, cursor: 'pointer' }}
              >
                Encode
              </button>
              <button
                onClick={() => setMode('decode')}
                style={{ backgroundColor: mode === 'decode' ? 'rgba(59, 130, 246, 0.25)' : 'rgba(0,0,0,0.3)', color: mode === 'decode' ? '#60a5fa' : '#94a3b8', border: '1px solid rgba(59, 130, 246, 0.3)', borderRadius: '6px', padding: '8px 20px', fontSize: '0.85rem', fontWeight: 600, cursor: 'pointer' }}
              >
                Decode
              </button>
            </div>

            {/* Input / Output */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '20px' }}>
              <div>
                <label style={{ color: '#fff', fontSize: '0.875rem', fontWeight: 600, display: 'block', marginBottom: '8px' }}>
                  {mode === 'encode' ? 'Text Input:' : 'Base64 Input:'}
                </label>
                <textarea
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  rows={10}
                  placeholder={mode === 'encode' ? 'Enter text to encode...' : 'Paste Base64 to decode...'}
                  style={{ width: '100%', backgroundColor: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', color: '#fff', padding: '12px', fontFamily: 'monospace', fontSize: '0.85rem', outline: 'none', resize: 'vertical' }}
                />
              </div>
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                  <label style={{ color: '#fff', fontSize: '0.875rem', fontWeight: 600 }}>
                    {mode === 'encode' ? 'Base64 Output:' : 'Decoded Output:'}
                  </label>
                  <button
                    onClick={handleCopy}
                    disabled={!output}
                    style={{ backgroundColor: output ? 'rgba(59, 130, 246, 0.15)' : 'rgba(255,255,255,0.05)', color: output ? '#60a5fa' : '#64748b', border: '1px solid rgba(59, 130, 246, 0.3)', borderRadius: '6px', padding: '4px 12px', fontSize: '0.75rem', fontWeight: 600, cursor: output ? 'pointer' : 'not-allowed' }}
                  >
                    {copied ? 'Copied!' : 'Copy'}
                  </button>
                </div>
                <textarea
                  value={output}
                  readOnly
                  rows={10}
                  placeholder="Output will appear here..."
                  style={{ width: '100%', backgroundColor: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', color: '#34d399', padding: '12px', fontFamily: 'monospace', fontSize: '0.85rem', outline: 'none', resize: 'vertical' }}
                />
              </div>
            </div>

            {/* Error */}
            {error && (
              <div style={{ marginTop: '12px', backgroundColor: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.3)', borderRadius: '8px', padding: '12px' }}>
                <p style={{ color: '#f87171', fontSize: '0.85rem', margin: 0 }}>❌ {error}</p>
              </div>
            )}

            {/* Action buttons */}
            <div style={{ display: 'flex', gap: '12px', marginTop: '20px' }}>
              <button
                onClick={() => process(input, mode)}
                style={{ backgroundColor: '#2563eb', color: '#ffffff', border: 'none', borderRadius: '8px', padding: '10px 24px', fontSize: '0.9rem', fontWeight: 600, cursor: 'pointer' }}
              >
                {mode === 'encode' ? 'Encode' : 'Decode'}
              </button>
              <button
                onClick={handleClear}
                style={{ backgroundColor: 'rgba(255,255,255,0.05)', color: '#94a3b8', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', padding: '10px 24px', fontSize: '0.9rem', fontWeight: 600, cursor: 'pointer' }}
              >
                Clear
              </button>
            </div>
          </div>

          {/* ========== SEO CONTENT ========== */}
          <div style={{ marginTop: '48px', backgroundColor: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '12px', padding: '32px' }}>
            <h2 style={{ fontSize: '1.5rem', fontWeight: 700, color: '#ffffff', marginBottom: '16px' }}>What is a Base64 Encoder & Decoder?</h2>
            <p style={{ color: '#94a3b8', lineHeight: 1.7, marginBottom: '24px' }}>
              The Base64 Encoder & Decoder is a browser-based utility that converts plain text into Base64 encoding and vice versa. Base64 is commonly used for encoding binary data in email attachments, JSON Web Tokens, data URLs, and API payloads.
            </p>

            <h3 style={{ fontSize: '1.2rem', fontWeight: 700, color: '#ffffff', marginBottom: '12px', marginTop: '24px' }}>How to Use This Tool</h3>
            <ul style={{ color: '#94a3b8', lineHeight: 1.9, paddingLeft: '20px', marginBottom: '24px' }}>
              <li>Choose <strong style={{ color: '#34d399' }}>Encode</strong> to convert text → Base64, or <strong style={{ color: '#34d399' }}>Decode</strong> for the reverse.</li>
              <li>Type or paste your input in the left box — output updates in real-time.</li>
              <li>Click <strong style={{ color: '#34d399' }}>Copy</strong> to copy the result to your clipboard.</li>
            </ul>

            <h3 style={{ fontSize: '1.2rem', fontWeight: 700, color: '#ffffff', marginBottom: '16px', marginTop: '24px' }}>Frequently Asked Questions</h3>

            <div style={{ marginBottom: '16px' }}>
              <h4 style={{ fontSize: '1rem', fontWeight: 600, color: '#60a5fa', marginBottom: '6px' }}>Is this tool free to use?</h4>
              <p style={{ color: '#94a3b8', lineHeight: 1.6 }}>Yes, VelnoxLabs Base64 Encoder & Decoder is 100% free with no sign-up required.</p>
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
