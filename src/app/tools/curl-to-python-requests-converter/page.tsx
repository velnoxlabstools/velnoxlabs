'use client';

import React, { useState, useEffect } from 'react';
import { GlobalContainer } from '@/components/layout';
import { SectionHeading } from '@/components/ui';

export default function CurlToPythonPage() {
  const [curlInput, setCurlInput] = useState("curl -X POST https://api.velnoxlabs.com/v1/analyze -H 'Authorization: Bearer token_abc123' -d '{\"status\":\"active\"}'");
  const [pythonOutput, setPythonOutput] = useState('');
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState('');
  const [feedback, setFeedback] = useState('');
  const [feedbackSent, setFeedbackSent] = useState(false);

  const handleConvert = (cmd: string) => {
    setCurlInput(cmd);
    setError('');
    if (!cmd.trim()) {
      setPythonOutput('');
      return;
    }

    try {
      let url = 'https://api.example.com';
      let method = 'GET';
      let headers: Record<string, string> = {};
      let data = '';

      const urlMatch = cmd.match(/https?:\/\/[^\s']+/);
      if (urlMatch) url = urlMatch[0];

      if (cmd.includes('-X POST') || cmd.includes('--request POST') || cmd.includes('-d ') || cmd.includes('--data')) {
        method = 'POST';
      }

      const headerRegex = /(?:-H|--header)\s+['"]([^'"]+)['"]/g;
      let match;
      while ((match = headerRegex.exec(cmd)) !== null) {
        const parts = match[1].split(':');
        if (parts.length >= 2) {
          headers[parts[0].trim()] = parts.slice(1).join(':').trim();
        }
      }

      const dataRegex = /(?:-d|--data|--data-raw)\s+['"]([^'"]+)['"]/g;
      const dataMatch = dataRegex.exec(cmd);
      if (dataMatch) {
        data = dataMatch[1];
      }

      let pyCode = `import requests\n\nurl = "${url}"\n`;
      if (Object.keys(headers).length > 0) {
        pyCode += `headers = ${JSON.stringify(headers, null, 2)}\n`;
      }
      if (data) {
        try {
          const parsedJson = JSON.parse(data);
          pyCode += `payload = ${JSON.stringify(parsedJson, null, 2)}\n`;
          pyCode += `\nresponse = requests.${method.toLowerCase()}(url, json=payload`;
        } catch (e) {
          pyCode += `payload = "${data}"\n`;
          pyCode += `\nresponse = requests.${method.toLowerCase()}(url, data=payload`;
        }
      } else {
        pyCode += `\nresponse = requests.${method.toLowerCase()}(url`;
      }

      if (Object.keys(headers).length > 0) {
        pyCode += `, headers=headers`;
      }
      pyCode += `)\n\nprint(response.status_code)\nprint(response.json())`;

      setPythonOutput(pyCode);
    } catch (err: any) {
      setError(err.message || 'Failed to parse cURL command');
      setPythonOutput('');
    }
  };


    // Auto-run on mount
  useEffect(() => {
    if (curlInput) {
      try { handleConvert(curlInput); } catch(e) {}
    }
  }, []);

const handleCopy = () => {
    if (!pythonOutput) return;
    navigator.clipboard.writeText(pythonOutput);
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
        'name': 'VelnoxLabs cURL to Python Requests Converter',
        'operatingSystem': 'All',
        'applicationCategory': 'DeveloperApplication',
        'offers': {
          '@type': 'Offer',
          'price': '0',
          'priceCurrency': 'USD'
        },
        'description': 'Convert cURL commands into clean Python requests library code instantly inside your browser.'
      },
      {
        '@type': 'FAQPage',
        'mainEntity': [
          {
            '@type': 'Question',
            'name': 'How to convert cURL to Python requests online?',
            'acceptedAnswer': {
              '@type': 'Answer',
              'text': 'Paste your cURL command into the input box to instantly generate corresponding Python requests code.'
            }
          },
          {
            '@type': 'Question',
            'name': 'Is command translation secure?',
            'acceptedAnswer': {
              '@type': 'Answer',
              'text': 'Yes, all parsing runs entirely client-side with zero data logging.'
            }
          }
        ]
      }
    ]
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
            title="cURL to Python Requests Converter"
            subtitle="Transform cURL terminal commands into idiomatic Python requests code instantly."
          />
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">cURL Command</label>
              <textarea
                value={curlInput}
                onChange={(e) => handleConvert(e.target.value)}
                className="w-full h-64 bg-slate-900 border border-slate-700 rounded-xl p-4 text-slate-200 font-mono text-sm focus:outline-none focus:border-emerald-500"
                placeholder="Paste your cURL command here..."
              />
              {error && <p className="text-red-400 text-sm mt-2">{error}</p>}
            </div>
            <div>
              
          {/* Visible SEO Content */}
          <div style={{ marginTop: '48px', backgroundColor: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '12px', padding: '32px' }}>
            <h2 style={{ fontSize: '1.5rem', fontWeight: 700, color: '#ffffff', marginBottom: '16px' }}>What is a cURL to Python Requests Converter?</h2>
            <p style={{ color: '#94a3b8', lineHeight: 1.7, marginBottom: '24px' }}>
              This tool converts cURL commands into clean Python code using the requests library. It extracts URLs, headers, HTTP methods, and request bodies automatically so developers can quickly integrate APIs into Python scripts.
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
              <p style={{ color: '#94a3b8', lineHeight: 1.6 }}>Yes, VelnoxLabs cURL to Python Requests Converter is 100% free with no sign-up required.</p>
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

<div className="flex justify-between items-center mb-2">
                <label className="block text-sm font-medium text-slate-300">Python Requests Code</label>
                <button
                  onClick={handleCopy}
                  className="text-xs bg-slate-800 hover:bg-slate-700 text-slate-300 px-3 py-1 rounded transition"
                >
                  {copied ? 'Copied!' : 'Copy Code'}
                </button>
              </div>
              <textarea
                readOnly
                value={pythonOutput}
                className="w-full h-64 bg-slate-900 border border-slate-700 rounded-xl p-4 text-emerald-400 font-mono text-sm focus:outline-none"
                placeholder="Python code will appear here..."
              />
            </div>
          </div>

          {/* Single Feedback Section at the Bottom */}
          <div className="bg-slate-900/40 border border-slate-800 p-8 rounded-2xl">
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