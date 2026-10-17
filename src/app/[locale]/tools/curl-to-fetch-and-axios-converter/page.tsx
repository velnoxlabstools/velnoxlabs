'use client';

import React, { useState, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { GlobalContainer } from '@/components/layout';
import { SectionHeading } from '@/components/ui';
import { ToolSeoContent } from '@/features/tools/sections/ToolSeoContent';

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
    if (
      tok === '-s' ||
      tok === '--silent' ||
      tok === '-L' ||
      tok === '--location' ||
      tok === '-k' ||
      tok === '--insecure' ||
      tok === '--compressed' ||
      tok === '-v' ||
      tok === '--verbose' ||
      tok === '-i' ||
      tok === '--include' ||
      tok === '-I' ||
      tok === '--head'
    ) {
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
  let bodyObj: Record<string, unknown> | null = null;
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
  const tUI = useTranslations('ToolUI.curlToFetch');
  const [input, setInput] = useState(
    'curl -X POST https://api.velnoxlabs.com/users -H \'Content-Type: application/json\' -d \'{"name":"Rohit","age":25}\''
  );
  const [output, setOutput] = useState('');
  const [error, setError] = useState('');
  const [copied, setCopied] = useState(false);
  const handleProcess = (val: string) => {
    setError('');
    if (!val.trim()) {
      setOutput('');
      return;
    }
    try {
      const parsed = parseCurl(val);
      if (!parsed.url) {
        setError(tUI('errNoUrl'));
        setOutput('');
        return;
      }
      setOutput(generateCode(parsed));
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      setError(msg || tUI('errParseFailed'));
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

  const schemaData = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'SoftwareApplication',
        name: 'VelnoxLabs cURL to Fetch & Axios Converter',
        operatingSystem: 'All',
        applicationCategory: 'DeveloperApplication',
        offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
        description:
          'Translate cURL commands into JavaScript fetch() and Axios code instantly with full support for headers, JSON bodies, and multi-line commands.',
      },
      {
        '@type': 'FAQPage',
        mainEntity: [
          {
            '@type': 'Question',
            name: 'How to convert cURL to JavaScript?',
            acceptedAnswer: {
              '@type': 'Answer',
              text: 'Paste your cURL command and the tool instantly generates equivalent fetch() and Axios code with proper method, headers, and body.',
            },
          },
          {
            '@type': 'Question',
            name: 'Is this converter secure?',
            acceptedAnswer: {
              '@type': 'Answer',
              text: 'Yes, 100% client-side processing. Your cURL commands never leave your browser.',
            },
          },
        ],
      },
    ],
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
            title="cURL to Fetch & Axios Converter"
            subtitle="Translate cURL commands into JavaScript fetch() and Axios code instantly."
            toolSlug="curl-to-fetch-and-axios-converter"
          />

          {/* ========== TOOL UI ========== */}
          <div
            style={{
              backgroundColor: 'var(--bg-card)',
              border: '1px solid var(--border-color)',
              borderRadius: '12px',
              padding: '24px',
              marginTop: 'var(--space-6)',
            }}
          >
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
                gap: '20px',
              }}
            >
              <div>
                <label
                  style={{
                    color: 'var(--text-main)',
                    fontSize: '0.875rem',
                    fontWeight: 600,
                    display: 'block',
                    marginBottom: '8px',
                  }}
                >
                  {tUI('curlCommand')}
                </label>
                <textarea
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  rows={14}
                  placeholder={tUI('curlPlaceholder')}
                  style={{
                    width: '100%',
                    backgroundColor: 'var(--bg-page)',
                    border: '1px solid var(--border-color)',
                    borderRadius: '8px',
                    color: 'var(--text-main)',
                    padding: '12px',
                    fontFamily: 'monospace',
                    fontSize: '0.85rem',
                    outline: 'none',
                    resize: 'vertical',
                  }}
                />
              </div>
              <div>
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    marginBottom: '8px',
                  }}
                >
                  <label
                    style={{ color: 'var(--text-main)', fontSize: '0.875rem', fontWeight: 600 }}
                  >
                    {tUI('jsCode')}
                  </label>
                  <button
                    onClick={handleCopy}
                    disabled={!output}
                    style={{
                      backgroundColor: output
                        ? 'rgba(59, 130, 246, 0.15)'
                        : 'rgba(255,255,255,0.05)',
                      color: output ? '#60a5fa' : '#64748b',
                      border: '1px solid rgba(59, 130, 246, 0.3)',
                      borderRadius: '6px',
                      padding: '4px 12px',
                      fontSize: '0.75rem',
                      fontWeight: 600,
                      cursor: output ? 'pointer' : 'not-allowed',
                    }}
                  >
                    {copied ? tUI('copied') : tUI('copy')}
                  </button>
                </div>
                <textarea
                  value={output}
                  readOnly
                  rows={14}
                  placeholder={tUI('jsPlaceholder')}
                  style={{
                    width: '100%',
                    backgroundColor: 'var(--bg-page)',
                    border: '1px solid var(--border-color)',
                    borderRadius: '8px',
                    color: '#34d399',
                    padding: '12px',
                    fontFamily: 'monospace',
                    fontSize: '0.85rem',
                    outline: 'none',
                    resize: 'vertical',
                  }}
                />
              </div>
            </div>

            {error && (
              <div
                style={{
                  marginTop: '12px',
                  backgroundColor: 'rgba(239, 68, 68, 0.1)',
                  border: '1px solid rgba(239, 68, 68, 0.3)',
                  borderRadius: '8px',
                  padding: '12px',
                }}
              >
                <p style={{ color: '#f87171', fontSize: '0.85rem', margin: 0 }}>❌ {error}</p>
              </div>
            )}
          </div>

          <ToolSeoContent
            toolSlug="curl-to-fetch-and-axios-converter"
            toolName="cURL to Fetch & Axios Converter"
          />
        </div>
      </GlobalContainer>
    </>
  );
}
