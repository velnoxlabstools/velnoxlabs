'use client';

import React, { useState, useEffect } from 'react';
import { GlobalContainer } from '@/components/layout';
import { SectionHeading } from '@/components/ui';

// Quote-aware tokenizer for cURL commands
function tokenizeCurl(str: string): string[] {
  const normalized = str.replace(/\\\s*\n\s*/g, ' ').trim();
  const tokens: string[] = [];
  let current = '';
  let quote: string | null = null;
  let i = 0;

  while (i < normalized.length) {
    const ch = normalized[i];

    if (quote) {
      if (ch === '\\' && i + 1 < normalized.length) {
        current += normalized[i + 1];
        i += 2;
        continue;
      }
      if (ch === quote) {
        quote = null;
        tokens.push(current);
        current = '';
        i++;
        continue;
      }
      current += ch;
      i++;
      continue;
    }

    if (ch === '"' || ch === "'") {
      quote = ch;
      i++;
      continue;
    }

    if (/\s/.test(ch)) {
      if (current) {
        tokens.push(current);
        current = '';
      }
      i++;
      continue;
    }

    current += ch;
    i++;
  }

  if (current) tokens.push(current);
  return tokens;
}

interface ParsedCurl {
  url: string;
  method: string;
  headers: Record<string, string>;
  body: string;
}

function parseCurl(str: string): ParsedCurl {
  const tokens = tokenizeCurl(str);
  let url = '';
  let method = 'GET';
  const headers: Record<string, string> = {};
  let body = '';

  let i = 0;
  if (tokens[0] === 'curl') i = 1;

  while (i < tokens.length) {
    const tok = tokens[i];

    // Method
    if (tok === '-X' || tok === '--request') {
      method = (tokens[i + 1] || 'GET').toUpperCase();
      i += 2;
      continue;
    }

    // Header
    if (tok === '-H' || tok === '--header') {
      const h = tokens[i + 1] || '';
      const idx = h.indexOf(':');
      if (idx !== -1) {
        headers[h.slice(0, idx).trim()] = h.slice(idx + 1).trim();
      }
      i += 2;
      continue;
    }

    // Data / Body
    if (
      tok === '-d' ||
      tok === '--data' ||
      tok === '--data-raw' ||
      tok === '--data-binary' ||
      tok === '--data-urlencode'
    ) {
      body = tokens[i + 1] || '';
      if (method === 'GET') method = 'POST';
      i += 2;
      continue;
    }

    // URL flag
    if (tok === '--url') {
      url = tokens[i + 1] || '';
      i += 2;
      continue;
    }

    // Basic auth
    if (tok === '-u' || tok === '--user') {
      const creds = tokens[i + 1] || '';
      headers['Authorization'] = 'Basic ' + btoa(creds);
      i += 2;
      continue;
    }

    // Known boolean flags
    if (
      tok === '-s' || tok === '--silent' ||
      tok === '-L' || tok === '--location' ||
      tok === '-k' || tok === '--insecure' ||
      tok === '--compressed' || tok === '-v' ||
      tok === '--verbose' || tok === '-i' ||
      tok === '--include'
    ) {
      i += 1;
      continue;
    }

    // Unknown short flag with value
    if (tok.startsWith('-') && !tok.startsWith('--') && tok.length === 2) {
      i += 2;
      continue;
    }

    // Unknown long flag
    if (tok.startsWith('--')) {
      i += 1;
      continue;
    }

    // First URL
    if (!url && /^https?:\/\//.test(tok)) {
      url = tok;
      i += 1;
      continue;
    }

    i += 1;
  }

  return { url, method, headers, body };
}

function generatePython(parsed: ParsedCurl): string {
  const { url, method, headers, body } = parsed;

  if (!url) {
    return '# ⚠️ Could not detect a URL in the cURL command.';
  }

  // Try to parse body as JSON
  let bodyObj: any = null;
  if (body) {
    try {
      bodyObj = JSON.parse(body);
    } catch {
      bodyObj = null;
    }
  }

  let code = 'import requests\n\n';
  code += `url = "${url}"\n`;

  const headerEntries = Object.entries(headers);
  if (headerEntries.length > 0) {
    code += '\nheaders = {\n';
    headerEntries.forEach(([k, v]) => {
      code += `    "${k}": "${v.replace(/"/g, '\\"')}",\n`;
    });
    code += '}\n';
  }

  if (bodyObj !== null) {
    // Python-friendly JSON formatting (True/False/None)
    const pyJson = JSON.stringify(bodyObj, null, 4)
      .replace(/\btrue\b/g, 'True')
      .replace(/\bfalse\b/g, 'False')
      .replace(/\bnull\b/g, 'None');
    code += `\npayload = ${pyJson}\n`;
  } else if (body) {
    code += `\npayload = ${JSON.stringify(body)}\n`;
  }

  code += '\n';

  // Build request call
  const args: string[] = ['url'];
  if (bodyObj !== null) {
    args.push('json=payload');
  } else if (body) {
    args.push('data=payload');
  }
  if (headerEntries.length > 0) {
    args.push('headers=headers');
  }

  const methodLower = method.toLowerCase();
  code += `response = requests.${methodLower}(${args.join(', ')})\n`;
  code += '\n';
  code += 'print(response.status_code)\n';
  code += 'print(response.json())';

  return code;
}

export default function CurlToPythonPage() {
  const [curlInput, setCurlInput] = useState(
    `curl -X POST https://api.velnoxlabs.com/v1/analyze -H 'Authorization: Bearer token_abc123' -d '{"status":"active"}'`
  );
  const [pythonOutput, setPythonOutput] = useState('');
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState('');
  const [feedback, setFeedback] = useState('');
  const [feedbackSent, setFeedbackSent] = useState(false);

  const handleConvert = (cmd: string) => {
    setError('');
    if (!cmd.trim()) {
      setPythonOutput('');
      return;
    }
    try {
      const parsed = parseCurl(cmd);
      if (!parsed.url) {
        setError('Could not find a URL in the cURL command.');
        setPythonOutput('');
        return;
      }
      setPythonOutput(generatePython(parsed));
    } catch (err: any) {
      setError(err.message || 'Failed to parse cURL command');
      setPythonOutput('');
    }
  };

  useEffect(() => {
    handleConvert(curlInput);
  }, [curlInput]);

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
        'offers': { '@type': 'Offer', 'price': '0', 'priceCurrency': 'USD' },
        'description': 'Convert cURL commands into clean Python requests library code instantly inside your browser with full support for headers, JSON bodies, and multi-line commands.'
      },
      {
        '@type': 'FAQPage',
        'mainEntity': [
          {
            '@type': 'Question',
            'name': 'How to convert cURL to Python requests online?',
            'acceptedAnswer': { '@type': 'Answer', 'text': 'Paste your cURL command into the input box to instantly generate corresponding Python requests code.' }
          },
          {
            '@type': 'Question',
            'name': 'Is command translation secure?',
            'acceptedAnswer': { '@type': 'Answer', 'text': 'Yes, all parsing runs entirely client-side with zero data logging.' }
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
            title="cURL to Python Requests Converter"
            subtitle="Transform cURL terminal commands into idiomatic Python requests code instantly."
          />

          {/* ========== TOOL UI ========== */}
          <div style={{ backgroundColor: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '12px', padding: '24px', marginTop: 'var(--space-6)' }}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '20px' }}>
              <div>
                <label style={{ color: '#fff', fontSize: '0.875rem', fontWeight: 600, display: 'block', marginBottom: '8px' }}>cURL Command:</label>
                <textarea
                  value={curlInput}
                  onChange={(e) => setCurlInput(e.target.value)}
                  rows={14}
                  placeholder="Paste cURL command..."
                  style={{ width: '100%', backgroundColor: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', color: '#fff', padding: '12px', fontFamily: 'monospace', fontSize: '0.85rem', outline: 'none', resize: 'vertical' }}
                />
              </div>
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                  <label style={{ color: '#fff', fontSize: '0.875rem', fontWeight: 600 }}>Python Requests Code:</label>
                  <button
                    onClick={handleCopy}
                    disabled={!pythonOutput}
                    style={{ backgroundColor: pythonOutput ? 'rgba(59, 130, 246, 0.15)' : 'rgba(255,255,255,0.05)', color: pythonOutput ? '#60a5fa' : '#64748b', border: '1px solid rgba(59, 130, 246, 0.3)', borderRadius: '6px', padding: '4px 12px', fontSize: '0.75rem', fontWeight: 600, cursor: pythonOutput ? 'pointer' : 'not-allowed' }}
                  >
                    {copied ? 'Copied!' : 'Copy Code'}
                  </button>
                </div>
                <textarea
                  value={pythonOutput}
                  readOnly
                  rows={14}
                  placeholder="Generated Python code will appear here..."
                  style={{ width: '100%', backgroundColor: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', color: '#34d399', padding: '12px', fontFamily: 'monospace', fontSize: '0.85rem', outline: 'none', resize: 'vertical' }}
                />
              </div>
            </div>

            {error && (
              <div style={{ marginTop: '12px', backgroundColor: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.3)', borderRadius: '8px', padding: '12px' }}>
                <p style={{ color: '#f87171', fontSize: '0.85rem', margin: 0 }}>❌ {error}</p>
              </div>
            )}
          </div>

          {/* ========== SEO CONTENT ========== */}
          <div style={{ marginTop: '48px', backgroundColor: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '12px', padding: '32px' }}>
            <h2 style={{ fontSize: '1.5rem', fontWeight: 700, color: '#ffffff', marginBottom: '16px' }}>What is a cURL to Python Requests Converter?</h2>
            <p style={{ color: '#94a3b8', lineHeight: 1.7, marginBottom: '24px' }}>
              This tool converts cURL commands into clean Python code using the requests library. It extracts URLs, headers, HTTP methods, and request bodies automatically so developers can quickly integrate APIs into Python scripts. It fully supports multi-line commands, quoted bodies with JSON, custom headers, and authentication.
            </p>

            <h3 style={{ fontSize: '1.2rem', fontWeight: 700, color: '#ffffff', marginBottom: '12px', marginTop: '24px' }}>How to Use This Tool</h3>
            <ul style={{ color: '#94a3b8', lineHeight: 1.9, paddingLeft: '20px', marginBottom: '24px' }}>
              <li>Paste your cURL command into the input box.</li>
              <li>The tool instantly parses method, URL, headers, and body.</li>
              <li>Clean Python code is generated with the requests library.</li>
              <li>Click <strong style={{ color: '#34d399' }}>Copy Code</strong> to copy the result.</li>
            </ul>

            <h3 style={{ fontSize: '1.2rem', fontWeight: 700, color: '#ffffff', marginBottom: '12px', marginTop: '24px' }}>Supported cURL Flags</h3>
            <ul style={{ color: '#94a3b8', lineHeight: 1.9, paddingLeft: '20px', marginBottom: '24px' }}>
              <li><code style={{ color: '#60a5fa' }}>-X</code> / <code style={{ color: '#60a5fa' }}>--request</code> — HTTP method</li>
              <li><code style={{ color: '#60a5fa' }}>-H</code> / <code style={{ color: '#60a5fa' }}>--header</code> — custom headers</li>
              <li><code style={{ color: '#60a5fa' }}>-d</code> / <code style={{ color: '#60a5fa' }}>--data</code> — request body (JSON supported)</li>
              <li><code style={{ color: '#60a5fa' }}>-u</code> / <code style={{ color: '#60a5fa' }}>--user</code> — basic authentication</li>
              <li>Multi-line commands with <code style={{ color: '#60a5fa' }}>\</code> continuation</li>
            </ul>

            <h3 style={{ fontSize: '1.2rem', fontWeight: 700, color: '#ffffff', marginBottom: '16px', marginTop: '24px' }}>Frequently Asked Questions</h3>

            <div style={{ marginBottom: '16px' }}>
              <h4 style={{ fontSize: '1rem', fontWeight: 600, color: '#60a5fa', marginBottom: '6px' }}>Does it support JSON bodies?</h4>
              <p style={{ color: '#94a3b8', lineHeight: 1.6 }}>Yes, JSON bodies are automatically parsed and formatted as Python dictionaries (with <code style={{ color: '#60a5fa' }}>True</code>, <code style={{ color: '#60a5fa' }}>False</code>, <code style={{ color: '#60a5fa' }}>None</code>).</p>
            </div>

            <div style={{ marginBottom: '16px' }}>
              <h4 style={{ fontSize: '1rem', fontWeight: 600, color: '#60a5fa', marginBottom: '6px' }}>Is this tool free to use?</h4>
              <p style={{ color: '#94a3b8', lineHeight: 1.6 }}>Yes, VelnoxLabs cURL to Python Requests Converter is 100% free with no sign-up required.</p>
            </div>

            <div style={{ marginBottom: '16px' }}>
              <h4 style={{ fontSize: '1rem', fontWeight: 600, color: '#60a5fa', marginBottom: '6px' }}>Is my data secure?</h4>
              <p style={{ color: '#94a3b8', lineHeight: 1.6 }}>Absolutely. All processing happens entirely in your browser using client-side JavaScript. Your data never leaves your device.</p>
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
