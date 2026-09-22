'use client';

import React, { useState, useEffect } from 'react';
import { GlobalContainer } from '@/components/layout';
import { SectionHeading } from '@/components/ui';

export default function Page() {
  const [input, setInput] = useState("curl -X POST https://api.example.com/users -H 'Content-Type: application/json' -d '{\"name\":\"John\"}'");
  const [output, setOutput] = useState('');
  const [error, setError] = useState('');
  const [copied, setCopied] = useState(false);
  const [feedback, setFeedback] = useState('');
  const [feedbackSent, setFeedbackSent] = useState(false);

  const handleProcess = (val: string) => {
    setInput(val);
    setError('');
    if (!val.trim()) { setOutput(''); return; }
    try {
      const fn = function curlToFetch(val) {
  let url = 'https://api.example.com';
  const urlMatch = val.match(/https?:\/\/[^\s'"]+/);
  if (urlMatch) url = urlMatch[0];
  let method = 'GET';
  if (/-X\s+POST|--request\s+POST|-d\s|--data/.test(val)) method = 'POST';
  else if (/-X\s+PUT|--request\s+PUT/.test(val)) method = 'PUT';
  else if (/-X\s+DELETE|--request\s+DELETE/.test(val)) method = 'DELETE';
  const headers = {};
  const headerRegex = /(?:-H|--header)\s+['"]([^'"]+)['"]/g;
  let m;
  while ((m = headerRegex.exec(val)) !== null) {
    const idx = m[1].indexOf(':');
    if (idx !== -1) headers[m[1].slice(0, idx).trim()] = m[1].slice(idx + 1).trim();
  }
  let body = '';
  const dataMatch = val.match(/(?:-d|--data|--data-raw)\s+['"]([^'"]+)['"]/);
  if (dataMatch) body = dataMatch[1];
  let fetchCode = 'const response = await fetch("' + url + '"';
  const fetchOpts = [];
  if (method !== 'GET') fetchOpts.push('  method: "' + method + '"');
  if (Object.keys(headers).length) fetchOpts.push('  headers: ' + JSON.stringify(headers, null, 2).replace(/\n/g, '\n  '));
  if (body) fetchOpts.push('  body: ' + JSON.stringify(body));
  let code = '// Fetch API\n' + fetchCode;
  if (fetchOpts.length) code += ', {\n' + fetchOpts.join(',\n') + '\n}';
  code += ');\nconst data = await response.json();\nconsole.log(data);\n\n';
  code += '// Axios\nimport axios from "axios";\n\nconst { data } = await axios({\n  url: "' + url + '",\n  method: "' + method.toLowerCase() + '"';
  if (Object.keys(headers).length) code += ',\n  headers: ' + JSON.stringify(headers, null, 2).replace(/\n/g, '\n  ');
  if (body) code += ',\n  data: ' + JSON.stringify(body);
  code += '\n});\nconsole.log(data);';
  return code;
};
      setOutput(fn(val));
    } catch (e: any) {
      setError(e.message);
      setOutput('');
    }
  };



  // Auto-run on mount
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
        "name": "VelnoxLabs cURL to Fetch & Axios Converter",
        "operatingSystem": "All",
        "applicationCategory": "DeveloperApplication",
        "offers": { "@type": "Offer", "price": "0", "priceCurrency": "USD" },
        "description": "Translate cURL commands into JavaScript code instantly."
      }) }} />

      <GlobalContainer maxWidth="2xl">
        <div style={{ paddingTop: 'var(--space-8)', paddingBottom: 'var(--space-16)' }}>
          <SectionHeading title="cURL to Fetch & Axios Converter" subtitle="Translate cURL to JavaScript fetch and Axios." />
          <div style={{ backgroundColor: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '12px', padding: '24px', marginTop: 'var(--space-6)' }}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '20px' }}>
              <div>
                <label style={{ color: '#fff', fontSize: '0.875rem', fontWeight: 600, display: 'block', marginBottom: '8px' }}>cURL Command:</label>
                <textarea value={input} onChange={(e) => handleProcess(e.target.value)} rows={12} placeholder="Paste cURL command..." style={{ width: '100%', backgroundColor: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', color: '#fff', padding: '12px', fontFamily: 'monospace', fontSize: '0.85rem', outline: 'none' }} />
                {error && <p style={{ color: '#f87171', fontSize: '0.8rem', marginTop: '8px' }}>{error}</p>}
              </div>
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                  <label style={{ color: '#fff', fontSize: '0.875rem', fontWeight: 600 }}>JavaScript Code:</label>
                  <button onClick={handleCopy} style={{ backgroundColor: 'rgba(59,130,246,0.15)', color: '#60a5fa', border: '1px solid rgba(59,130,246,0.3)', borderRadius: '6px', padding: '4px 12px', fontSize: '0.75rem', fontWeight: 600, cursor: 'pointer' }}>{copied ? 'Copied!' : 'Copy'}</button>
                </div>
                <textarea value={output} readOnly rows={12} placeholder="Output will appear here..." style={{ width: '100%', backgroundColor: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', color: '#34d399', padding: '12px', fontFamily: 'monospace', fontSize: '0.85rem', outline: 'none' }} />
              </div>
            </div>
          </div>
          
          {/* Visible SEO Content */}
          <div style={{ marginTop: '48px', backgroundColor: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '12px', padding: '32px' }}>
            <h2 style={{ fontSize: '1.5rem', fontWeight: 700, color: '#ffffff', marginBottom: '16px' }}>What is a cURL to Fetch & Axios Converter?</h2>
            <p style={{ color: '#94a3b8', lineHeight: 1.7, marginBottom: '24px' }}>
              This tool translates cURL commands into equivalent JavaScript code using the Fetch API and Axios library. It is essential for front-end developers who copy API examples from documentation and need them in modern JavaScript.
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
              <p style={{ color: '#94a3b8', lineHeight: 1.6 }}>Yes, VelnoxLabs cURL to Fetch & Axios Converter is 100% free with no sign-up required.</p>
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
