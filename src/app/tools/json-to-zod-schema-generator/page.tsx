'use client';

import React, { useState, useEffect } from 'react';
import { GlobalContainer } from '@/components/layout';
import { SectionHeading } from '@/components/ui';

function jsonToZodType(value: any, indentLevel: number): string {
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
  if (typeof value === 'object') {
    const keys = Object.keys(value);
    if (keys.length === 0) return 'z.object({})';

    let result = 'z.object({\n';
    keys.forEach((k) => {
      result += `${innerIndent}${k}: ${jsonToZodType(value[k], indentLevel + 1)},\n`;
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

function generateZodSchema(json: any): string {
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
  const [feedback, setFeedback] = useState('');
  const [feedbackSent, setFeedbackSent] = useState(false);

  const handleProcess = (val: string) => {
    setError('');
    if (!val.trim()) {
      setOutput('');
      return;
    }
    try {
      const parsed = JSON.parse(val);
      setOutput(generateZodSchema(parsed));
    } catch (e: any) {
      setError(e.message);
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
        'name': 'VelnoxLabs JSON to Zod Schema Generator',
        'operatingSystem': 'All',
        'applicationCategory': 'DeveloperApplication',
        'offers': { '@type': 'Offer', 'price': '0', 'priceCurrency': 'USD' },
        'description': 'Generate Zod validation schemas from JSON objects instantly with full support for nested objects, arrays, nulls, and unions.'
      },
      {
        '@type': 'FAQPage',
        'mainEntity': [
          {
            '@type': 'Question',
            'name': 'How to generate Zod schema from JSON?',
            'acceptedAnswer': { '@type': 'Answer', 'text': 'Paste your JSON into the input box and the tool instantly generates a TypeScript-ready Zod schema with proper types for nested objects and arrays.' }
          },
          {
            '@type': 'Question',
            'name': 'Is this tool secure?',
            'acceptedAnswer': { '@type': 'Answer', 'text': 'Yes, everything runs client-side in your browser. No data leaves your device.' }
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
            title="JSON to Zod Schema Generator"
            subtitle="Generate Zod validation schemas from JSON objects instantly — nested objects, arrays, and nulls supported."
          />

          {/* ========== TOOL UI ========== */}
          <div style={{ backgroundColor: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '12px', padding: '24px', marginTop: 'var(--space-6)' }}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '20px' }}>
              <div>
                <label style={{ color: '#fff', fontSize: '0.875rem', fontWeight: 600, display: 'block', marginBottom: '8px' }}>JSON Input:</label>
                <textarea
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  rows={12}
                  placeholder="Paste JSON here..."
                  style={{ width: '100%', backgroundColor: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', color: '#fff', padding: '12px', fontFamily: 'monospace', fontSize: '0.85rem', outline: 'none', resize: 'vertical' }}
                />
              </div>
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                  <label style={{ color: '#fff', fontSize: '0.875rem', fontWeight: 600 }}>Zod Schema Output:</label>
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
                  rows={12}
                  placeholder="Zod schema will appear here..."
                  style={{ width: '100%', backgroundColor: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', color: '#34d399', padding: '12px', fontFamily: 'monospace', fontSize: '0.85rem', outline: 'none', resize: 'vertical' }}
                />
              </div>
            </div>

            {error && (
              <div style={{ marginTop: '12px', backgroundColor: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.3)', borderRadius: '8px', padding: '12px' }}>
                <p style={{ color: '#f87171', fontSize: '0.85rem', margin: 0 }}>❌ Invalid JSON: {error}</p>
              </div>
            )}
          </div>

          {/* ========== SEO CONTENT ========== */}
          <div style={{ marginTop: '48px', backgroundColor: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '12px', padding: '32px' }}>
            <h2 style={{ fontSize: '1.5rem', fontWeight: 700, color: '#ffffff', marginBottom: '16px' }}>What is a JSON to Zod Schema Generator?</h2>
            <p style={{ color: '#94a3b8', lineHeight: 1.7, marginBottom: '24px' }}>
              The JSON to Zod Schema Generator creates Zod validation schemas from JSON objects. Zod is a TypeScript-first schema declaration and validation library used for runtime type checking, form validation, and API response validation in modern TypeScript applications.
            </p>

            <h3 style={{ fontSize: '1.2rem', fontWeight: 700, color: '#ffffff', marginBottom: '12px', marginTop: '24px' }}>How to Use This Tool</h3>
            <ul style={{ color: '#94a3b8', lineHeight: 1.9, paddingLeft: '20px', marginBottom: '24px' }}>
              <li>Paste your JSON into the input box.</li>
              <li>The Zod schema is generated instantly with proper types for each field.</li>
              <li>Supports nested objects, arrays, nulls, and mixed-type unions.</li>
              <li>Click <strong style={{ color: '#34d399' }}>Copy</strong> to copy the schema to your clipboard.</li>
            </ul>

            <h3 style={{ fontSize: '1.2rem', fontWeight: 700, color: '#ffffff', marginBottom: '12px', marginTop: '24px' }}>Supported Type Mappings</h3>
            <ul style={{ color: '#94a3b8', lineHeight: 1.9, paddingLeft: '20px', marginBottom: '24px' }}>
              <li><code style={{ color: '#60a5fa' }}>string</code> → <code style={{ color: '#34d399' }}>z.string()</code></li>
              <li><code style={{ color: '#60a5fa' }}>number</code> → <code style={{ color: '#34d399' }}>z.number()</code> (integers → <code style={{ color: '#34d399' }}>z.number().int()</code>)</li>
              <li><code style={{ color: '#60a5fa' }}>boolean</code> → <code style={{ color: '#34d399' }}>z.boolean()</code></li>
              <li><code style={{ color: '#60a5fa' }}>null</code> → <code style={{ color: '#34d399' }}>z.null()</code></li>
              <li><code style={{ color: '#60a5fa' }}>array</code> → <code style={{ color: '#34d399' }}>z.array(...)</code></li>
              <li><code style={{ color: '#60a5fa' }}>object</code> → <code style={{ color: '#34d399' }}>z.object({'{'}...{'}'})</code></li>
            </ul>

            <h3 style={{ fontSize: '1.2rem', fontWeight: 700, color: '#ffffff', marginBottom: '16px', marginTop: '24px' }}>Frequently Asked Questions</h3>

            <div style={{ marginBottom: '16px' }}>
              <h4 style={{ fontSize: '1rem', fontWeight: 600, color: '#60a5fa', marginBottom: '6px' }}>Does it handle nested objects and arrays?</h4>
              <p style={{ color: '#94a3b8', lineHeight: 1.6 }}>Yes, the generator recursively handles deeply nested objects, arrays of primitives, arrays of objects, and mixed-type unions.</p>
            </div>

            <div style={{ marginBottom: '16px' }}>
              <h4 style={{ fontSize: '1rem', fontWeight: 600, color: '#60a5fa', marginBottom: '6px' }}>Is this tool free to use?</h4>
              <p style={{ color: '#94a3b8', lineHeight: 1.6 }}>Yes, VelnoxLabs JSON to Zod Schema Generator is 100% free with no sign-up required.</p>
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
