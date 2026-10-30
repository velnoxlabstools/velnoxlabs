'use client';

import React, { useState, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { GlobalContainer } from '@/components/layout';
import { SectionHeading } from '@/components/ui';
import { ToolSeoContent } from '@/features/tools/sections/ToolSeoContent';

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
  let bodyObj: Record<string, unknown> | null = null;
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
  const tUI = useTranslations('ToolUI.curlToPython');
  const [curlInput, setCurlInput] = useState(
    `curl -X POST https://api.velnoxlabs.com/v1/analyze -H 'Authorization: Bearer token_abc123' -d '{"status":"active"}'`
  );
  const [pythonOutput, setPythonOutput] = useState('');
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState('');
  const handleConvert = (cmd: string) => {
    setError('');
    if (!cmd.trim()) {
      setPythonOutput('');
      return;
    }
    try {
      const parsed = parseCurl(cmd);
      if (!parsed.url) {
        setError(tUI('errNoUrl'));
        setPythonOutput('');
        return;
      }
      setPythonOutput(generatePython(parsed));
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      setError(msg || tUI('errParseFailed'));
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

  return (
    <>
      <GlobalContainer maxWidth="2xl">
        <div style={{ paddingTop: 'var(--space-8)', paddingBottom: 'var(--space-16)' }}>
          <SectionHeading
            title={tUI('title')}
            subtitle={tUI('subtitle')}
            toolSlug="curl-to-python-requests-converter"
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
                  value={curlInput}
                  onChange={(e) => setCurlInput(e.target.value)}
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
                    {tUI('pythonCode')}
                  </label>
                  <button
                    onClick={handleCopy}
                    disabled={!pythonOutput}
                    style={{
                      backgroundColor: pythonOutput
                        ? 'rgba(59, 130, 246, 0.15)'
                        : 'rgba(255,255,255,0.05)',
                      color: pythonOutput ? '#60a5fa' : '#64748b',
                      border: '1px solid rgba(59, 130, 246, 0.3)',
                      borderRadius: '6px',
                      padding: '4px 12px',
                      fontSize: '0.75rem',
                      fontWeight: 600,
                      cursor: pythonOutput ? 'pointer' : 'not-allowed',
                    }}
                  >
                    {copied ? tUI('copied') : tUI('copyCode')}
                  </button>
                </div>
                <textarea
                  value={pythonOutput}
                  readOnly
                  rows={14}
                  placeholder={tUI('pythonPlaceholder')}
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
            toolSlug="curl-to-python-requests-converter"
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
    </>
  );
}
