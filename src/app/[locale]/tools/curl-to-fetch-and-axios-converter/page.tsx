'use client';

import React, { useState, useMemo, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { GlobalContainer } from '@/components/layout';
import { SectionHeading } from '@/components/ui';
import { ToolSeoContent } from '@/features/tools/sections/ToolSeoContent';
import { Sparkles, Copy, Check, Terminal, Layers } from 'lucide-react';

type OutputTab = 'fetch' | 'axios' | 'python' | 'java' | 'json';

// Quote-aware tokenizer supporting Unix '\' and Windows CMD '^' line continuations
function tokenizeCurl(str: string): string[] {
  const normalized = str
    .replace(/\\[\r\n]+\s*/g, ' ')
    .replace(/\^[\r\n]+\s*/g, ' ')
    .trim();

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
  isJson: boolean;
  parsedBodyObj: unknown;
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

    // Basic Auth
    if (tok === '-u' || tok === '--user') {
      const creds = tokens[i + 1] || '';
      try {
        headers['Authorization'] = 'Basic ' + btoa(creds);
      } catch {
        headers['Authorization'] = 'Basic ' + creds;
      }
      i += 2;
      continue;
    }

    // User-Agent
    if (tok === '-A' || tok === '--user-agent') {
      headers['User-Agent'] = tokens[i + 1] || '';
      i += 2;
      continue;
    }

    // Cookie
    if (tok === '-b' || tok === '--cookie') {
      headers['Cookie'] = tokens[i + 1] || '';
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

    // Form data
    if (tok === '-F' || tok === '--form') {
      const formPart = tokens[i + 1] || '';
      if (body) body += '&' + formPart;
      else body = formPart;
      if (!headers['Content-Type']) {
        headers['Content-Type'] = 'multipart/form-data';
      }
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

    // Unknown single-character flag with value
    if (tok.startsWith('-') && !tok.startsWith('--') && tok.length === 2) {
      i += 2;
      continue;
    }

    if (tok.startsWith('--')) {
      i += 1;
      continue;
    }

    // First non-flag token → URL
    if (!url && /^https?:\/\//i.test(tok)) {
      url = tok;
      i += 1;
      continue;
    }

    i += 1;
  }

  let isJson = false;
  let parsedBodyObj: unknown = null;
  if (body) {
    try {
      parsedBodyObj = JSON.parse(body);
      isJson = true;
    } catch {
      isJson = false;
    }
  }

  return { url, method, headers, body, isJson, parsedBodyObj };
}

function generateFetch(parsed: ParsedCurl): string {
  const { url, method, headers, body, isJson, parsedBodyObj } = parsed;
  const headerEntries = Object.entries(headers);

  let code = `async function makeRequest() {\n`;
  code += `  const response = await fetch("${url}"`;

  const opts: string[] = [];
  if (method !== 'GET') {
    opts.push(`    method: "${method}"`);
  }
  if (headerEntries.length > 0) {
    const lines = headerEntries
      .map(([k, v]) => `      "${k}": "${v.replace(/"/g, '\\"')}"`)
      .join(',\n');
    opts.push(`    headers: {\n${lines}\n    }`);
  }
  if (isJson && parsedBodyObj !== null) {
    const pretty = JSON.stringify(parsedBodyObj, null, 2)
      .split('\n')
      .map((l, idx) => (idx === 0 ? l : '      ' + l))
      .join('\n');
    opts.push(`    body: JSON.stringify(${pretty})`);
  } else if (body) {
    opts.push(`    body: ${JSON.stringify(body)}`);
  }

  if (opts.length > 0) {
    code += `, {\n${opts.join(',\n')}\n  }`;
  }
  code += `);\n\n`;
  code += `  if (!response.ok) {\n`;
  code += `    throw new Error(\`HTTP error! status: \${response.status}\`);\n`;
  code += `  }\n\n`;
  if (isJson || headers['Content-Type']?.includes('json')) {
    code += `  const data = await response.json();\n`;
  } else {
    code += `  const data = await response.text();\n`;
  }
  code += `  console.log(data);\n`;
  code += `  return data;\n`;
  code += `}\n\nmakeRequest();`;
  return code;
}

function generateAxios(parsed: ParsedCurl): string {
  const { url, method, headers, body, isJson, parsedBodyObj } = parsed;
  const headerEntries = Object.entries(headers);

  let code = `import axios from 'axios';\n\n`;
  code += `async function makeRequest() {\n`;
  code += `  try {\n`;
  code += `    const response = await axios({\n`;
  code += `      url: '${url}',\n`;
  code += `      method: '${method.toLowerCase()}'`;

  if (headerEntries.length > 0) {
    const lines = headerEntries
      .map(([k, v]) => `        '${k}': '${v.replace(/'/g, "\\'")}'`)
      .join(',\n');
    code += `,\n      headers: {\n${lines}\n      }`;
  }

  if (isJson && parsedBodyObj !== null) {
    const pretty = JSON.stringify(parsedBodyObj, null, 2)
      .split('\n')
      .map((l, idx) => (idx === 0 ? l : '      ' + l))
      .join('\n');
    code += `,\n      data: ${pretty}`;
  } else if (body) {
    code += `,\n      data: ${JSON.stringify(body)}`;
  }

  code += `\n    });\n\n`;
  code += `    console.log(response.data);\n`;
  code += `    return response.data;\n`;
  code += `  } catch (error) {\n`;
  code += `    console.error('Request failed:', error);\n`;
  code += `  }\n`;
  code += `}\n\nmakeRequest();`;
  return code;
}

function generatePython(parsed: ParsedCurl): string {
  const { url, method, headers, body, isJson, parsedBodyObj } = parsed;
  const headerEntries = Object.entries(headers);

  let code = `import requests\n\n`;
  code += `url = "${url}"\n\n`;

  if (headerEntries.length > 0) {
    code += `headers = {\n`;
    for (const [k, v] of headerEntries) {
      code += `    "${k}": "${v.replace(/"/g, '\\"')}",\n`;
    }
    code += `}\n\n`;
  } else {
    code += `headers = {}\n\n`;
  }

  let dataCall = '';
  if (isJson && parsedBodyObj !== null) {
    code += `payload = ${JSON.stringify(parsedBodyObj, null, 4)}\n\n`;
    dataCall = `, json=payload`;
  } else if (body) {
    code += `payload = ${JSON.stringify(body)}\n\n`;
    dataCall = `, data=payload`;
  }

  const m = method.toLowerCase();
  code += `response = requests.${m}(url, headers=headers${dataCall})\n`;
  code += `print("Status:", response.status_code)\n`;
  if (isJson) {
    code += `print("Response:", response.json())\n`;
  } else {
    code += `print("Response:", response.text)\n`;
  }
  return code;
}

function generateJava(parsed: ParsedCurl): string {
  const { url, method, headers, body } = parsed;
  const headerEntries = Object.entries(headers);

  let code = `import java.net.URI;\n`;
  code += `import java.net.http.HttpClient;\n`;
  code += `import java.net.http.HttpRequest;\n`;
  code += `import java.net.http.HttpResponse;\n\n`;
  code += `public class ApiClient {\n`;
  code += `    public static void main(String[] args) throws Exception {\n`;
  code += `        HttpClient client = HttpClient.newHttpClient();\n\n`;
  code += `        HttpRequest.Builder builder = HttpRequest.newBuilder()\n`;
  code += `            .uri(URI.create("${url}"))\n`;

  for (const [k, v] of headerEntries) {
    code += `            .header("${k}", "${v.replace(/"/g, '\\"')}")\n`;
  }

  if (body) {
    const escaped = body.replace(/\\/g, '\\\\').replace(/"/g, '\\"');
    code += `            .method("${method}", HttpRequest.BodyPublishers.ofString("${escaped}"));\n\n`;
  } else if (method === 'GET') {
    code += `            .GET();\n\n`;
  } else {
    code += `            .method("${method}", HttpRequest.BodyPublishers.noBody());\n\n`;
  }

  code += `        HttpRequest request = builder.build();\n`;
  code += `        HttpResponse<String> response = client.send(request, HttpResponse.BodyHandlers.ofString());\n\n`;
  code += `        System.out.println("Status: " + response.statusCode());\n`;
  code += `        System.out.println("Body: " + response.body());\n`;
  code += `    }\n`;
  code += `}\n`;
  return code;
}

function generateJson(parsed: ParsedCurl): string {
  const { url, method, headers, isJson, parsedBodyObj, body } = parsed;
  const result: Record<string, unknown> = {
    method,
    url,
    headers,
    body: isJson ? parsedBodyObj : body || null,
  };
  return JSON.stringify(result, null, 2);
}

const PRESETS = [
  {
    id: 'postJson',
    label: 'POST JSON + Auth',
    command:
      'curl -X POST https://api.velnoxlabs.com/users \\\n  -H "Content-Type: application/json" \\\n  -H "Authorization: Bearer my_secret_token_123" \\\n  -d \'{"name": "Rohit", "role": "Developer", "active": true}\'',
  },
  {
    id: 'axiosGet',
    label: 'Axios GET + Params',
    command:
      'curl -X GET "https://api.velnoxlabs.com/v1/items?category=tools&limit=25" \\\n  -H "Accept: application/json" \\\n  -H "Authorization: Bearer token_live_891"',
  },
  {
    id: 'getBearer',
    label: 'GET + Query & Token',
    command:
      'curl -X GET "https://api.velnoxlabs.com/products?category=electronics&limit=10" \\\n  -H "Authorization: Bearer token_xyz" \\\n  -H "Accept: application/json"',
  },
  {
    id: 'basicAuth',
    label: 'Basic Auth (-u user:pass)',
    command:
      'curl -u admin:supersecret123 \\\n  https://api.velnoxlabs.com/admin/status \\\n  -H "Accept: application/json"',
  },
  {
    id: 'formUrl',
    label: 'Form URL-Encoded',
    command:
      'curl -X POST https://api.velnoxlabs.com/oauth/token \\\n  -H "Content-Type: application/x-www-form-urlencoded" \\\n  -d "grant_type=client_credentials&client_id=velnox&client_secret=pass123"',
  },
];

export default function CurlConverterPage() {
  const tUI = useTranslations('ToolUI.curlToFetch');
  const [input, setInput] = useState(PRESETS[0].command);
  const [activeTab, setActiveTab] = useState<OutputTab>('fetch');
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState('');

  const parsed = useMemo(() => {
    setError('');
    if (!input.trim()) return null;
    try {
      const res = parseCurl(input);
      if (!res.url) {
        setError(tUI('errNoUrl'));
        return null;
      }
      return res;
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      setError(msg || tUI('errParseFailed'));
      return null;
    }
  }, [input, tUI]);

  const outputCode = useMemo(() => {
    if (!parsed) return '';
    switch (activeTab) {
      case 'fetch':
        return generateFetch(parsed);
      case 'axios':
        return generateAxios(parsed);
      case 'python':
        return generatePython(parsed);
      case 'java':
        return generateJava(parsed);
      case 'json':
        return generateJson(parsed);
      default:
        return '';
    }
  }, [parsed, activeTab]);

  useEffect(() => {
    setCopied(false);
  }, [activeTab, input]);

  const handleCopy = () => {
    if (!outputCode) return;
    navigator.clipboard.writeText(outputCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const getMethodColor = (m: string) => {
    switch (m) {
      case 'GET':
        return '#34d399';
      case 'POST':
        return '#60a5fa';
      case 'PUT':
        return '#fbbf24';
      case 'DELETE':
        return '#f87171';
      default:
        return '#a78bfa';
    }
  };

  return (
    <GlobalContainer maxWidth="2xl">
      <div style={{ paddingTop: 'var(--space-8)', paddingBottom: 'var(--space-16)' }}>
        <SectionHeading
          title={tUI('title')}
          subtitle={tUI('subtitle')}
          toolSlug="curl-to-fetch-and-axios-converter"
        />

        {/* 1-Click Example Presets */}
        <div
          style={{
            display: 'flex',
            flexWrap: 'wrap',
            alignItems: 'center',
            gap: '8px',
            marginTop: 'var(--space-6)',
            marginBottom: '16px',
          }}
        >
          <span
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '4px',
              fontSize: '0.8rem',
              fontWeight: 700,
              color: 'var(--text-muted)',
              marginRight: '4px',
            }}
          >
            <Sparkles size={14} style={{ color: '#8b5cf6' }} />
            {tUI('examplePresets')}:
          </span>
          {PRESETS.map((p) => (
            <button
              key={p.id}
              type="button"
              onClick={() => setInput(p.command)}
              style={{
                backgroundColor: 'rgba(59, 130, 246, 0.1)',
                color: '#60a5fa',
                border: '1px solid rgba(59, 130, 246, 0.3)',
                borderRadius: '20px',
                padding: '5px 12px',
                fontSize: '0.78rem',
                fontWeight: 600,
                cursor: 'pointer',
                transition: 'all 0.15s ease',
              }}
            >
              {p.label}
            </button>
          ))}
        </div>

        {/* Main Work Area */}
        <div
          style={{
            backgroundColor: 'var(--bg-card)',
            border: '1px solid var(--border-color)',
            borderRadius: '14px',
            padding: '24px',
            marginBottom: '20px',
          }}
        >
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
              gap: '20px',
            }}
          >
            {/* Input Side */}
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
                  style={{
                    color: 'var(--text-main)',
                    fontSize: '0.875rem',
                    fontWeight: 600,
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                  }}
                >
                  <Terminal size={15} style={{ color: '#8b5cf6' }} />
                  {tUI('curlCommand')}
                </label>
                <button
                  type="button"
                  onClick={() => setInput('')}
                  style={{
                    fontSize: '0.75rem',
                    color: 'var(--text-muted)',
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                  }}
                >
                  {tUI('clear')}
                </button>
              </div>

              <textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                rows={14}
                placeholder={tUI('curlPlaceholder')}
                style={{
                  width: '100%',
                  backgroundColor: 'var(--bg-page)',
                  border: error ? '1px solid #ef4444' : '1px solid var(--border-color)',
                  borderRadius: '8px',
                  color: 'var(--text-main)',
                  padding: '12px',
                  fontFamily: 'monospace',
                  fontSize: '0.82rem',
                  lineHeight: '1.5',
                  outline: 'none',
                  resize: 'vertical',
                }}
              />
            </div>

            {/* Output Side */}
            <div>
              {/* Language Tabs & Copy Button */}
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  flexWrap: 'wrap',
                  gap: '8px',
                  marginBottom: '8px',
                }}
              >
                <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap' }}>
                  {(
                    [
                      { id: 'fetch', label: 'Fetch' },
                      { id: 'axios', label: 'Axios' },
                      { id: 'python', label: 'Python' },
                      { id: 'java', label: 'Java' },
                      { id: 'json', label: 'JSON' },
                    ] as const
                  ).map((tab) => (
                    <button
                      key={tab.id}
                      type="button"
                      onClick={() => setActiveTab(tab.id)}
                      style={{
                        padding: '5px 10px',
                        borderRadius: '6px',
                        fontSize: '0.75rem',
                        fontWeight: 700,
                        cursor: 'pointer',
                        border:
                          activeTab === tab.id
                            ? '1px solid rgba(139, 92, 246, 0.6)'
                            : '1px solid var(--border-color)',
                        backgroundColor:
                          activeTab === tab.id ? 'rgba(139, 92, 246, 0.2)' : 'var(--bg-page)',
                        color: activeTab === tab.id ? '#a78bfa' : 'var(--text-muted)',
                      }}
                    >
                      {tab.label}
                    </button>
                  ))}
                </div>

                <button
                  type="button"
                  onClick={handleCopy}
                  disabled={!outputCode}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '4px',
                    backgroundColor: copied
                      ? '#10b981'
                      : outputCode
                        ? '#3b82f6'
                        : 'rgba(255,255,255,0.05)',
                    color: outputCode ? '#ffffff' : '#64748b',
                    border: 'none',
                    borderRadius: '6px',
                    padding: '5px 12px',
                    fontSize: '0.75rem',
                    fontWeight: 600,
                    cursor: outputCode ? 'pointer' : 'not-allowed',
                  }}
                >
                  {copied ? <Check size={13} /> : <Copy size={13} />}
                  {copied ? tUI('copied') : tUI('copy')}
                </button>
              </div>

              <textarea
                value={outputCode}
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
                  fontSize: '0.82rem',
                  lineHeight: '1.5',
                  outline: 'none',
                  resize: 'vertical',
                }}
              />
            </div>
          </div>

          {error && (
            <div
              style={{
                marginTop: '14px',
                backgroundColor: 'rgba(239, 68, 68, 0.1)',
                border: '1px solid rgba(239, 68, 68, 0.3)',
                borderRadius: '8px',
                padding: '10px 14px',
                color: '#f87171',
                fontSize: '0.84rem',
              }}
            >
              ⚠️ {error}
            </div>
          )}

          {/* Structured Request Inspector */}
          {parsed && (
            <div
              style={{
                marginTop: '20px',
                paddingTop: '16px',
                borderTop: '1px solid var(--border-color)',
              }}
            >
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  fontSize: '0.82rem',
                  fontWeight: 700,
                  color: 'var(--text-main)',
                  marginBottom: '10px',
                }}
              >
                <Layers size={14} style={{ color: '#60a5fa' }} />
                <span>{tUI('requestInspector')}:</span>
              </div>

              <div
                style={{
                  backgroundColor: 'var(--bg-page)',
                  border: '1px solid var(--border-color)',
                  borderRadius: '8px',
                  padding: '12px 14px',
                  fontSize: '0.8rem',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '8px',
                }}
              >
                <div
                  style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}
                >
                  <span
                    style={{
                      padding: '2px 8px',
                      borderRadius: '4px',
                      fontSize: '0.72rem',
                      fontWeight: 800,
                      backgroundColor: 'rgba(255,255,255,0.08)',
                      color: getMethodColor(parsed.method),
                      border: `1px solid ${getMethodColor(parsed.method)}40`,
                    }}
                  >
                    {parsed.method}
                  </span>
                  <code style={{ color: 'var(--text-main)', wordBreak: 'break-all' }}>
                    {parsed.url}
                  </code>
                </div>

                {Object.keys(parsed.headers).length > 0 && (
                  <div style={{ marginTop: '4px' }}>
                    <span
                      style={{ color: 'var(--text-muted)', fontSize: '0.75rem', fontWeight: 600 }}
                    >
                      {tUI('headersCount', { count: Object.keys(parsed.headers).length })}:
                    </span>
                    <div
                      style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginTop: '4px' }}
                    >
                      {Object.entries(parsed.headers).map(([k, v]) => (
                        <span
                          key={k}
                          style={{
                            fontSize: '0.72rem',
                            fontFamily: 'monospace',
                            backgroundColor: 'var(--bg-card)',
                            border: '1px solid var(--border-color)',
                            borderRadius: '4px',
                            padding: '2px 6px',
                            color: 'var(--text-main)',
                          }}
                        >
                          <span style={{ color: '#60a5fa' }}>{k}</span>: {v}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        <ToolSeoContent
          toolSlug="curl-to-fetch-and-axios-converter"
          toolName={tUI('title')}
          description={tUI('subtitle')}
          customAbout={tUI('aboutText')}
          customFeatures={[tUI('feature1'), tUI('feature2'), tUI('feature3'), tUI('feature4')]}
          customSteps={[
            { title: tUI('step1Title'), body: tUI('step1Body') },
            { title: tUI('step2Title'), body: tUI('step2Body') },
            { title: tUI('step3Title'), body: tUI('step3Body') },
          ]}
          customFaqs={[
            { q: tUI('faq1Q'), a: tUI('faq1A') },
            { q: tUI('faq2Q'), a: tUI('faq2A') },
            { q: tUI('faq3Q'), a: tUI('faq3A') },
            { q: tUI('faq4Q'), a: tUI('faq4A') },
          ]}
        />
      </div>
    </GlobalContainer>
  );
}
