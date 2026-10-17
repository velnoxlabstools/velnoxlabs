'use client';

import React, { useState, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { GlobalContainer } from '@/components/layout';
import { SectionHeading } from '@/components/ui';
import { ToolSeoContent } from '@/features/tools/sections/ToolSeoContent';

// ========== CSV → JSON ==========
function parseCSV(csv: string, delimiter: string, hasHeader: boolean) {
  const lines = csv
    .trim()
    .split(/\r?\n/)
    .filter((l) => l.trim());
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

  const jsonArray = dataRows.map((row) => {
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

  let data: unknown;
  try {
    data = JSON.parse(jsonStr);
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    return { error: 'Invalid JSON: ' + msg, result: '' };
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
  const escapeCell = (val: unknown): string => {
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
    return headers.map((key) => escapeCell((item as Record<string, unknown>)[key])).join(delimiter);
  });

  return { error: '', result: [headerRow, ...dataRows].join('\n') };
}

export default function CsvJsonConverterPage() {
  const tUI = useTranslations('ToolUI.csvToJson');
  const [mode, setMode] = useState<'csv2json' | 'json2csv'>('csv2json');
  const [input, setInput] = useState(
    'name,age,city\nJohn,30,New York\nSarah,25,Los Angeles\nMike,35,Chicago'
  );
  const [delimiter, setDelimiter] = useState(',');
  const [hasHeader, setHasHeader] = useState(true);
  const [output, setOutput] = useState('');
  const [error, setError] = useState('');
  const [copied, setCopied] = useState(false);
  // Switch mode → reset input to appropriate example
  const switchMode = (newMode: 'csv2json' | 'json2csv') => {
    setMode(newMode);
    setError('');
    setOutput('');
    if (newMode === 'csv2json') {
      setInput('name,age,city\nJohn,30,New York\nSarah,25,Los Angeles\nMike,35,Chicago');
    } else {
      setInput(
        '[\n  { "name": "Rohit", "age": 25, "city": "Mumbai" },\n  { "name": "Amit", "age": 30, "city": "Delhi" }\n]'
      );
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

  const schemaData = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'SoftwareApplication',
        name: 'VelnoxLabs CSV ↔ JSON Converter',
        operatingSystem: 'All',
        applicationCategory: 'DeveloperApplication',
        offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
        description:
          'Free online CSV to JSON and JSON to CSV converter — bidirectional conversion with custom delimiters, quoted field support, and instant download.',
      },
      {
        '@type': 'FAQPage',
        mainEntity: [
          {
            '@type': 'Question',
            name: 'How do I convert CSV to JSON?',
            acceptedAnswer: {
              '@type': 'Answer',
              text: 'Select CSV → JSON mode, paste your CSV data, and the JSON appears instantly. Supports custom delimiters and quoted fields.',
            },
          },
          {
            '@type': 'Question',
            name: 'How do I convert JSON to CSV?',
            acceptedAnswer: {
              '@type': 'Answer',
              text: 'Select JSON → CSV mode, paste your JSON array of objects, and download the CSV. Nested objects and arrays are automatically stringified.',
            },
          },
          {
            '@type': 'Question',
            name: 'Does it handle quoted CSV fields?',
            acceptedAnswer: {
              '@type': 'Answer',
              text: 'Yes! Both directions properly handle quoted fields, escaped quotes, and commas inside quoted values.',
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
            title="CSV ↔ JSON Converter"
            subtitle="Convert CSV to JSON and JSON to CSV instantly — bidirectional with custom delimiters and quoted field support."
            toolSlug="csv-to-json"
          />

          <div
            style={{
              backgroundColor: 'var(--bg-card)',
              border: '1px solid var(--border-color)',
              borderRadius: '12px',
              padding: '24px',
              marginTop: 'var(--space-6)',
            }}
          >
            {/* Mode Toggle */}
            <div style={{ display: 'flex', gap: '8px', marginBottom: '20px', flexWrap: 'wrap' }}>
              <button
                onClick={() => switchMode('csv2json')}
                style={{
                  backgroundColor:
                    mode === 'csv2json' ? 'rgba(59, 130, 246, 0.25)' : 'var(--bg-page)',
                  color: mode === 'csv2json' ? '#60a5fa' : '#94a3b8',
                  border: '1px solid rgba(59, 130, 246, 0.3)',
                  borderRadius: '8px',
                  padding: '10px 20px',
                  fontSize: '0.9rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                }}
              >
                {tUI('modeCsvToJson')}
              </button>
              <button
                onClick={() => switchMode('json2csv')}
                style={{
                  backgroundColor:
                    mode === 'json2csv' ? 'rgba(59, 130, 246, 0.25)' : 'var(--bg-page)',
                  color: mode === 'json2csv' ? '#60a5fa' : '#94a3b8',
                  border: '1px solid rgba(59, 130, 246, 0.3)',
                  borderRadius: '8px',
                  padding: '10px 20px',
                  fontSize: '0.9rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                }}
              >
                {tUI('modeJsonToCsv')}
              </button>
            </div>

            {/* Options */}
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                gap: '16px',
                marginBottom: '20px',
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
                  {mode === 'csv2json' ? tUI('csvDelimiter') : tUI('csvOutputDelimiter')}
                </label>
                <select
                  value={delimiter}
                  onChange={(e) => setDelimiter(e.target.value)}
                  style={{
                    width: '100%',
                    backgroundColor: 'var(--bg-page)',
                    border: '1px solid var(--border-color)',
                    borderRadius: '8px',
                    color: 'var(--text-main)',
                    padding: '10px',
                    fontSize: '0.9rem',
                    outline: 'none',
                    cursor: 'pointer',
                  }}
                >
                  <option value=",">{tUI('delimiterComma')}</option>
                  <option value=";">{tUI('delimiterSemicolon')}</option>
                  <option value={'\t'}>{tUI('delimiterTab')}</option>
                  <option value="|">{tUI('delimiterPipe')}</option>
                </select>
              </div>
              {mode === 'csv2json' && (
                <div style={{ display: 'flex', alignItems: 'flex-end' }}>
                  <label
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '10px',
                      color: 'var(--text-muted)',
                      fontSize: '0.9rem',
                      cursor: 'pointer',
                    }}
                  >
                    <input
                      type="checkbox"
                      checked={hasHeader}
                      onChange={(e) => setHasHeader(e.target.checked)}
                      style={{
                        width: '18px',
                        height: '18px',
                        cursor: 'pointer',
                        accentColor: '#3b82f6',
                      }}
                    />
                    {tUI('firstRowHeader')}
                  </label>
                </div>
              )}
            </div>

            {/* Input/Output */}
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
                gap: '20px',
                marginBottom: '16px',
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
                  {mode === 'csv2json' ? tUI('csvInput') : tUI('jsonInput')}
                </label>
                <textarea
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  rows={14}
                  placeholder={mode === 'csv2json' ? tUI('csvPlaceholder') : tUI('jsonPlaceholder')}
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
                    {mode === 'csv2json' ? tUI('jsonOutput') : tUI('csvOutput')}
                  </label>
                  <div style={{ display: 'flex', gap: '6px' }}>
                    <button
                      onClick={handleDownload}
                      disabled={!output}
                      style={{
                        backgroundColor: output
                          ? 'rgba(16, 185, 129, 0.15)'
                          : 'rgba(255,255,255,0.05)',
                        color: output ? '#34d399' : '#64748b',
                        border: '1px solid rgba(16, 185, 129, 0.3)',
                        borderRadius: '6px',
                        padding: '4px 10px',
                        fontSize: '0.7rem',
                        fontWeight: 600,
                        cursor: output ? 'pointer' : 'not-allowed',
                      }}
                    >
                      {mode === 'csv2json' ? tUI('downloadJson') : tUI('downloadCsv')}
                    </button>
                    <button
                      onClick={handleCopy}
                      disabled={!output}
                      style={{
                        backgroundColor: copied
                          ? 'rgba(16, 185, 129, 0.3)'
                          : output
                            ? 'rgba(59, 130, 246, 0.15)'
                            : 'rgba(255,255,255,0.05)',
                        color: copied ? '#34d399' : output ? '#60a5fa' : '#64748b',
                        border: '1px solid rgba(59, 130, 246, 0.3)',
                        borderRadius: '6px',
                        padding: '4px 12px',
                        fontSize: '0.7rem',
                        fontWeight: 600,
                        cursor: output ? 'pointer' : 'not-allowed',
                      }}
                    >
                      {copied ? tUI('copied') : tUI('copy')}
                    </button>
                  </div>
                </div>
                <textarea
                  value={output}
                  readOnly
                  rows={14}
                  placeholder={tUI('outputPlaceholder', {
                    type: mode === 'csv2json' ? 'JSON' : 'CSV',
                  })}
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
                  backgroundColor: 'rgba(248, 113, 113, 0.1)',
                  border: '1px solid rgba(248, 113, 113, 0.3)',
                  borderRadius: '8px',
                  padding: '12px',
                  color: '#f87171',
                  fontSize: '0.85rem',
                }}
              >
                ⚠️ {error}
              </div>
            )}
          </div>

          <ToolSeoContent toolSlug="csv-to-json" toolName="CSV to JSON Converter" />
        </div>
      </GlobalContainer>
    </>
  );
}
