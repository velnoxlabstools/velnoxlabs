'use client';

import React, { useState } from 'react';
import { GlobalContainer } from '@/components/layout';
import { SectionHeading } from '@/components/ui';

export default function ColorConverterPage() {
  const [hex, setHex] = useState('#3b82f6');
  const [rgb, setRgb] = useState('rgb(59, 130, 246)');
  const [hsl, setHsl] = useState('hsl(217, 91%, 60%)');
  const [copiedField, setCopiedField] = useState('');
  const [error, setError] = useState('');
  const [feedback, setFeedback] = useState('');
  const [feedbackSent, setFeedbackSent] = useState(false);

  // Helper: RGB to HSL
  const rgbToHsl = (r: number, g: number, b: number) => {
    r /= 255; g /= 255; b /= 255;
    const max = Math.max(r, g, b), min = Math.min(r, g, b);
    let h = 0, s = 0, l = (max + min) / 2;

    if (max !== min) {
      const d = max - min;
      s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
      switch (max) {
        case r: h = (g - b) / d + (g < b ? 6 : 0); break;
        case g: h = (b - r) / d + 2; break;
        case b: h = (r - g) / d + 4; break;
      }
      h /= 6;
    }
    return `hsl(${Math.round(h * 360)}, ${Math.round(s * 100)}%, ${Math.round(l * 100)}%)`;
  };

  // Helper: HSL to RGB
  const hslToRgb = (h: number, s: number, l: number) => {
    s /= 100; l /= 100;
    const k = (n: number) => (n + h / 30) % 12;
    const a = s * Math.min(l, 1 - l);
    const f = (n: number) => l - a * Math.max(-1, Math.min(k(n) - 3, Math.min(9 - k(n), 1)));
    return {
      r: Math.round(255 * f(0)),
      g: Math.round(255 * f(8)),
      b: Math.round(255 * f(4))
    };
  };

  // Helper: RGB to HEX
  const rgbToHex = (r: number, g: number, b: number) => {
    return '#' + [r, g, b].map(x => {
      const hex = x.toString(16);
      return hex.length === 1 ? '0' + hex : hex;
    }).join('');
  };

  // Handle HEX input change
  const handleHexChange = (value: string) => {
    setHex(value);
    setError('');
    let cleanHex = value.replace('#', '');
    if (cleanHex.length === 3) {
      cleanHex = cleanHex.split('').map(c => c + c).join('');
    }
    if (cleanHex.length === 6) {
      const r = parseInt(cleanHex.substring(0, 2), 16);
      const g = parseInt(cleanHex.substring(2, 4), 16);
      const b = parseInt(cleanHex.substring(4, 6), 16);
      if (!isNaN(r) && !isNaN(g) && !isNaN(b)) {
        setRgb(`rgb(${r}, ${g}, ${b})`);
        setHsl(rgbToHsl(r, g, b));
      } else {
        setError('Invalid HEX code');
      }
    }
  };

  // Handle RGB input change
  const handleRgbChange = (value: string) => {
    setRgb(value);
    setError('');
    const match = value.match(/\d+/g);
    if (match && match.length >= 3) {
      const r = Math.min(255, Math.max(0, parseInt(match[0])));
      const g = Math.min(255, Math.max(0, parseInt(match[1])));
      const b = Math.min(255, Math.max(0, parseInt(match[2])));
      setHex(rgbToHex(r, g, b));
      setHsl(rgbToHsl(r, g, b));
    } else if (value.trim() !== '') {
      setError('Invalid RGB format. Use rgb(r, g, b)');
    }
  };

  // Handle HSL input change
  const handleHslChange = (value: string) => {
    setHsl(value);
    setError('');
    const match = value.match(/\d+/g);
    if (match && match.length >= 3) {
      const h = parseInt(match[0]);
      const s = parseInt(match[1]);
      const l = parseInt(match[2]);
      const { r, g, b } = hslToRgb(h, s, l);
      setHex(rgbToHex(r, g, b));
      setRgb(`rgb(${r}, ${g}, ${b})`);
    } else if (value.trim() !== '') {
      setError('Invalid HSL format. Use hsl(h, s%, l%)');
    }
  };

  const handleCopy = (text: string, field: string) => {
    if (!text) return;
    navigator.clipboard.writeText(text);
    setCopiedField(field);
    setTimeout(() => setCopiedField(''), 2000);
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
        'name': 'VelnoxLabs Color Converter',
        'operatingSystem': 'All',
        'applicationCategory': 'DeveloperApplication',
        'offers': { '@type': 'Offer', 'price': '0', 'priceCurrency': 'USD' },
        'description': 'Convert color codes between HEX, RGB, and HSL formats instantly inside your browser with live preview and zero latency.'
      },
      {
        '@type': 'FAQPage',
        'mainEntity': [
          {
            '@type': 'Question',
            'name': 'How to convert color codes online?',
            'acceptedAnswer': { '@type': 'Answer', 'text': 'Enter or pick a HEX, RGB, or HSL color code to instantly see its converted equivalents with one-click copy.' }
          },
          {
            '@type': 'Question',
            'name': 'Is the color converter free to use?',
            'acceptedAnswer': { '@type': 'Answer', 'text': 'Yes! 100% free, client-side processing with zero ads or tracking.' }
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
            title="Color Converter (HEX, RGB, HSL)"
            subtitle="Convert color formats instantly for web development and UI design with absolute client-side speed."
          />

          <div style={{ backgroundColor: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '12px', padding: '24px', marginTop: 'var(--space-6)' }}>
            
            {/* Color Preview Box */}
            <div style={{ marginBottom: '24px', textAlign: 'center' }}>
              <label style={{ color: '#fff', fontSize: '0.875rem', fontWeight: 600, display: 'block', marginBottom: '8px' }}>Color Preview:</label>
              <div style={{ width: '100%', height: '80px', borderRadius: '8px', backgroundColor: hex, border: '1px solid rgba(255,255,255,0.1)' }}></div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '20px' }}>
              
              {/* HEX Input */}
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                  <label style={{ color: '#fff', fontSize: '0.875rem', fontWeight: 600 }}>HEX:</label>
                  <button onClick={() => handleCopy(hex, 'hex')} style={{ backgroundColor: 'rgba(59, 130, 246, 0.15)', color: '#60a5fa', border: '1px solid rgba(59, 130, 246, 0.3)', borderRadius: '6px', padding: '4px 12px', fontSize: '0.75rem', fontWeight: 600, cursor: 'pointer' }}>
                    {copiedField === 'hex' ? 'Copied!' : 'Copy'}
                  </button>
                </div>
                <input
                  type="text"
                  value={hex}
                  onChange={(e) => handleHexChange(e.target.value)}
                  placeholder="#3b82f6"
                  style={{ width: '100%', backgroundColor: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', color: '#fff', padding: '12px', fontFamily: 'monospace', fontSize: '0.9rem', outline: 'none' }}
                />
              </div>

              {/* RGB Input */}
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                  <label style={{ color: '#fff', fontSize: '0.875rem', fontWeight: 600 }}>RGB:</label>
                  <button onClick={() => handleCopy(rgb, 'rgb')} style={{ backgroundColor: 'rgba(59, 130, 246, 0.15)', color: '#60a5fa', border: '1px solid rgba(59, 130, 246, 0.3)', borderRadius: '6px', padding: '4px 12px', fontSize: '0.75rem', fontWeight: 600, cursor: 'pointer' }}>
                    {copiedField === 'rgb' ? 'Copied!' : 'Copy'}
                  </button>
                </div>
                <input
                  type="text"
                  value={rgb}
                  onChange={(e) => handleRgbChange(e.target.value)}
                  placeholder="rgb(59, 130, 246)"
                  style={{ width: '100%', backgroundColor: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', color: '#fff', padding: '12px', fontFamily: 'monospace', fontSize: '0.9rem', outline: 'none' }}
                />
              </div>

              {/* HSL Input */}
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                  <label style={{ color: '#fff', fontSize: '0.875rem', fontWeight: 600 }}>HSL:</label>
                  <button onClick={() => handleCopy(hsl, 'hsl')} style={{ backgroundColor: 'rgba(59, 130, 246, 0.15)', color: '#60a5fa', border: '1px solid rgba(59, 130, 246, 0.3)', borderRadius: '6px', padding: '4px 12px', fontSize: '0.75rem', fontWeight: 600, cursor: 'pointer' }}>
                    {copiedField === 'hsl' ? 'Copied!' : 'Copy'}
                  </button>
                </div>
                <input
                  type="text"
                  value={hsl}
                  onChange={(e) => handleHslChange(e.target.value)}
                  placeholder="hsl(217, 91%, 60%)"
                  style={{ width: '100%', backgroundColor: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', color: '#fff', padding: '12px', fontFamily: 'monospace', fontSize: '0.9rem', outline: 'none' }}
                />
              </div>
            </div>

            {error && <p style={{ color: '#ef4444', fontSize: '0.875rem', marginTop: '16px', textAlign: 'center' }}>{error}</p>}
          </div>

          {/* Visible SEO Content */}
          <div style={{ marginTop: '48px', backgroundColor: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '12px', padding: '32px' }}>
            <h2 style={{ fontSize: '1.5rem', fontWeight: 700, color: '#ffffff', marginBottom: '16px' }}>What is a Color Converter?</h2>
            <p style={{ color: '#94a3b8', lineHeight: 1.7, marginBottom: '24px' }}>
              The Color Converter is a utility that transforms color values between HEX, RGB, HSL, and other formats. Designers and front-end developers use this tool to quickly find equivalent color codes when working across CSS, design tools, and graphics software.
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
              <p style={{ color: '#94a3b8', lineHeight: 1.6 }}>Yes, VelnoxLabs Color Converter is 100% free with no sign-up required.</p>
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