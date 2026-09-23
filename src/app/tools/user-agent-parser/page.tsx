'use client';

import React, { useState, useEffect } from 'react';
import { GlobalContainer } from '@/components/layout';
import { SectionHeading } from '@/components/ui';

export default function UserAgentParserPage() {
  const [uaString, setUaString] = useState('');
  const [output, setOutput] = useState('');
  const [copied, setCopied] = useState(false);
  const [feedback, setFeedback] = useState('');
  const [feedbackSent, setFeedbackSent] = useState(false);

  const parseUa = (ua: string) => {
    if (!ua.trim()) {
      setOutput('');
      return;
    }

    let b = 'Unknown Browser';
    let o = 'Unknown OS';
    let d = 'Desktop';

    // Browser Detection
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

    // OS & Device Detection (Order matters! iPhone/iPad checked first)
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
        'name': 'VelnoxLabs User-Agent Parser',
        'operatingSystem': 'All',
        'applicationCategory': 'DeveloperApplication',
        'offers': { '@type': 'Offer', 'price': '0', 'priceCurrency': 'USD' },
        'description': 'Parse and analyze browser User-Agent strings instantly in your browser to detect device, OS, and browser details.'
      },
      {
        '@type': 'FAQPage',
        'mainEntity': [
          {
            '@type': 'Question',
            'name': 'How to parse User-Agent strings online?',
            'acceptedAnswer': { '@type': 'Answer', 'text': 'Paste any User-Agent string or use your current browser signature to instantly analyze browser, OS, and device type.' }
          },
          {
            '@type': 'Question',
            'name': 'Is user-agent parsing performed securely?',
            'acceptedAnswer': { '@type': 'Answer', 'text': 'Yes! Everything is processed locally on your client machine with absolute privacy.' }
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
            title="User-Agent Parser"
            subtitle="Analyze and decode browser User-Agent strings to inspect device, operating system, and browser architecture."
          />

          <div style={{ backgroundColor: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '12px', padding: '24px', marginTop: 'var(--space-6)' }}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '20px' }}>
              <div>
                <label style={{ color: '#fff', fontSize: '0.875rem', fontWeight: 600, display: 'block', marginBottom: '8px' }}>Input User-Agent String:</label>
                <textarea 
                  value={uaString} 
                  onChange={handleManualParse} 
                  rows={10} 
                  placeholder="Enter or paste User-Agent string here..." 
                  style={{ width: '100%', backgroundColor: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', color: '#fff', padding: '12px', fontFamily: 'monospace', fontSize: '0.85rem', outline: 'none', resize: 'vertical' }} 
                />
              </div>
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                  <label style={{ color: '#fff', fontSize: '0.875rem', fontWeight: 600 }}>Parsed Output:</label>
                  <button onClick={handleCopy} style={{ backgroundColor: 'rgba(59, 130, 246, 0.15)', color: '#60a5fa', border: '1px solid rgba(59, 130, 246, 0.3)', borderRadius: '6px', padding: '4px 12px', fontSize: '0.75rem', fontWeight: 600, cursor: 'pointer' }}>
                    {copied ? 'Copied!' : 'Copy'}
                  </button>
                </div>
                <textarea 
                  value={output} 
                  readOnly 
                  rows={10} 
                  placeholder="Parsed output will appear here..." 
                  style={{ width: '100%', backgroundColor: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', color: '#34d399', padding: '12px', fontFamily: 'monospace', fontSize: '0.85rem', outline: 'none', resize: 'vertical' }} 
                />
              </div>
            </div>
          </div>

          {/* Visible SEO Content */}
          <div style={{ marginTop: '48px', backgroundColor: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '12px', padding: '32px' }}>
            <h2 style={{ fontSize: '1.5rem', fontWeight: 700, color: '#ffffff', marginBottom: '16px' }}>What is a User-Agent Parser?</h2>
            <p style={{ color: '#94a3b8', lineHeight: 1.7, marginBottom: '24px' }}>
              The User-Agent Parser analyzes browser User-Agent strings to extract browser name, version, operating system, device type, and rendering engine.
            </p>

            <h3 style={{ fontSize: '1.2rem', fontWeight: 700, color: '#ffffff', marginBottom: '12px', marginTop: '24px' }}>How to Use This Tool</h3>
            <ul style={{ color: '#94a3b8', lineHeight: 1.9, paddingLeft: '20px', marginBottom: '24px' }}>
              <li>Enter or paste your User-Agent string into the input field above.</li>
              <li>The tool processes your input instantly in real-time.</li>
              <li>View the parsed result in the output panel on the right.</li>
              <li>Click the <strong style={{ color: '#34d399' }}>Copy</strong> button to copy the result to your clipboard.</li>
            </ul>

            <h3 style={{ fontSize: '1.2rem', fontWeight: 700, color: '#ffffff', marginBottom: '16px', marginTop: '24px' }}>Frequently Asked Questions</h3>

            <div style={{ marginBottom: '16px' }}>
              <h4 style={{ fontSize: '1rem', fontWeight: 600, color: '#60a5fa', marginBottom: '6px' }}>Is this tool free to use?</h4>
              <p style={{ color: '#94a3b8', lineHeight: 1.6 }}>Yes, VelnoxLabs User-Agent Parser is 100% free with no sign-up required.</p>
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

          {/* Single Feedback Section at the Bottom */}
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