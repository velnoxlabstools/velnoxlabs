'use client';

import React, { useState, useEffect } from 'react';
import { GlobalContainer } from '@/components/layout';
import { SectionHeading } from '@/components/ui';

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

export default function CsvToJsonPage() {
  const [input, setInput] = useState('name,age,city\nJohn,30,New York\nSarah,25,Los Angeles\nMike,35,Chicago');
  const [delimiter, setDelimiter] = useState(',');
  const [hasHeader, setHasHeader] = useState(true);
  const [output, setOutput] = useState('');
  const [error, setError] = useState('');
  const [copied, setCopied] = useState(false);
  const [feedback, setFeedback] = useState('');
  const [feedbackSent, setFeedbackSent] = useState(false);

  useEffect(() => {
    const { error: err, result } = parseCSV(input, delimiter, hasHeader);
    setError(err);
    setOutput(result);
  }, [input, delimiter, hasHeader]);

  const handleCopy = () => {
    if (!output) return;
    navigator.clipboard.writeText(output);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    if (!output) return;
    const blob = new Blob([output], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'converted.json';
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
        'name': 'VelnoxLabs CSV to JSON Converter',
        'operatingSystem': 'All',
        'applicationCategory': 'DeveloperApplication',
        'offers': { '@type': 'Offer', 'price': '0', 'priceCurrency': 'USD' },
        'description': 'Free online CSV to JSON converter — convert CSV data to JSON format instantly with support for custom delimiters, quoted fields, and header detection.'
      },
      {
        '@type': 'FAQPage',
        'mainEntity': [
          {
            '@type': 'Question',
            'name': 'How do I convert CSV to JSON?',
            'acceptedAnswer': { '@type': 'Answer', 'text': 'Paste your CSV data into the input box. The tool automatically converts it to JSON format in real-time. You can then copy or download the result.' }
          },
          {
            '@type': 'Question',
            'name': 'Does it handle quoted CSV fields?',
            'acceptedAnswer': { '@type': 'Answer', 'text': 'Yes! The converter properly handles CSV fields enclosed in double quotes, including escaped quotes and commas inside quoted fields.' }
          },
          {
            '@type': 'Question',
            'name': 'Is this CSV to JSON converter free?',
            'acceptedAnswer': { '@type': 'Answer', 'text': 'Yes, VelnoxLabs CSV to JSON Converter is 100% free with no sign-up required. All conversion happens in your browser.' }
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
            title="CSV to JSON Converter"
            subtitle="Convert CSV data to structured JSON instantly — with support for custom delimiters and quoted fields."
          />

          <div style={{ backgroundColor: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '12px', padding: '24px', marginTop: 'var(--space-6)' }}>
            {/* Options */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px', marginBottom: '20px' }}>
              <div>
                <label style={{ color: '#fff', fontSize: '0.875rem', fontWeight: 600, display: 'block', marginBottom: '8px' }}>Delimiter:</label>
                <select value={delimiter} onChange={(e) => setDelimiter(e.target.value)} style={{ width: '100%', backgroundColor: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', color: '#fff', padding: '10px', fontSize: '0.9rem', outline: 'none', cursor: 'pointer' }}>
                  <option value=",">Comma (,)</option>
                  <option value=";">Semicolon (;)</option>
                  <option value={'\t'}>Tab (\t)</option>
                  <option value="|">Pipe (|)</option>
                </select>
              </div>
              <div style={{ display: 'flex', alignItems: 'flex-end' }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: '10px', color: '#94a3b8', fontSize: '0.9rem', cursor: 'pointer' }}>
                  <input type="checkbox" checked={hasHeader} onChange={(e) => setHasHeader(e.target.checked)} style={{ width: '18px', height: '18px', cursor: 'pointer', accentColor: '#3b82f6' }} />
                  First row is header
                </label>
              </div>
            </div>

            {/* Input/Output */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '20px', marginBottom: '16px' }}>
              <div>
                <label style={{ color: '#fff', fontSize: '0.875rem', fontWeight: 600, display: 'block', marginBottom: '8px' }}>CSV Input:</label>
                <textarea value={input} onChange={(e) => setInput(e.target.value)} rows={14} placeholder="Paste CSV data here..." style={{ width: '100%', backgroundColor: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', color: '#fff', padding: '12px', fontFamily: 'monospace', fontSize: '0.85rem', outline: 'none', resize: 'vertical' }} />
              </div>
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                  <label style={{ color: '#fff', fontSize: '0.875rem', fontWeight: 600 }}>JSON Output:</label>
                  <div style={{ display: 'flex', gap: '6px' }}>
                    <button onClick={handleDownload} style={{ backgroundColor: 'rgba(16, 185, 129, 0.15)', color: '#34d399', border: '1px solid rgba(16, 185, 129, 0.3)', borderRadius: '6px', padding: '4px 10px', fontSize: '0.7rem', fontWeight: 600, cursor: 'pointer' }}>⬇ Download</button>
                    <button onClick={handleCopy} style={{ backgroundColor: copied ? 'rgba(16, 185, 129, 0.3)' : 'rgba(59, 130, 246, 0.15)', color: copied ? '#34d399' : '#60a5fa', border: '1px solid rgba(59, 130, 246, 0.3)', borderRadius: '6px', padding: '4px 12px', fontSize: '0.7rem', fontWeight: 600, cursor: 'pointer' }}>{copied ? '✓ Copied' : 'Copy'}</button>
                  </div>
                </div>
                <textarea value={output} readOnly rows={14} placeholder="JSON will appear here..." style={{ width: '100%', backgroundColor: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', color: '#34d399', padding: '12px', fontFamily: 'monospace', fontSize: '0.85rem', outline: 'none', resize: 'vertical' }} />
              </div>
            </div>

            {error && <div style={{ backgroundColor: 'rgba(248, 113, 113, 0.1)', border: '1px solid rgba(248, 113, 113, 0.3)', borderRadius: '8px', padding: '12px', color: '#f87171', fontSize: '0.85rem' }}>⚠️ {error}</div>}
          </div>

          {/* Visible SEO Content */}
          <div style={{ marginTop: '48px', backgroundColor: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '12px', padding: '32px' }}>
            <h2 style={{ fontSize: '1.5rem', fontWeight: 700, color: '#ffffff', marginBottom: '16px' }}>What is a CSV to JSON Converter?</h2>
            <p style={{ color: '#94a3b8', lineHeight: 1.7, marginBottom: '24px' }}>
              A CSV to JSON Converter is a developer tool that transforms Comma-Separated Values (CSV) data into JavaScript Object Notation (JSON). CSV is a simple tabular format used in Excel, Google Sheets, and databases. JSON is a structured format used in APIs, web apps, and modern databases. This converter handles quoted fields, escaped commas, custom delimiters (semicolon, tab, pipe), and automatic header detection — making it easy to move data between spreadsheets and code.
            </p>

            <h3 style={{ fontSize: '1.2rem', fontWeight: 700, color: '#ffffff', marginBottom: '12px', marginTop: '24px' }}>How to Use This Tool</h3>
            <ul style={{ color: '#94a3b8', lineHeight: 1.9, paddingLeft: '20px', marginBottom: '24px' }}>
              <li>Paste your CSV data into the input box (or type it).</li>
              <li>Select the <strong>delimiter</strong> used in your CSV (comma, semicolon, tab, pipe).</li>
              <li>Toggle <strong>First row is header</strong> if your CSV has a header row.</li>
              <li>The JSON output appears instantly on the right.</li>
              <li>Click <strong>Copy</strong> or <strong>Download</strong> to save the result.</li>
            </ul>

            <h3 style={{ fontSize: '1.2rem', fontWeight: 700, color: '#ffffff', marginBottom: '16px', marginTop: '24px' }}>Frequently Asked Questions</h3>

            <div style={{ marginBottom: '16px' }}>
              <h4 style={{ fontSize: '1rem', fontWeight: 600, color: '#60a5fa', marginBottom: '6px' }}>How do I convert CSV to JSON?</h4>
              <p style={{ color: '#94a3b8', lineHeight: 1.6 }}>Paste your CSV data into the input box. The tool automatically converts it to JSON format in real-time. Then click Copy or Download to save.</p>
            </div>

            <div style={{ marginBottom: '16px' }}>
              <h4 style={{ fontSize: '1rem', fontWeight: 600, color: '#60a5fa', marginBottom: '6px' }}>Does it handle quoted CSV fields?</h4>
              <p style={{ color: '#94a3b8', lineHeight: 1.6 }}>Yes! The converter properly handles CSV fields enclosed in double quotes, including escaped quotes (<code style={{ color: '#34d399' }}>""</code>) and commas inside quoted fields.</p>
            </div>

            <div style={{ marginBottom: '16px' }}>
              <h4 style={{ fontSize: '1rem', fontWeight: 600, color: '#60a5fa', marginBottom: '6px' }}>What if my CSV has no headers?</h4>
              <p style={{ color: '#94a3b8', lineHeight: 1.6 }}>Uncheck <strong>First row is header</strong>. The tool will automatically name columns as <code style={{ color: '#34d399' }}>column_1</code>, <code style={{ color: '#34d399' }}>column_2</code>, etc.</p>
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