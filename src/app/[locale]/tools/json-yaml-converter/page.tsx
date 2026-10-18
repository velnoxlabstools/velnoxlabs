'use client';

import React, { useState, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { GlobalContainer } from '@/components/layout';
import { SectionHeading } from '@/components/ui';
import { ToolSeoContent } from '@/features/tools/sections/ToolSeoContent';

// ========== JSON to YAML ==========
function jsonToYaml(obj: unknown, indent: string = ''): string {
  let result = '';
  if (Array.isArray(obj)) {
    if (obj.length === 0) return indent + '[]\n';
    obj.forEach((item) => {
      if (typeof item === 'object' && item !== null && !Array.isArray(item)) {
        const keys = Object.keys(item);
        if (keys.length === 0) {
          result += indent + '- {}\n';
          return;
        }
        // Inline first key
        const firstKey = keys[0];
        const firstVal = item[firstKey];
        if (typeof firstVal === 'object' && firstVal !== null) {
          result += indent + '- ' + firstKey + ':\n' + jsonToYaml(firstVal, indent + '    ');
        } else {
          result += indent + '- ' + firstKey + ': ' + formatScalar(firstVal) + '\n';
        }
        // Remaining keys
        for (let i = 1; i < keys.length; i++) {
          const k = keys[i];
          const v = item[k];
          if (typeof v === 'object' && v !== null) {
            result += indent + '  ' + k + ':\n' + jsonToYaml(v, indent + '    ');
          } else {
            result += indent + '  ' + k + ': ' + formatScalar(v) + '\n';
          }
        }
      } else if (Array.isArray(item)) {
        result += indent + '-\n' + jsonToYaml(item, indent + '  ');
      } else {
        result += indent + '- ' + formatScalar(item) + '\n';
      }
    });
  } else if (typeof obj === 'object' && obj !== null) {
    const keys = Object.keys(obj);
    if (keys.length === 0) return indent + '{}\n';
    keys.forEach((key) => {
      const value = obj[key];
      if (typeof value === 'object' && value !== null) {
        if (Array.isArray(value) && value.length === 0) {
          result += indent + key + ': []\n';
        } else if (!Array.isArray(value) && Object.keys(value).length === 0) {
          result += indent + key + ': {}\n';
        } else {
          result += indent + key + ':\n' + jsonToYaml(value, indent + '  ');
        }
      } else {
        result += indent + key + ': ' + formatScalar(value) + '\n';
      }
    });
  }
  return result;
}

function formatScalar(v: unknown): string {
  if (v === null) return 'null';
  if (typeof v === 'string') {
    // Quote if string contains special chars or looks like a number/bool
    if (
      /^[\d.]+$/.test(v) ||
      v === 'true' ||
      v === 'false' ||
      v === 'null' ||
      v.includes(': ') ||
      v.includes('#') ||
      v === ''
    ) {
      return JSON.stringify(v);
    }
    return v;
  }
  return String(v);
}

// ========== YAML to JSON (proper recursive parser) ==========
function yamlToJson(yaml: string): unknown {
  // Prepare lines: skip empty and comments
  const lines: Array<{ indent: number; text: string }> = [];
  for (const raw of yaml.split('\n')) {
    if (!raw.trim() || raw.trim().startsWith('#')) continue;
    const indentMatch = raw.match(/^(\s*)/);
    const indent = indentMatch ? indentMatch[1].length : 0;
    lines.push({ indent, text: raw.trim() });
  }

  let pos = 0;

  function parseScalar(v: string): unknown {
    v = v.trim();
    if (v === '' || v === 'null' || v === '~') return null;
    if (v === 'true') return true;
    if (v === 'false') return false;
    if (v === '[]') return [];
    if (v === '{}') return {};
    if (
      v.length >= 2 &&
      ((v[0] === '"' && v[v.length - 1] === '"') || (v[0] === "'" && v[v.length - 1] === "'"))
    ) {
      return v.slice(1, -1);
    }
    if ((v.startsWith('[') && v.endsWith(']')) || (v.startsWith('{') && v.endsWith('}'))) {
      try {
        return JSON.parse(v);
      } catch {
        /* fall through */
      }
    }
    if (!isNaN(Number(v)) && v !== '') return Number(v);
    return v;
  }

  function parseBlock(parentIndent: number): unknown {
    if (pos >= lines.length) return null;
    const blockIndent = lines[pos].indent;
    if (blockIndent <= parentIndent) return null;

    const isArray = lines[pos].text === '-' || lines[pos].text.startsWith('- ');

    if (isArray) {
      const arr: unknown[] = [];
      while (
        pos < lines.length &&
        lines[pos].indent === blockIndent &&
        (lines[pos].text === '-' || lines[pos].text.startsWith('- '))
      ) {
        const rest = lines[pos].text.slice(1).trim();
        pos++;

        if (rest === '') {
          // Nested block as array item
          arr.push(parseBlock(blockIndent));
        } else {
          // Check if it's "key: value" or "key:"
          const colonMatch = rest.match(/^([^:]+):\s*(.*)$/);
          if (colonMatch) {
            // Object inline in array — splice this line back at indent blockIndent+2
            const keyIndent = blockIndent + 2;
            lines.splice(pos, 0, { indent: keyIndent, text: rest });
            arr.push(parseBlock(blockIndent));
          } else {
            arr.push(parseScalar(rest));
          }
        }
      }
      return arr;
    }

    // Object
    const obj: Record<string, unknown> = {};
    while (pos < lines.length && lines[pos].indent === blockIndent) {
      const line = lines[pos].text;
      const colonIdx = line.indexOf(':');
      if (colonIdx === -1) {
        pos++;
        continue;
      }

      const key = line.slice(0, colonIdx).trim();
      const valStr = line.slice(colonIdx + 1).trim();
      pos++;

      if (valStr === '') {
        const child = parseBlock(blockIndent);
        obj[key] = child === null ? null : child;
      } else {
        obj[key] = parseScalar(valStr);
      }
    }
    return obj;
  }

  if (lines.length === 0) return null;
  return parseBlock(-1);
}

// ========== Component ==========
export default function JsonYamlPage() {
  const tUI = useTranslations('ToolUI.jsonYamlConverter');
  const [input, setInput] = useState(
    '{\n  "name": "VelnoxLabs",\n  "version": "1.0.0",\n  "features": ["tools", "api"]\n}'
  );
  const [output, setOutput] = useState('');
  const [mode, setMode] = useState<'json2yaml' | 'yaml2json'>('json2yaml');
  const [error, setError] = useState('');
  const [copied, setCopied] = useState(false);
  const handleConvert = (val: string, currentMode: 'json2yaml' | 'yaml2json') => {
    setError('');
    if (!val.trim()) {
      setOutput('');
      return;
    }
    try {
      if (currentMode === 'json2yaml') {
        const parsed = JSON.parse(val);
        setOutput(jsonToYaml(parsed).trimEnd());
      } else {
        const parsed = yamlToJson(val);
        setOutput(JSON.stringify(parsed, null, 2));
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      setError(msg);
      setOutput('');
    }
  };

  useEffect(() => {
    handleConvert(input, mode);
  }, [input, mode]);

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
        name: 'VelnoxLabs JSON to YAML Converter',
        operatingSystem: 'All',
        applicationCategory: 'DeveloperApplication',
        offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
        description:
          'Convert between JSON and YAML formats instantly with full nested object and array support.',
      },
      {
        '@type': 'FAQPage',
        mainEntity: [
          {
            '@type': 'Question',
            name: 'How to convert JSON to YAML?',
            acceptedAnswer: {
              '@type': 'Answer',
              text: 'Paste your JSON or YAML content and select the conversion direction. The tool instantly outputs the converted format.',
            },
          },
          {
            '@type': 'Question',
            name: 'Does it support nested structures?',
            acceptedAnswer: {
              '@type': 'Answer',
              text: 'Yes, the converter handles deeply nested objects, arrays, booleans, numbers, and strings while preserving the full structure.',
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
          <SectionHeading title={tUI('title')} subtitle={tUI('subtitle')} />

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
            <div style={{ display: 'flex', gap: '8px', marginBottom: '16px' }}>
              <button
                onClick={() => setMode('json2yaml')}
                style={{
                  backgroundColor:
                    mode === 'json2yaml' ? 'rgba(59, 130, 246, 0.25)' : 'var(--bg-page)',
                  color: mode === 'json2yaml' ? '#60a5fa' : '#94a3b8',
                  border: '1px solid rgba(59, 130, 246, 0.3)',
                  borderRadius: '6px',
                  padding: '8px 20px',
                  fontSize: '0.85rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                }}
              >
                {tUI('jsonToYamlTab')}
              </button>
              <button
                onClick={() => setMode('yaml2json')}
                style={{
                  backgroundColor:
                    mode === 'yaml2json' ? 'rgba(59, 130, 246, 0.25)' : 'var(--bg-page)',
                  color: mode === 'yaml2json' ? '#60a5fa' : '#94a3b8',
                  border: '1px solid rgba(59, 130, 246, 0.3)',
                  borderRadius: '6px',
                  padding: '8px 20px',
                  fontSize: '0.85rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                }}
              >
                {tUI('yamlToJsonTab')}
              </button>
            </div>

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
                  {mode === 'json2yaml' ? tUI('jsonInput') : tUI('yamlInput')}
                </label>
                <textarea
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  rows={12}
                  placeholder={
                    mode === 'json2yaml' ? tUI('jsonPlaceholder') : tUI('yamlPlaceholder')
                  }
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
                    {mode === 'json2yaml' ? tUI('yamlOutput') : tUI('jsonOutput')}
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
                  rows={12}
                  placeholder={tUI('outputPlaceholder')}
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
                <p style={{ color: '#f87171', fontSize: '0.85rem', margin: 0 }}>
                  ❌ {tUI('error', { message: error })}
                </p>
              </div>
            )}
          </div>

          <ToolSeoContent toolSlug="json-yaml-converter" toolName={tUI('title')} />
        </div>
      </GlobalContainer>
    </>
  );
}
