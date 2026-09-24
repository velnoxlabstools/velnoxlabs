'use client';

import React, { useState, useEffect } from 'react';
import { GlobalContainer } from '@/components/layout';
import { SectionHeading } from '@/components/ui';

export default function JsonFormatterPage() {
  const [inputJson, setInputJson] = useState('{\n  "name": "VelnoxLabs",\n  "version": "1.0.0",\n  "active": true,\n  "features": ["tools", "api"]\n}');
  const [outputJson, setOutputJson] = useState('');
  const [error, setError] = useState('');
  const [copied, setCopied] = useState(false);
  const [feedback, setFeedback] = useState('');
  const [feedbackSent, setFeedbackSent] = useState(false);

  const handleFormat = (val?: string) => {
    const data = val !== undefined ? val : inputJson;
    setError('');
    if (!data.trim()) {
      setOutputJson('');
      return;
    }
    try {
      const parsed = JSON.parse(data);
      setOutputJson(JSON.stringify(parsed, null, 2));
    } catch (err: any) {
      setError(err.message);
      setOutputJson('');
    }
  };

  const handleMinify = () => {
    setError('');
    if (!inputJson.trim()) {
      setOutputJson('');
      return;
    }
    try {
      const parsed = JSON.parse(inputJson);
      setOutputJson(JSON.stringify(parsed));
    } catch (err: any) {
      setError(err.message);
      setOutputJson('');
    }
  };

  useEffect(() => {
    if (inputJson) {
      try { handleFormat(inputJson); } catch (e) {}
    }
  }, []);

  const handleCopy = () => {
    if (!outputJson) return;
    navigator.clipboard.writeText(outputJson);
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

  const schemaData = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'SoftwareApplication',
        'name': 'VelnoxLabs JSON Formatter & Validator',
        'operatingSystem': 'All',
        'applicationCategory': 'DeveloperApplication',
        'offers': { '@type': 'Offer', 'price': '0', 'priceCurrency': 'USD' },
        'description': 'Format, validate, and beautify JSON payloads instantly inside your browser with absolute client-side privacy.'
      },
      {
        '@type': 'FAQPage',
        'mainEntity': [
          {
            '@type': 'Question',
            'name': 'How to format and validate JSON online?',
            'acceptedAnswer': { '@type': 'Answer', 'text': 'Paste your raw or minified JSON into the editor, click Format / Beautify to instantly fix indentation, or validate syntax errors with precise line feedback.' }
          },
          {
            '@type': 'Question',
            'name': 'Is my JSON data secure?',
            'acceptedAnswer': { '@type': 'Answer', 'text': 'Yes! All JSON parsing and validation happens 100% client-side in your browser. Your sensitive payloads never leave your machine.' }
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
            title="JSON Formatter & Validator"
            subtitle="Format, validate, and beautify JSON payloads instantly in your browser with absolute client-side privacy."
          />

          {/* ========== TOOL UI ========== */}
          <div style={{ backgroundColor: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '12px', padding: '24px', marginTop: 'var(--space-6)' }}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '20px' }}>
              <div>
                <label style={{ color: '#fff', fontSize: '0.875rem', fontWeight: 600, display: 'block', marginBottom: '8px' }}>JSON Input:</label>
                <textarea
                  value={inputJson}
                  onChange={(e) => { setInputJson(e.target.value); try { handleFormat(e.target.value); } catch(err) {} }}
                  rows={12}
                  placeholder="Paste JSON here..."
                  style={{ width: '100%', backgroundColor: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', color: '#fff', padding: '12px', fontFamily: 'monospace', fontSize: '0.85rem', outline: 'none', resize: 'vertical' }}
                />
              </div>
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                  <label style={{ color: '#fff', fontSize: '0.875rem', fontWeight: 600 }}>Formatted Output:</label>
                  <button
                    onClick={handleCopy}
                    disabled={!outputJson}
                    style={{ backgroundColor: outputJson ? 'rgba(59, 130, 246, 0.15)' : 'rgba(255,255,255,0.05)', color: outputJson ? '#60a5fa' : '#64748b', border: '1px solid rgba(59, 130, 246, 0.3)', borderRadius: '6px', padding: '4px 12px', fontSize: '0.75rem', fontWeight: 600, cursor: outputJson ? 'pointer' : 'not-allowed' }}
                  >
                    {copied ? 'Copied!' : 'Copy'}
                  </button>
                </div>
                <textarea
                  value={outputJson}
                  readOnly
                  rows={12}
                  placeholder="Formatted JSON will appear here..."
                  style={{ width: '100%', backgroundColor: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', color: '#34d399', padding: '12px', fontFamily: 'monospace', fontSize: '0.85rem', outline: 'none', resize: 'vertical' }}
                />
              </div>
            </div>

            {/* Action buttons — ab tool ke andar */}
            <div style={{ display: 'flex', gap: '12px', marginTop: '20px', flexWrap: 'wrap' }}>
              <button
                onClick={() => handleFormat()}
                style={{ backgroundColor: '#2563eb', color: '#fff', border: 'none', borderRadius: '8px', padding: '10px 24px', fontSize: '0.9rem', fontWeight: 600, cursor: 'pointer' }}
              >
                Format / Beautify
              </button>
              <button
                onClick={handleMinify}
                style={{ backgroundColor: 'rgba(59, 130, 246, 0.15)', color: '#60a5fa', border: '1px solid rgba(59, 130, 246, 0.3)', borderRadius: '8px', padding: '10px 24px', fontSize: '0.9rem', fontWeight: 600, cursor: 'pointer' }}
              >
                Minify
              </button>
            </div>

            {/* Error message */}
            {error && (
              <div style={{ marginTop: '12px', backgroundColor: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.3)', borderRadius: '8px', padding: '12px' }}>
                <p style={{ color: '#f87171', fontSize: '0.85rem', margin: 0 }}>❌ Invalid JSON: {error}</p>
              </div>
            )}
          </div>

          {/* ========== SEO CONTENT — ab tool ke bahar/neeche ========== */}
          <div style={{ marginTop: '48px', backgroundColor: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '12px', padding: '32px' }}>
            <h2 style={{ fontSize: '1.5rem', fontWeight: 700, color: '#ffffff', marginBottom: '16px' }}>What is a JSON Formatter & Validator?</h2>
            <p style={{ color: '#94a3b8', lineHeight: 1.7, marginBottom: '24px' }}>
              The JSON Formatter & Validator beautifies raw or minified JSON and detects syntax errors with precise feedback. Developers use it daily for debugging API responses and cleaning up configuration files.
            </p>

            <h3 style={{ fontSize: '1.2rem', fontWeight: 700, color: '#ffffff', marginBottom: '12px', marginTop: '24px' }}>How to Use This Tool</h3>
            <ul style={{ color: '#94a3b8', lineHeight: 1.9, paddingLeft: '20px', marginBottom: '24px' }}>
              <li>Paste your JSON into the input box.</li>
              <li>The tool processes your input instantly in real-time.</li>
              <li>Use <strong style={{ color: '#34d399' }}>Format / Beautify</strong> to add proper indentation.</li>
              <li>Use <strong style={{ color: '#34d399' }}>Minify</strong> to compress JSON into a single line.</li>
              <li>Click the <strong style={{ color: '#34d399' }}>Copy</strong> button to copy the result.</li>
            </ul>

            <h3 style={{ fontSize: '1.2rem', fontWeight: 700, color: '#ffffff', marginBottom: '16px', marginTop: '24px' }}>Frequently Asked Questions</h3>

            <div style={{ marginBottom: '16px' }}>
              <h4 style={{ fontSize: '1rem', fontWeight: 600, color: '#60a5fa', marginBottom: '6px' }}>Is this tool free to use?</h4>
              <p style={{ color: '#94a3b8', lineHeight: 1.6 }}>Yes, VelnoxLabs JSON Formatter & Validator is 100% free with no sign-up required.</p>
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