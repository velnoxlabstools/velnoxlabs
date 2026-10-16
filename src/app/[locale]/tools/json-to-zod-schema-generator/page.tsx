'use client';

import React, { useState, useEffect } from 'react';
import { GlobalContainer } from '@/components/layout';
import { SectionHeading } from '@/components/ui';
import { ToolSeoContent } from '@/features/tools/sections/ToolSeoContent';

function jsonToZodType(value: unknown, indentLevel: number): string {
  const indent = '  '.repeat(indentLevel);
  const innerIndent = '  '.repeat(indentLevel + 1);

  // null
  if (value === null) return 'z.null()';

  // Array
  if (Array.isArray(value)) {
    if (value.length === 0) return 'z.array(z.unknown())';

    // Check if all items are same type
    const types = value.map((v) => jsonToZodType(v, indentLevel + 1));
    const uniqueTypes = Array.from(new Set(types));

    if (uniqueTypes.length === 1) {
      return `z.array(${uniqueTypes[0]})`;
    }
    // Mixed types → z.union of items
    return `z.array(z.union([${uniqueTypes.join(', ')}]))`;
  }

  // Object
  if (typeof value === 'object' && value !== null) {
    const keys = Object.keys(value);
    if (keys.length === 0) return 'z.object({})';

    let result = 'z.object({\n';
    keys.forEach((k) => {
      result += `${innerIndent}${k}: ${jsonToZodType((value as Record<string, unknown>)[k], indentLevel + 1)},\n`;
    });
    result += `${indent}})`;
    return result;
  }

  // Primitives
  if (typeof value === 'string') return 'z.string()';
  if (typeof value === 'number') return Number.isInteger(value) ? 'z.number().int()' : 'z.number()';
  if (typeof value === 'boolean') return 'z.boolean()';

  return 'z.unknown()';
}

function generateZodSchema(json: Record<string, unknown> | unknown[]): string {
  const type = jsonToZodType(json, 0);
  return `import { z } from 'zod';\n\nconst schema = ${type};\n\nexport type Schema = z.infer<typeof schema>;`;
}

export default function Page() {
  const [input, setInput] = useState(
    '{\n  "name": "VelnoxLabs",\n  "version": 1,\n  "active": true\n}'
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
      const parsed = JSON.parse(val);
      setOutput(generateZodSchema(parsed));
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      setError(msg);
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
        name: 'VelnoxLabs JSON to Zod Schema Generator',
        operatingSystem: 'All',
        applicationCategory: 'DeveloperApplication',
        offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
        description:
          'Generate Zod validation schemas from JSON objects instantly with full support for nested objects, arrays, nulls, and unions.',
      },
      {
        '@type': 'FAQPage',
        mainEntity: [
          {
            '@type': 'Question',
            name: 'How to generate Zod schema from JSON?',
            acceptedAnswer: {
              '@type': 'Answer',
              text: 'Paste your JSON into the input box and the tool instantly generates a TypeScript-ready Zod schema with proper types for nested objects and arrays.',
            },
          },
          {
            '@type': 'Question',
            name: 'Is this tool secure?',
            acceptedAnswer: {
              '@type': 'Answer',
              text: 'Yes, everything runs client-side in your browser. No data leaves your device.',
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
            title="JSON to Zod Schema Generator"
            subtitle="Generate Zod validation schemas from JSON objects instantly — nested objects, arrays, and nulls supported."
          />

          {/* ========== TOOL UI ========== */}
          <div
            style={{
              backgroundColor: 'rgba(255,255,255,0.02)',
              border: '1px solid rgba(255,255,255,0.08)',
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
                    color: '#fff',
                    fontSize: '0.875rem',
                    fontWeight: 600,
                    display: 'block',
                    marginBottom: '8px',
                  }}
                >
                  JSON Input:
                </label>
                <textarea
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  rows={12}
                  placeholder="Paste JSON here..."
                  style={{
                    width: '100%',
                    backgroundColor: 'rgba(0,0,0,0.3)',
                    border: '1px solid rgba(255,255,255,0.1)',
                    borderRadius: '8px',
                    color: '#fff',
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
                  <label style={{ color: '#fff', fontSize: '0.875rem', fontWeight: 600 }}>
                    Zod Schema Output:
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
                    {copied ? 'Copied!' : 'Copy'}
                  </button>
                </div>
                <textarea
                  value={output}
                  readOnly
                  rows={12}
                  placeholder="Zod schema will appear here..."
                  style={{
                    width: '100%',
                    backgroundColor: 'rgba(0,0,0,0.3)',
                    border: '1px solid rgba(255,255,255,0.1)',
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
                  ❌ Invalid JSON: {error}
                </p>
              </div>
            )}
          </div>

          <ToolSeoContent
            toolSlug="json-to-zod-schema-generator"
            toolName="JSON to Zod Schema Generator"
          />
        </div>
      </GlobalContainer>
    </>
  );
}
