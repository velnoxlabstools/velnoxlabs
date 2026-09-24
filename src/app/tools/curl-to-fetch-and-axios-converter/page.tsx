'use client';

import React, { useState, useEffect } from 'react';
import { GlobalContainer } from '@/components/layout';
import { SectionHeading } from '@/components/ui';

// Quote-aware tokenizer for cURL commands
function tokenizeCurl(str: string): string[] {
  // Normalize multi-line with backslash continuation
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

    // Explicit URL flag
    if (tok === '--url') {
      url = tokens[i + 1] || '';
      i += 2;
      continue;
    }

    // -u user:pass (basic auth) → convert to Authorization header
    if (tok === '-u' || tok === '--user') {
      const creds = tokens[i + 1] || '';
      headers['Authorization'] = 'Basic ' + btoa(creds);
      i += 2;
      continue;
    }

    // Known boolean flags without value
    if (tok === '-s' || tok === '--silent' || tok === '-L' || tok === '--location' || tok === '-k' || tok === '--insecure' || tok === '--compressed' || tok === '-v' || tok === '--verbose' || tok === '-i' || tok === '--include' || tok === '-I' || tok === '--head') {
      if (tok === '-I' || tok === '--head') method = 'HEAD';
      i += 1;
      continue;
    }

    // Unknown flag that takes a value
    if (tok.startsWith('-') && !tok.startsWith('--') && tok.length === 2) {
      i += 2;
      continue;
    }

    if (tok.startsWith('--')) {
      i += 1;
      continue;
    }

    // First non-flag token → URL
    if (!url && /^https?:\/\//.test(tok)) {
      url = tok;
      i += 1;
      continue;
    }

    i += 1;
  }

  return { url, method, headers, body };
}

function generateCode(parsed: ParsedCurl): string {
  const { url, method, headers, body } = parsed;

  if (!url) {
    return '// ⚠️ Could not detect a URL in the cURL command.';
  }

  // Try to parse body as JSON for nicer formatting
  let bodyObj: any = null;
  if (body) {
    try {
      bodyObj = JSON.parse(body);
    } catch {
      bodyObj = null;
    }
  }

  const headerEntries = Object.entries(headers);
  const hasHeaders = headerEntries.length > 0;

  // ==================== Fetch ====================
  let fetchCode = '// ============= Fetch API =============\n';
  fetchCode += `const response = await fetch("${url}"`;

  const opts: string[] = [];
  if (method !== 'GET') {
    opts.push(`  method: "${method}"`);
  }
  if (hasHeaders) {
    const headerLines = headerEntries
      .map(([k, v]) => `    "${k}": "${v.replace(/"/g, '\\"')}"`)
      .join(',\n');
    opts.push(`  headers: {\n${headerLines}\n  }`);
  }
  if (bodyObj !== null) {
    const pretty = JSON.stringify(bodyObj, null, 2)
      .split('\n')
      .map((l, idx) => (idx === 0 ? l : '  ' + l))
      .join('\n');
    opts.push(`  body: JSON.stringify(${pretty})`);
  } else if (body) {
    opts.push(`  body: ${JSON.stringify(body)}`);
  }

  if (opts.length > 0) {
    fetchCode += `, {\n${opts.join(',\n')}\n}`;
  }
  fetchCode += ');\n';
  fetchCode += 'const data = await response.json();\n';
  fetchCode += 'console.log(data);';

  // ==================== Axios ====================
  let axiosCode = '\n\n// ============= Axios =============\n';
  axiosCode += 'import axios from "axios";\n\n';
  axiosCode += 'const { data } = await axios({\n';
  axiosCode += `  url: "${url}",\n`;
  axiosCode += `  method: "${method.toLowerCase()}"`;

  if (hasHeaders) {
    const headerLines = headerEntries
      .map(([k, v]) => `    "${k}": "${v.replace(/"/g, '\\"')}"`)
      .join(',\n');
    axiosCode += `,\n  headers: {\n${headerLines}\n  }`;
  }

  if (bodyObj !== null) {
    const pretty = JSON.stringify(bodyObj, null, 2)
      .split('\n')
      .map((l, idx) => (idx === 0 ? l : '  ' + l))
      .join('\n');
    axiosCode += `,\n  data: ${pretty}`;
  } else if (body) {
    axiosCode += `,\n  data: ${JSON.stringify(body)}`;
  }

  axiosCode += '\n});\n';
  axiosCode += 'console.log(data);';

  return fetchCode + axiosCode;
}

export default function CurlConverterPage() {
  const [input, setInput] = useState(
    "curl -X POST https://api.velnoxlabs.com/users -H 'Content-Type: application/json' -d '{\"name\":\"Rohit\",\"age\":25}'"
  );
  const [output, setOutput] = useState('');
  const [error, setError] = useState('');
  const [copied, setCopied] = useState(false);
  const [feedback, setFeedback] = useState('');
  const [feedbackSent, setFeedbackSent] = useState(false);

  const handleProcess = (val: string) => {
    setError('');
    if (!val.trim()) {
      setOutput('');
      return;
    }
    try {
      const parsed = parseCurl(val);
      if (!parsed.url) {
        setError('Could not find a URL in the cURL command.');
        setOutput('');
        return;
      }
      setOutput(generateCode(parsed));
    } catch (e: any) {
      setError(e.message || 'Failed to parse cURL command');
      setOutput('');
    }
  };

  useEffect(() => {
    handleProcess(input);
  }, [input]);

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
        'name': 'VelnoxLabs cURL to Fetch & Axios Converter',
        'operatingSystem': 'All',
        'applicationCategory': 'DeveloperApplication',
        'offers': { '@type': 'Offer', 'price': '0', 'priceCurrency': 'USD' },
        'description': 'Translate cURL commands into JavaScript fetch() and Axios code instantly with full support for headers, JSON bodies, and multi-line commands.'
      },
      {
        '@type': 'FAQPage',
        'mainEntity': [
          {
            '@type': 'Question',
            'name': 'How to convert cURL to JavaScript?',
            'acceptedAnswer': { '@type': 'Answer', 'text': 'Paste your cURL command and the tool instantly generates equivalent fetch() and Axios code with proper method, headers, and body.' }
          },
          {
            '@type': 'Question',
            'name': 'Is this converter secure?',
            'acceptedAnswer': { '@type': 'Answer', 'text': 'Yes, 100% client-side processing. Your cURL commands never leave your browser.' }
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
            title="cURL to Fetch & Axios Converter"
            subtitle="Translate cURL commands into JavaScript fetch() and Axios code instantly."
          />

          {/* ========== TOOL UI ========== */}
          <div style={{ backgroundColor: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '12px', padding: '24px', marginTop: 'var(--space-6)' }}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '20px' }}>
              <div>
                <label style={{ color: '#fff', fontSize: '0.875rem', fontWeight: 600, display: 'block', marginBottom: '8px' }}>cURL Command:</label>
                <textarea
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  rows={14}
                  placeholder="Paste cURL command..."
                  style={{ width: '100%', backgroundColor: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', color: '#fff', padding: '12px', fontFamily: 'monospace', fontSize: '0.85rem', outline: 'none', resize: 'vertical' }}
                />
              </div>
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                  <label style={{ color: '#fff', fontSize: '0.875rem', fontWeight: 600 }}>JavaScript Code:</label>
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
                  rows={14}
                  placeholder="Generated JavaScript code will appear here..."
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
            <h2 style={{ fontSize: '1.5rem', fontWeight: 700, color: '#ffffff', marginBottom: '16px' }}>What is a cURL to Fetch & Axios Converter?</h2>
            <p style={{ color: '#94a3b8', lineHeight: 1.7, marginBottom: '24px' }}>
              This tool translates cURL commands into equivalent JavaScript code using the Fetch API and Axios library. It is essential for front-end developers who copy API examples from documentation and need them in modern JavaScript. It fully supports multi-line commands, quoted bodies with JSON, custom headers, and authentication.
            </p>

            <h3 style={{ fontSize: '1.2rem', fontWeight: 700, color: '#ffffff', marginBottom: '12px', marginTop: '24px' }}>How to Use This Tool</h3>
            <ul style={{ color: '#94a3b8', lineHeight: 1.9, paddingLeft: '20px', marginBottom: '24px' }}>
              <li>Paste your cURL command into the input box.</li>
              <li>The tool instantly parses method, URL, headers, and body.</li>
              <li>Both <strong style={{ color: '#34d399' }}>Fetch API</strong> and <strong style={{ color: '#34d399' }}>Axios</strong> code are generated.</li>
              <li>Click <strong style={{ color: '#34d399' }}>Copy</strong> to copy the generated JavaScript.</li>
            </ul>

            <h3 style={{ fontSize: '1.2rem', fontWeight: 700, color: '#ffffff', marginBottom: '12px', marginTop: '24px' }}>Supported cURL Flags</h3>
            <ul style={{ color: '#94a3b8', lineHeight: 1.9, paddingLeft: '20px', marginBottom: '24px' }}>
              <li><code style={{ color: '#60a5fa' }}>-X</code> / <code style={{ color: '#60a5fa' }}>--request</code> — HTTP method</li>
              <li><code style={{ color: '#60a5fa' }}>-H</code> / <code style={{ color: '#60a5fa' }}>--header</code> — custom headers</li>
              <li><code style={{ color: '#60a5fa' }}>-d</code> / <code style={{ color: '#60a5fa' }}>--data</code> / <code style={{ color: '#60a5fa' }}>--data-raw</code> — request body</li>
              <li><code style={{ color: '#60a5fa' }}>-u</code> / <code style={{ color: '#60a5fa' }}>--user</code> — basic auth</li>
              <li><code style={{ color: '#60a5fa' }}>--url</code> — explicit URL</li>
              <li>Multi-line commands with <code style={{ color: '#60a5fa' }}>\</code> continuation</li>
            </ul>

            <h3 style={{ fontSize: '1.2rem', fontWeight: 700, color: '#ffffff', marginBottom: '16px', marginTop: '24px' }}>Frequently Asked Questions</h3>

            <div style={{ marginBottom: '16px' }}>
              <h4 style={{ fontSize: '1rem', fontWeight: 600, color: '#60a5fa', marginBottom: '6px' }}>Does it support multi-line cURL commands?</h4>
              <p style={{ color: '#94a3b8', lineHeight: 1.6 }}>Yes, multi-line commands with backslash line continuation are fully supported.</p>
            </div>

            <div style={{ marginBottom: '16px' }}>
              <h4 style={{ fontSize: '1rem', fontWeight: 600, color: '#60a5fa', marginBottom: '6px' }}>Is this tool free to use?</h4>
              <p style={{ color: '#94a3b8', lineHeight: 1.6 }}>Yes, VelnoxLabs cURL to Fetch & Axios Converter is 100% free with no sign-up required.</p>
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
