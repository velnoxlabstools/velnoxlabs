'use client';

import React, { useState } from 'react';
import { GlobalContainer } from '@/components/layout';
import { SectionHeading } from '@/components/ui';

export default function HttpHeaderInspectorPage() {
  const [rawHeaders, setRawHeaders] = useState(
`content-type: application/json; charset=utf-8
cache-control: no-cache, no-store, must-revalidate
strict-transport-security: max-age=63072000; includeSubDomains
x-frame-options: DENY
server: nginx/1.18.0`
  );
  const [copied, setCopied] = useState(false);
  const [feedback, setFeedback] = useState('');
  const [feedbackSent, setFeedbackSent] = useState(false);

  const parsedList = rawHeaders.split('\n').map((line) => {
    const idx = line.indexOf(':');
    if (idx === -1) return { key: line.trim(), val: '' };
    return {
      key: line.slice(0, idx).trim(),
      val: line.slice(idx + 1).trim()
    };
  }).filter(item => item.key);

  const handleCopy = () => {
    navigator.clipboard.writeText(rawHeaders);
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
        'name': 'VelnoxLabs HTTP Header Inspector & Parser',
        'operatingSystem': 'All',
        'applicationCategory': 'DeveloperApplication',
        'offers': { '@type': 'Offer', 'price': '0', 'priceCurrency': 'USD' },
        'description': 'Inspect, parse, and analyze raw HTTP request and response headers instantly inside your browser.'
      },
      {
        '@type': 'FAQPage',
        'mainEntity': [
          {
            '@type': 'Question',
            'name': 'How to parse raw HTTP headers online?',
            'acceptedAnswer': { '@type': 'Answer', 'text': 'Paste your raw header text block to instantly break down keys and values into structured tables.' }
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
            title="HTTP Header Inspector & Parser"
            subtitle="Deconstruct raw HTTP request or response headers into structured key-value maps."
          />

          {/* TOOL UI */}
          <div style={{ backgroundColor: 'rgba(255, 255, 255, 0.02)', border: '1px solid rgba(255, 255, 255, 0.08)', borderRadius: '12px', padding: '24px', marginTop: 'var(--space-6)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
              <label style={{ color: '#ffffff', fontSize: '0.875rem', fontWeight: 600 }}>Raw HTTP Headers Input:</label>
              <button
                onClick={handleCopy}
                style={{ backgroundColor: 'rgba(59, 130, 246, 0.15)', color: '#60a5fa', border: '1px solid rgba(59, 130, 246, 0.3)', borderRadius: '6px', padding: '4px 12px', fontSize: '0.75rem', fontWeight: 600, cursor: 'pointer' }}
              >
                {copied ? 'Copied!' : 'Copy Raw'}
              </button>
            </div>

            <textarea
              value={rawHeaders}
              onChange={(e) => setRawHeaders(e.target.value)}
              placeholder="Paste raw headers here..."
              rows={6}
              style={{ width: '100%', backgroundColor: 'rgba(0, 0, 0, 0.3)', border: '1px solid rgba(255, 255, 255, 0.1)', borderRadius: '8px', color: '#ffffff', padding: '12px', fontFamily: 'monospace', fontSize: '0.85rem', outline: 'none', marginBottom: '24px', resize: 'vertical' }}
            />

            <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#ffffff', marginBottom: '12px' }}>Parsed Structure ({parsedList.length} headers)</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {parsedList.map((item, idx) => (
                <div key={idx} style={{ backgroundColor: 'rgba(0,0,0,0.3)', padding: '10px 14px', borderRadius: '6px', border: '1px solid rgba(255,255,255,0.06)', display: 'grid', gridTemplateColumns: '220px 1fr', gap: '12px', alignItems: 'center' }}>
                  <span style={{ color: '#60a5fa', fontFamily: 'monospace', fontSize: '0.85rem', fontWeight: 600, wordBreak: 'break-all' }}>{item.key}</span>
                  <span style={{ color: '#34d399', fontFamily: 'monospace', fontSize: '0.85rem', wordBreak: 'break-all' }}>{item.val}</span>
                </div>
              ))}
            </div>
          </div>

          {/* VISIBLE SEO CONTENT */}
          <div style={{ marginTop: '48px', backgroundColor: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '12px', padding: '32px' }}>
            <h2 style={{ fontSize: '1.5rem', fontWeight: 700, color: '#ffffff', marginBottom: '16px' }}>What is an HTTP Header Inspector?</h2>
            <p style={{ color: '#94a3b8', lineHeight: 1.7, marginBottom: '24px' }}>
              The HTTP Header Inspector & Parser is a developer tool that decodes raw HTTP request and response headers into a structured key-value table. HTTP headers carry critical metadata like content type, caching rules, security policies, authentication tokens, and server information. This tool helps developers debug API responses, verify CORS settings, inspect security headers, and understand what their server is sending or receiving.
            </p>

            <h3 style={{ fontSize: '1.2rem', fontWeight: 700, color: '#ffffff', marginBottom: '12px', marginTop: '24px' }}>How to Use This Tool</h3>
            <ul style={{ color: '#94a3b8', lineHeight: 1.9, paddingLeft: '20px', marginBottom: '24px' }}>
              <li>Paste your raw HTTP header block into the input area above.</li>
              <li>Each header is parsed instantly and displayed as a key-value pair.</li>
              <li>The tool automatically counts the total number of headers detected.</li>
              <li>Use the <strong style={{ color: '#60a5fa' }}>Copy Raw</strong> button to copy the original header block.</li>
            </ul>

            <h3 style={{ fontSize: '1.2rem', fontWeight: 700, color: '#ffffff', marginBottom: '16px', marginTop: '24px' }}>Frequently Asked Questions</h3>

            <div style={{ marginBottom: '16px' }}>
              <h4 style={{ fontSize: '1rem', fontWeight: 600, color: '#60a5fa', marginBottom: '6px' }}>What are HTTP headers?</h4>
              <p style={{ color: '#94a3b8', lineHeight: 1.6 }}>HTTP headers are metadata sent between a client (browser) and a server in every request and response. They carry information like content type, caching rules, authentication tokens, and security policies.</p>
            </div>

            <div style={{ marginBottom: '16px' }}>
              <h4 style={{ fontSize: '1rem', fontWeight: 600, color: '#60a5fa', marginBottom: '6px' }}>Is my data secure?</h4>
              <p style={{ color: '#94a3b8', lineHeight: 1.6 }}>Absolutely. All parsing happens entirely in your browser using client-side JavaScript. Your headers never leave your device and are never sent to any server.</p>
            </div>

            <div style={{ marginBottom: '16px' }}>
              <h4 style={{ fontSize: '1rem', fontWeight: 600, color: '#60a5fa', marginBottom: '6px' }}>Which headers are commonly inspected?</h4>
              <p style={{ color: '#94a3b8', lineHeight: 1.6 }}>Developers most commonly inspect Content-Type, Cache-Control, Strict-Transport-Security (HSTS), X-Frame-Options, Content-Security-Policy (CSP), Set-Cookie, and Authorization headers.</p>
            </div>
          </div>

          {/* FEEDBACK FORM */}
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