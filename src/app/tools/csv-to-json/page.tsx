'use client';

import React, { useState, useEffect } from 'react';
import { GlobalContainer } from '@/components/layout';
import { SectionHeading } from '@/components/ui';

// ========== CSV → JSON ==========
function parseCSV(csv: string, delimiter: string, hasHeader: boolean) {
  const lines = csv.trim().split(/\r?\n/).filter(l => l.trim());
  if (lines.length === 0) return { error: 'Empty input', result: '' };

  const parseLine = (line: string) => {
    const result: string[] = [];
    let current = '';
    let inQuotes = false;
    for (let i = 0; i < line.length; i++) {
      const char = line[i];
      if (char === '"') {
        if (inQuotes && line[i + 1] === '"') {
          current += '"';
          i++;
        } else {
          inQuotes = !inQuotes;
        }
      } else if (char === delimiter && !inQuotes) {
        result.push(current);
        current = '';
      } else {
        current += char;
      }
    }
    result.push(current);
    return result;
  };

  const rows = lines.map(parseLine);
  let headers: string[] = [];
  let dataRows = rows;

  if (hasHeader) {
    headers = rows[0].map((h, i) => h.trim() || `column_${i + 1}`);
    dataRows = rows.slice(1);
  } else {
    headers = rows[0].map((_, i) => `column_${i + 1}`);
  }

  const jsonArray = dataRows.map(row => {
    const obj: Record<string, string> = {};
    headers.forEach((header, i) => {
      obj[header] = row[i] !== undefined ? row[i] : '';
    });
    return obj;
  });

  return { error: '', result: JSON.stringify(jsonArray, null, 2) };
}

// ========== JSON → CSV ==========
function convertJSONToCSV(jsonStr: string, delimiter: string) {
  if (!jsonStr.trim()) return { error: '', result: '' };

  let data: any;
  try {
    data = JSON.parse(jsonStr);
  } catch (e: any) {
    return { error: 'Invalid JSON: ' + e.message, result: '' };
  }

  const arr = Array.isArray(data) ? data : [data];
  if (arr.length === 0) return { error: 'JSON array is empty', result: '' };

  // Collect all unique keys
  const allKeys = new Set<string>();
  arr.forEach((item) => {
    if (typeof item === 'object' && item !== null && !Array.isArray(item)) {
      Object.keys(item).forEach((k) => allKeys.add(k));
    }
  });

  const headers = Array.from(allKeys);
  if (headers.length === 0) {
    return { error: 'No object keys found in JSON. Expected array of objects.', result: '' };
  }

  // Escape a cell value for CSV
  const escapeCell = (val: any): string => {
    if (val === null || val === undefined) return '';
    let str: string;
    if (typeof val === 'object') {
      str = JSON.stringify(val);
    } else {
      str = String(val);
    }
    // If contains delimiter, quotes, or newline → wrap in quotes and double the quotes
    if (str.includes(delimiter) || str.includes('"') || str.includes('\n') || str.includes('\r')) {
      return `"${str.replace(/"/g, '""')}"`;
    }
    return str;
  };

  const headerRow = headers.map(escapeCell).join(delimiter);
  const dataRows = arr.map((item) => {
    if (typeof item !== 'object' || item === null) {
      return escapeCell(item);
    }
    return headers.map((key) => escapeCell(item[key])).join(delimiter);
  });

  return { error: '', result: [headerRow, ...dataRows].join('\n') };
}

export default function CsvJsonConverterPage() {
  const [mode, setMode] = useState<'csv2json' | 'json2csv'>('csv2json');
  const [input, setInput] = useState('name,age,city\nJohn,30,New York\nSarah,25,Los Angeles\nMike,35,Chicago');
  const [delimiter, setDelimiter] = useState(',');
  const [hasHeader, setHasHeader] = useState(true);
  const [output, setOutput] = useState('');
  const [error, setError] = useState('');
  const [copied, setCopied] = useState(false);
  const [feedback, setFeedback] = useState('');
  const [feedbackSent, setFeedbackSent] = useState(false);

  // Switch mode → reset input to appropriate example
  const switchMode = (newMode: 'csv2json' | 'json2csv') => {
    setMode(newMode);
    setError('');
    setOutput('');
    if (newMode === 'csv2json') {
      setInput('name,age,city\nJohn,30,New York\nSarah,25,Los Angeles\nMike,35,Chicago');
    } else {
      setInput('[\n  { "name": "Rohit", "age": 25, "city": "Mumbai" },\n  { "name": "Amit", "age": 30, "city": "Delhi" }\n]');
    }
  };

  useEffect(() => {
    if (mode === 'csv2json') {
      const { error: err, result } = parseCSV(input, delimiter, hasHeader);
      setError(err);
      setOutput(result);
    } else {
      const { error: err, result } = convertJSONToCSV(input, delimiter);
      setError(err);
      setOutput(result);
    }
  }, [input, delimiter, hasHeader, mode]);

  const handleCopy = () => {
    if (!output) return;
    navigator.clipboard.writeText(output);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    if (!output) return;
    const isJson = mode === 'csv2json';
    const mimeType = isJson ? 'application/json' : 'text/csv';
    const fileName = isJson ? 'converted.json' : 'converted.csv';
    const blob = new Blob([output], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = fileName;
    link.click();
    URL.revokeObjectURL(url);
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
        'name': 'VelnoxLabs CSV ↔ JSON Converter',
        'operatingSystem': 'All',
        'applicationCategory': 'DeveloperApplication',
        'offers': { '@type': 'Offer', 'price': '0', 'priceCurrency': 'USD' },
        'description': 'Free online CSV to JSON and JSON to CSV converter — bidirectional conversion with custom delimiters, quoted field support, and instant download.'
      },
      {
        '@type': 'FAQPage',
        'mainEntity': [
          {
            '@type': 'Question',
            'name': 'How do I convert CSV to JSON?',
            'acceptedAnswer': { '@type': 'Answer', 'text': 'Select CSV → JSON mode, paste your CSV data, and the JSON appears instantly. Supports custom delimiters and quoted fields.' }
          },
          {
            '@type': 'Question',
            'name': 'How do I convert JSON to CSV?',
            'acceptedAnswer': { '@type': 'Answer', 'text': 'Select JSON → CSV mode, paste your JSON array of objects, and download the CSV. Nested objects and arrays are automatically stringified.' }
          },
          {
            '@type': 'Question',
            'name': 'Does it handle quoted CSV fields?',
            'acceptedAnswer': { '@type': 'Answer', 'text': 'Yes! Both directions properly handle quoted fields, escaped quotes, and commas inside quoted values.' }
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
            title="CSV ↔ JSON Converter"
            subtitle="Convert CSV to JSON and JSON to CSV instantly — bidirectional with custom delimiters and quoted field support."
          />

          <div style={{ backgroundColor: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '12px', padding: '24px', marginTop: 'var(--space-6)' }}>
            {/* Mode Toggle */}
            <div style={{ display: 'flex', gap: '8px', marginBottom: '20px', flexWrap: 'wrap' }}>
              <button
                onClick={() => switchMode('csv2json')}
                style={{
                  backgroundColor: mode === 'csv2json' ? 'rgba(59, 130, 246, 0.25)' : 'rgba(0,0,0,0.3)',
                  color: mode === 'csv2json' ? '#60a5fa' : '#94a3b8',
                  border: '1px solid rgba(59, 130, 246, 0.3)',
                  borderRadius: '8px',
                  padding: '10px 20px',
                  fontSize: '0.9rem',
                  fontWeight: 600,
                  cursor: 'pointer'
                }}
              >
                📄 CSV → JSON
              </button>
              <button
                onClick={() => switchMode('json2csv')}
                style={{
                  backgroundColor: mode === 'json2csv' ? 'rgba(59, 130, 246, 0.25)' : 'rgba(0,0,0,0.3)',
                  color: mode === 'json2csv' ? '#60a5fa' : '#94a3b8',
                  border: '1px solid rgba(59, 130, 246, 0.3)',
                  borderRadius: '8px',
                  padding: '10px 20px',
                  fontSize: '0.9rem',
                  fontWeight: 600,
                  cursor: 'pointer'
                }}
              >
                📊 JSON → CSV
              </button>
            </div>

            {/* Options */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px', marginBottom: '20px' }}>
              <div>
                <label style={{ color: '#fff', fontSize: '0.875rem', fontWeight: 600, display: 'block', marginBottom: '8px' }}>
                  {mode === 'csv2json' ? 'CSV Delimiter:' : 'CSV Output Delimiter:'}
                </label>
                <select value={delimiter} onChange={(e) => setDelimiter(e.target.value)} style={{ width: '100%', backgroundColor: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', color: '#fff', padding: '10px', fontSize: '0.9rem', outline: 'none', cursor: 'pointer' }}>
                  <option value=",">Comma (,)</option>
                  <option value=";">Semicolon (;)</option>
                  <option value={'\t'}>Tab (\t)</option>
                  <option value="|">Pipe (|)</option>
                </select>
              </div>
              {mode === 'csv2json' && (
                <div style={{ display: 'flex', alignItems: 'flex-end' }}>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '10px', color: '#94a3b8', fontSize: '0.9rem', cursor: 'pointer' }}>
                    <input type="checkbox" checked={hasHeader} onChange={(e) => setHasHeader(e.target.checked)} style={{ width: '18px', height: '18px', cursor: 'pointer', accentColor: '#3b82f6' }} />
                    First row is header
                  </label>
                </div>
              )}
            </div>

            {/* Input/Output */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '20px', marginBottom: '16px' }}>
              <div>
                <label style={{ color: '#fff', fontSize: '0.875rem', fontWeight: 600, display: 'block', marginBottom: '8px' }}>
                  {mode === 'csv2json' ? 'CSV Input:' : 'JSON Input:'}
                </label>
                <textarea
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  rows={14}
                  placeholder={mode === 'csv2json' ? 'Paste CSV data here...' : 'Paste JSON array here...'}
                  style={{ width: '100%', backgroundColor: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', color: '#fff', padding: '12px', fontFamily: 'monospace', fontSize: '0.85rem', outline: 'none', resize: 'vertical' }}
                />
              </div>
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                  <label style={{ color: '#fff', fontSize: '0.875rem', fontWeight: 600 }}>
                    {mode === 'csv2json' ? 'JSON Output:' : 'CSV Output:'}
                  </label>
                  <div style={{ display: 'flex', gap: '6px' }}>
                    <button
                      onClick={handleDownload}
                      disabled={!output}
                      style={{ backgroundColor: output ? 'rgba(16, 185, 129, 0.15)' : 'rgba(255,255,255,0.05)', color: output ? '#34d399' : '#64748b', border: '1px solid rgba(16, 185, 129, 0.3)', borderRadius: '6px', padding: '4px 10px', fontSize: '0.7rem', fontWeight: 600, cursor: output ? 'pointer' : 'not-allowed' }}
                    >
                      ⬇ Download {mode === 'csv2json' ? 'JSON' : 'CSV'}
                    </button>
                    <button
                      onClick={handleCopy}
                      disabled={!output}
                      style={{ backgroundColor: copied ? 'rgba(16, 185, 129, 0.3)' : output ? 'rgba(59, 130, 246, 0.15)' : 'rgba(255,255,255,0.05)', color: copied ? '#34d399' : output ? '#60a5fa' : '#64748b', border: '1px solid rgba(59, 130, 246, 0.3)', borderRadius: '6px', padding: '4px 12px', fontSize: '0.7rem', fontWeight: 600, cursor: output ? 'pointer' : 'not-allowed' }}
                    >
                      {copied ? '✓ Copied' : 'Copy'}
                    </button>
                  </div>
                </div>
                <textarea
                  value={output}
                  readOnly
                  rows={14}
                  placeholder={`${mode === 'csv2json' ? 'JSON' : 'CSV'} will appear here...`}
                  style={{ width: '100%', backgroundColor: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', color: '#34d399', padding: '12px', fontFamily: 'monospace', fontSize: '0.85rem', outline: 'none', resize: 'vertical' }}
                />
              </div>
            </div>

            {error && <div style={{ backgroundColor: 'rgba(248, 113, 113, 0.1)', border: '1px solid rgba(248, 113, 113, 0.3)', borderRadius: '8px', padding: '12px', color: '#f87171', fontSize: '0.85rem' }}>⚠️ {error}</div>}
          </div>

          {/* Visible SEO Content */}
          <div style={{ marginTop: '48px', backgroundColor: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '12px', padding: '32px' }}>
            <h2 style={{ fontSize: '1.5rem', fontWeight: 700, color: '#ffffff', marginBottom: '16px' }}>What is a CSV ↔ JSON Converter?</h2>
            <p style={{ color: '#94a3b8', lineHeight: 1.7, marginBottom: '24px' }}>
              A CSV ↔ JSON Converter is a bidirectional developer tool that transforms data between two popular formats: <strong style={{ color: '#60a5fa' }}>CSV</strong> (Comma-Separated Values) and <strong style={{ color: '#60a5fa' }}>JSON</strong> (JavaScript Object Notation). CSV is a simple tabular format used in Excel, Google Sheets, and databases. JSON is a structured format used in APIs, web apps, and modern databases. This converter handles quoted fields, escaped commas, custom delimiters (semicolon, tab, pipe), and automatic header detection — making it easy to move data between spreadsheets and code.
            </p>

            <h3 style={{ fontSize: '1.2rem', fontWeight: 700, color: '#ffffff', marginBottom: '12px', marginTop: '24px' }}>How to Use This Tool</h3>
            <ul style={{ color: '#94a3b8', lineHeight: 1.9, paddingLeft: '20px', marginBottom: '24px' }}>
              <li>Select the direction: <strong style={{ color: '#34d399' }}>CSV → JSON</strong> or <strong style={{ color: '#34d399' }}>JSON → CSV</strong>.</li>
              <li>Paste your data into the input box.</li>
              <li>Choose your delimiter (comma, semicolon, tab, pipe).</li>
              <li>Toggle <strong>First row is header</strong> (only for CSV → JSON).</li>
              <li>Click <strong>Copy</strong> or <strong>Download</strong> to save the result.</li>
            </ul>

            <h3 style={{ fontSize: '1.2rem', fontWeight: 700, color: '#ffffff', marginBottom: '16px', marginTop: '24px' }}>Frequently Asked Questions</h3>

            <div style={{ marginBottom: '16px' }}>
              <h4 style={{ fontSize: '1rem', fontWeight: 600, color: '#60a5fa', marginBottom: '6px' }}>How do I convert CSV to JSON?</h4>
              <p style={{ color: '#94a3b8', lineHeight: 1.6 }}>Select CSV → JSON mode, paste your CSV data, and the JSON appears instantly. Supports custom delimiters and quoted fields.</p>
            </div>

            <div style={{ marginBottom: '16px' }}>
              <h4 style={{ fontSize: '1rem', fontWeight: 600, color: '#60a5fa', marginBottom: '6px' }}>How do I convert JSON to CSV?</h4>
              <p style={{ color: '#94a3b8', lineHeight: 1.6 }}>Select JSON → CSV mode, paste your JSON array of objects, and download the CSV. Nested objects and arrays are automatically stringified.</p>
            </div>

            <div style={{ marginBottom: '16px' }}>
              <h4 style={{ fontSize: '1rem', fontWeight: 600, color: '#60a5fa', marginBottom: '6px' }}>Does it handle quoted CSV fields?</h4>
              <p style={{ color: '#94a3b8', lineHeight: 1.6 }}>Yes! Both directions properly handle quoted fields, escaped quotes (<code style={{ color: '#34d399' }}>""</code>), and delimiters inside quoted values.</p>
            </div>

            <div style={{ marginBottom: '16px' }}>
              <h4 style={{ fontSize: '1rem', fontWeight: 600, color: '#60a5fa', marginBottom: '6px' }}>Is my data secure?</h4>
              <p style={{ color: '#94a3b8', lineHeight: 1.6 }}>Absolutely. All conversion happens entirely in your browser using client-side JavaScript. Your data is never sent to any server.</p>
            </div>
          </div>

          {/* Feedback Form */}
          <div className="bg-slate-900/40 border border-slate-800 p-8 rounded-2xl mt-12">
            <h3 className="text-xl font-bold text-white mb-2">Got Feedback or Feature Requests?</h3>
            <p className="text-slate-400 mb-6 text-sm">Help us enhance VelnoxLabs developer utility standards. Share your feedback below!</p>
            <form onSubmit={handleFeedbackSubmit} className="space-y-4">
              <textarea rows={4} value={feedback} onChange={(e) => setFeedback(e.target.value)} placeholder="Write your suggestions or feature requests here..." className="w-full bg-slate-950 border border-slate-800 rounded-xl p-4 text-slate-200 focus:outline-none focus:border-slate-600 text-sm resize-none"></textarea>
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