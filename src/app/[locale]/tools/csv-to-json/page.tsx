'use client';

import React, { useState, useMemo, useCallback, useRef } from 'react';
import { useTranslations } from 'next-intl';
import { GlobalContainer } from '@/components/layout';
import { SectionHeading } from '@/components/ui';
import { ToolSeoContent } from '@/features/tools/sections/ToolSeoContent';
import {
  UploadCloud,
  FileText,
  Download,
  Copy,
  Check,
  ArrowRightLeft,
  Trash2,
  FileCode,
  Braces,
  Layers,
  Table,
} from 'lucide-react';

type Mode = 'csv2json' | 'json2csv';
type DelimiterType = 'auto' | ',' | ';' | '\t' | '|';
type JsonStructure = 'objects' | 'arrays_2d' | 'keyed' | 'columnar' | 'ndjson';

function autoDetectDelimiter(text: string): string {
  const sample = text.slice(0, 5000).split(/\r?\n/).slice(0, 5).join('\n');
  const counts: Record<string, number> = { ',': 0, ';': 0, '\t': 0, '|': 0 };

  for (let i = 0; i < sample.length; i++) {
    const char = sample[i];
    if (counts[char] !== undefined) {
      counts[char]++;
    }
  }

  let best = ',';
  let max = -1;
  for (const [delim, count] of Object.entries(counts)) {
    if (count > max) {
      max = count;
      best = delim;
    }
  }
  return max > 0 ? best : ',';
}

function parseCSVTokens(text: string, delimiter: string): string[][] {
  const lines = text.trim().split(/\r?\n/);
  const rows: string[][] = [];

  for (const line of lines) {
    if (!line.trim()) continue;
    const row: string[] = [];
    let cur = '';
    let inQuotes = false;

    for (let i = 0; i < line.length; i++) {
      const char = line[i];
      if (char === '"') {
        if (inQuotes && line[i + 1] === '"') {
          cur += '"';
          i++;
        } else {
          inQuotes = !inQuotes;
        }
      } else if (char === delimiter && !inQuotes) {
        row.push(cur.trim());
        cur = '';
      } else {
        cur += char;
      }
    }
    row.push(cur.trim());
    rows.push(row);
  }

  return rows;
}

function castSmartType(val: string): unknown {
  const trimmed = val.trim();
  if (trimmed === '') return '';
  if (trimmed.toLowerCase() === 'null') return null;
  if (trimmed.toLowerCase() === 'true') return true;
  if (trimmed.toLowerCase() === 'false') return false;

  // Numeric check (ensure it is not a phone number starting with + or 0 unless it's just '0')
  if (/^-?\d+$/.test(trimmed)) {
    const num = Number(trimmed);
    if (!Number.isNaN(num) && Number.isSafeInteger(num)) {
      return num;
    }
  }
  if (/^-?\d*\.\d+$/.test(trimmed)) {
    const num = Number(trimmed);
    if (!Number.isNaN(num)) {
      return num;
    }
  }

  // Nested JSON check
  if (
    (trimmed.startsWith('{') && trimmed.endsWith('}')) ||
    (trimmed.startsWith('[') && trimmed.endsWith(']'))
  ) {
    try {
      return JSON.parse(trimmed);
    } catch {
      // fallback to string
    }
  }

  return val;
}

function setNestedProperty(obj: Record<string, unknown>, path: string, value: unknown) {
  const parts = path.split('.');
  let cur: Record<string, unknown> = obj;
  for (let i = 0; i < parts.length - 1; i++) {
    const p = parts[i];
    if (!cur[p] || typeof cur[p] !== 'object' || Array.isArray(cur[p])) {
      cur[p] = {};
    }
    cur = cur[p] as Record<string, unknown>;
  }
  cur[parts[parts.length - 1]] = value;
}

export default function CsvJsonConverterPage() {
  const tUI = useTranslations('ToolUI.csvToJson');

  const [mode, setMode] = useState<Mode>('csv2json');
  const [input, setInput] = useState<string>(
    'id,product.name,category,price,in_stock,rating\n101,Wireless Headphones,Electronics,79.99,true,4.8\n102,Ergonomic Chair,Office Furniture,249.50,false,4.6\n103,Organic Green Tea,Groceries,14.00,true,4.9'
  );
  const [delimiterSelection, setDelimiterSelection] = useState<DelimiterType>('auto');
  const [jsonStructure, setJsonStructure] = useState<JsonStructure>('objects');
  const [hasHeader, setHasHeader] = useState<boolean>(true);
  const [smartTypes, setSmartTypes] = useState<boolean>(true);
  const [nestedObjects, setNestedObjects] = useState<boolean>(true);
  const [minifyJson, setMinifyJson] = useState<boolean>(false);
  const [copied, setCopied] = useState<boolean>(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Active Delimiter Calculation
  const activeDelimiter = useMemo(() => {
    if (delimiterSelection === 'auto') {
      return autoDetectDelimiter(input);
    }
    return delimiterSelection;
  }, [delimiterSelection, input]);

  // Conversion Logic
  const { output, error, stats } = useMemo(() => {
    if (!input.trim()) {
      return { output: '', error: '', stats: { rows: 0, cols: 0, inSize: '0 B', outSize: '0 B' } };
    }

    const inBytes = new Blob([input]).size;
    const formatBytes = (b: number) => {
      if (b < 1024) return `${b} B`;
      if (b < 1024 * 1024) return `${(b / 1024).toFixed(1)} KB`;
      return `${(b / (1024 * 1024)).toFixed(2)} MB`;
    };

    if (mode === 'csv2json') {
      try {
        const rows = parseCSVTokens(input, activeDelimiter);
        if (rows.length === 0) {
          return {
            output: '',
            error: 'CSV data is empty',
            stats: { rows: 0, cols: 0, inSize: '0 B', outSize: '0 B' },
          };
        }

        let headers: string[] = [];
        let dataRows = rows;

        if (hasHeader) {
          headers = rows[0].map((h, i) => (h ? h.trim() : `column_${i + 1}`));
          dataRows = rows.slice(1);
        } else {
          headers = rows[0].map((_, i) => `column_${i + 1}`);
        }

        const colsCount = headers.length;
        const rowsCount = dataRows.length;

        let resultData: unknown = null;

        if (jsonStructure === 'objects') {
          resultData = dataRows.map((row) => {
            const obj: Record<string, unknown> = {};
            headers.forEach((header, i) => {
              const rawVal = row[i] !== undefined ? row[i] : '';
              const finalVal = smartTypes ? castSmartType(rawVal) : rawVal;

              if (nestedObjects && header.includes('.')) {
                setNestedProperty(obj, header, finalVal);
              } else {
                obj[header] = finalVal;
              }
            });
            return obj;
          });
        } else if (jsonStructure === 'arrays_2d') {
          const table: unknown[][] = [];
          if (hasHeader) {
            table.push(headers);
          }
          dataRows.forEach((row) => {
            table.push(row.map((val) => (smartTypes ? castSmartType(val) : val)));
          });
          resultData = table;
        } else if (jsonStructure === 'keyed') {
          const keyedObj: Record<string, unknown> = {};
          dataRows.forEach((row, idx) => {
            const keyVal = row[0] ? String(row[0]).trim() : `row_${idx + 1}`;
            const obj: Record<string, unknown> = {};
            headers.forEach((header, i) => {
              const rawVal = row[i] !== undefined ? row[i] : '';
              const finalVal = smartTypes ? castSmartType(rawVal) : rawVal;
              if (nestedObjects && header.includes('.')) {
                setNestedProperty(obj, header, finalVal);
              } else {
                obj[header] = finalVal;
              }
            });
            keyedObj[keyVal] = obj;
          });
          resultData = keyedObj;
        } else if (jsonStructure === 'columnar') {
          const colData: Record<string, unknown[]> = {};
          headers.forEach((h) => {
            colData[h] = [];
          });
          dataRows.forEach((row) => {
            headers.forEach((header, i) => {
              const rawVal = row[i] !== undefined ? row[i] : '';
              colData[header].push(smartTypes ? castSmartType(rawVal) : rawVal);
            });
          });
          resultData = colData;
        } else if (jsonStructure === 'ndjson') {
          const ndLines = dataRows.map((row) => {
            const obj: Record<string, unknown> = {};
            headers.forEach((header, i) => {
              const rawVal = row[i] !== undefined ? row[i] : '';
              const finalVal = smartTypes ? castSmartType(rawVal) : rawVal;
              if (nestedObjects && header.includes('.')) {
                setNestedProperty(obj, header, finalVal);
              } else {
                obj[header] = finalVal;
              }
            });
            return JSON.stringify(obj);
          });
          const ndResult = ndLines.join('\n');
          const outBytes = new Blob([ndResult]).size;
          return {
            output: ndResult,
            error: '',
            stats: {
              rows: rowsCount,
              cols: colsCount,
              inSize: formatBytes(inBytes),
              outSize: formatBytes(outBytes),
            },
          };
        }

        const outStr = minifyJson
          ? JSON.stringify(resultData)
          : JSON.stringify(resultData, null, 2);
        const outBytes = new Blob([outStr]).size;

        return {
          output: outStr,
          error: '',
          stats: {
            rows: rowsCount,
            cols: colsCount,
            inSize: formatBytes(inBytes),
            outSize: formatBytes(outBytes),
          },
        };
      } catch (err: unknown) {
        return {
          output: '',
          error: err instanceof Error ? err.message : 'Error parsing CSV',
          stats: { rows: 0, cols: 0, inSize: formatBytes(inBytes), outSize: '0 B' },
        };
      }
    } else {
      // JSON to CSV
      try {
        const parsed = JSON.parse(input);
        let items: Record<string, unknown>[] = [];

        if (Array.isArray(parsed)) {
          if (parsed.length > 0 && Array.isArray(parsed[0])) {
            // 2D Array format
            const csvRows = (parsed as unknown[][]).map((row) =>
              row
                .map((cell) => {
                  const s = cell === null || cell === undefined ? '' : String(cell);
                  return s.includes(activeDelimiter) || s.includes('"') || s.includes('\n')
                    ? `"${s.replace(/"/g, '""')}"`
                    : s;
                })
                .join(activeDelimiter)
            );
            const csvResult = csvRows.join('\n');
            const outBytes = new Blob([csvResult]).size;
            return {
              output: csvResult,
              error: '',
              stats: {
                rows: parsed.length,
                cols: (parsed[0] as unknown[]).length,
                inSize: formatBytes(inBytes),
                outSize: formatBytes(outBytes),
              },
            };
          }
          items = parsed as Record<string, unknown>[];
        } else if (typeof parsed === 'object' && parsed !== null) {
          items = Object.values(parsed) as Record<string, unknown>[];
        }

        if (!items || items.length === 0) {
          return {
            output: '',
            error: 'JSON does not contain an array of objects',
            stats: { rows: 0, cols: 0, inSize: '0 B', outSize: '0 B' },
          };
        }

        const headersSet = new Set<string>();
        items.forEach((it) => {
          if (it && typeof it === 'object') {
            Object.keys(it).forEach((k) => headersSet.add(k));
          }
        });

        const headers = Array.from(headersSet);
        const escapeCell = (val: unknown): string => {
          if (val === null || val === undefined) return '';
          const str = typeof val === 'object' ? JSON.stringify(val) : String(val);
          if (
            str.includes(activeDelimiter) ||
            str.includes('"') ||
            str.includes('\n') ||
            str.includes('\r')
          ) {
            return `"${str.replace(/"/g, '""')}"`;
          }
          return str;
        };

        const headerLine = headers.map(escapeCell).join(activeDelimiter);
        const rows = items.map((it) => headers.map((h) => escapeCell(it[h])).join(activeDelimiter));

        const fullCsv = [headerLine, ...rows].join('\n');
        const outBytes = new Blob([fullCsv]).size;

        return {
          output: fullCsv,
          error: '',
          stats: {
            rows: items.length,
            cols: headers.length,
            inSize: formatBytes(inBytes),
            outSize: formatBytes(outBytes),
          },
        };
      } catch (err: unknown) {
        return {
          output: '',
          error: err instanceof Error ? 'Invalid JSON: ' + err.message : 'Invalid JSON format',
          stats: { rows: 0, cols: 0, inSize: formatBytes(inBytes), outSize: '0 B' },
        };
      }
    }
  }, [
    input,
    mode,
    activeDelimiter,
    hasHeader,
    smartTypes,
    nestedObjects,
    jsonStructure,
    minifyJson,
  ]);

  // Actions
  const handleCopy = useCallback(() => {
    if (!output) return;
    navigator.clipboard.writeText(output);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }, [output]);

  const handleDownload = useCallback(() => {
    if (!output) return;
    const isJson = mode === 'csv2json';
    const ext = isJson ? (jsonStructure === 'ndjson' ? 'ndjson' : 'json') : 'csv';
    const mime = isJson ? 'application/json' : 'text/csv';
    const blob = new Blob([output], { type: `${mime};charset=utf-8;` });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `converted-${Date.now()}.${ext}`;
    a.click();
    URL.revokeObjectURL(url);
  }, [output, mode, jsonStructure]);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      if (content) {
        setInput(content);
        if (file.name.endsWith('.json') && mode === 'csv2json') {
          setMode('json2csv');
        } else if (
          (file.name.endsWith('.csv') || file.name.endsWith('.tsv')) &&
          mode === 'json2csv'
        ) {
          setMode('csv2json');
        }
      }
    };
    reader.readAsText(file);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      if (content) {
        setInput(content);
        if (file.name.endsWith('.json') && mode === 'csv2json') {
          setMode('json2csv');
        } else if (
          (file.name.endsWith('.csv') || file.name.endsWith('.tsv')) &&
          mode === 'json2csv'
        ) {
          setMode('csv2json');
        }
      }
    };
    reader.readAsText(file);
  };

  const loadPreset = (type: 'products' | 'users' | 'iot') => {
    if (type === 'products') {
      setInput(
        'id,sku,title,category,price,inventory.quantity,inventory.warehouse,featured\n101,PRD-A1,Studio Headphones,Electronics,129.99,450,US-East,true\n102,PRD-B2,Mechanical Keyboard,Gaming,89.50,120,EU-Central,true\n103,PRD-C3,USB-C Docking Station,Accessories,45.00,0,US-West,false'
      );
    } else if (type === 'users') {
      setInput(
        'user.id,user.name,user.email,user.role,user.address.city,user.address.country,active\n1,Alice Johnson,alice@company.com,Admin,San Francisco,USA,true\n2,Bob Smith,bob@partner.io,Editor,Berlin,Germany,true\n3,Charlie Davis,charlie@dev.org,Viewer,Tokyo,Japan,false'
      );
    } else if (type === 'iot') {
      setInput(
        'timestamp,device_id,sensor.temperature_c,sensor.humidity_pct,status,battery_mv\n2026-11-27T10:00:00Z,SENSOR-01,23.4,48.2,OK,3280\n2026-11-27T10:05:00Z,SENSOR-02,24.1,49.0,OK,3190\n2026-11-27T10:10:00Z,SENSOR-03,28.6,62.1,WARN,2950'
      );
    }
  };

  return (
    <GlobalContainer maxWidth="2xl">
      <div style={{ paddingTop: 'var(--space-8)', paddingBottom: 'var(--space-16)' }}>
        <SectionHeading title={tUI('title')} subtitle={tUI('subtitle')} />

        {/* TOP MODE TOGGLE BUTTONS */}
        <div
          style={{
            display: 'flex',
            gap: '8px',
            marginTop: '20px',
            marginBottom: '16px',
            flexWrap: 'wrap',
          }}
        >
          <button
            type="button"
            onClick={() => setMode('csv2json')}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              backgroundColor: mode === 'csv2json' ? 'rgba(59, 130, 246, 0.15)' : 'var(--bg-card)',
              color: mode === 'csv2json' ? '#3b82f6' : 'var(--text-main)',
              border: mode === 'csv2json' ? '1px solid #3b82f6' : '1px solid var(--border-color)',
              borderRadius: '8px',
              padding: '10px 18px',
              fontSize: '0.88rem',
              fontWeight: 600,
              cursor: 'pointer',
              transition: 'all 0.15s ease',
            }}
          >
            <FileText size={15} />
            <span>{tUI('modeCsvToJson')}</span>
          </button>

          <button
            type="button"
            onClick={() => setMode('json2csv')}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              backgroundColor: mode === 'json2csv' ? 'rgba(59, 130, 246, 0.15)' : 'var(--bg-card)',
              color: mode === 'json2csv' ? '#3b82f6' : 'var(--text-main)',
              border: mode === 'json2csv' ? '1px solid #3b82f6' : '1px solid var(--border-color)',
              borderRadius: '8px',
              padding: '10px 18px',
              fontSize: '0.88rem',
              fontWeight: 600,
              cursor: 'pointer',
              transition: 'all 0.15s ease',
            }}
          >
            <ArrowRightLeft size={15} />
            <span>{tUI('modeJsonToCsv')}</span>
          </button>
        </div>

        {/* MAIN CONVERTER WORKSPACE */}
        <div
          style={{
            backgroundColor: 'var(--bg-card)',
            border: '1px solid var(--border-color)',
            borderRadius: '14px',
            padding: '24px',
            boxShadow: '0 4px 20px -2px rgba(0, 0, 0, 0.05)',
            marginBottom: '24px',
          }}
        >
          {/* OPTIONS BAR */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
              gap: '14px',
              marginBottom: '18px',
              paddingBottom: '16px',
              borderBottom: '1px solid var(--border-color)',
            }}
          >
            {/* Delimiter */}
            <div>
              <label
                style={{
                  display: 'block',
                  fontSize: '0.82rem',
                  fontWeight: 600,
                  color: 'var(--text-main)',
                  marginBottom: '5px',
                }}
              >
                {tUI('csvDelimiter')}
              </label>
              <select
                value={delimiterSelection}
                onChange={(e) => setDelimiterSelection(e.target.value as DelimiterType)}
                style={{
                  width: '100%',
                  backgroundColor: 'var(--bg-page)',
                  border: '1px solid var(--border-color)',
                  borderRadius: '6px',
                  color: 'var(--text-main)',
                  padding: '7px 10px',
                  fontSize: '0.84rem',
                  outline: 'none',
                }}
              >
                <option value="auto">
                  ✨ {tUI('delimiterAuto')} ({activeDelimiter === '\t' ? 'TAB' : activeDelimiter})
                </option>
                <option value=",">{tUI('delimiterComma')} (,)</option>
                <option value=";">{tUI('delimiterSemicolon')} (;)</option>
                <option value="\t">{tUI('delimiterTab')} (\t)</option>
                <option value="|">{tUI('delimiterPipe')} (|)</option>
              </select>
            </div>

            {/* JSON Output Structure */}
            {mode === 'csv2json' && (
              <div>
                <label
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px',
                    fontSize: '0.82rem',
                    fontWeight: 600,
                    color: 'var(--text-main)',
                    marginBottom: '5px',
                  }}
                >
                  <Braces size={13} color="#8b5cf6" /> {tUI('outputStructureLabel')}
                </label>
                <select
                  value={jsonStructure}
                  onChange={(e) => setJsonStructure(e.target.value as JsonStructure)}
                  style={{
                    width: '100%',
                    backgroundColor: 'var(--bg-page)',
                    border: '1px solid var(--border-color)',
                    borderRadius: '6px',
                    color: 'var(--text-main)',
                    padding: '7px 10px',
                    fontSize: '0.84rem',
                    outline: 'none',
                  }}
                >
                  <option value="objects">Array of Objects [{`{...}`}]</option>
                  <option value="arrays_2d">2D Array [[&quot;a&quot;], [&quot;b&quot;]]</option>
                  <option value="keyed">Keyed Object {`{"id": {...}}`}</option>
                  <option value="columnar">Columnar Arrays {`{"col": [...]}`}</option>
                  <option value="ndjson">NDJSON / JSON Lines (JSONL)</option>
                </select>
              </div>
            )}

            {/* Smart Toggles */}
            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                gap: '8px',
                justifyContent: 'center',
              }}
            >
              {mode === 'csv2json' && (
                <label
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    fontSize: '0.82rem',
                    color: 'var(--text-main)',
                    cursor: 'pointer',
                  }}
                >
                  <input
                    type="checkbox"
                    checked={hasHeader}
                    onChange={(e) => setHasHeader(e.target.checked)}
                    style={{ accentColor: '#3b82f6' }}
                  />
                  <span>{tUI('firstRowHeader')}</span>
                </label>
              )}

              {mode === 'csv2json' && (
                <label
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    fontSize: '0.82rem',
                    color: 'var(--text-main)',
                    cursor: 'pointer',
                  }}
                >
                  <input
                    type="checkbox"
                    checked={smartTypes}
                    onChange={(e) => setSmartTypes(e.target.checked)}
                    style={{ accentColor: '#10b981' }}
                  />
                  <span>✨ {tUI('smartTypesLabel')}</span>
                </label>
              )}
            </div>

            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                gap: '8px',
                justifyContent: 'center',
              }}
            >
              {mode === 'csv2json' && (
                <label
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    fontSize: '0.82rem',
                    color: 'var(--text-main)',
                    cursor: 'pointer',
                  }}
                >
                  <input
                    type="checkbox"
                    checked={nestedObjects}
                    onChange={(e) => setNestedObjects(e.target.checked)}
                    style={{ accentColor: '#8b5cf6' }}
                  />
                  <span>🗂️ {tUI('nestedObjectsLabel')}</span>
                </label>
              )}

              {mode === 'csv2json' && jsonStructure !== 'ndjson' && (
                <label
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    fontSize: '0.82rem',
                    color: 'var(--text-main)',
                    cursor: 'pointer',
                  }}
                >
                  <input
                    type="checkbox"
                    checked={minifyJson}
                    onChange={(e) => setMinifyJson(e.target.checked)}
                    style={{ accentColor: '#f59e0b' }}
                  />
                  <span>⚡ {tUI('minifyJsonLabel')}</span>
                </label>
              )}
            </div>
          </div>

          {/* DRAG AND DROP FILE BAR */}
          <div
            onDragOver={(e) => e.preventDefault()}
            onDrop={handleDrop}
            style={{
              border: '2px dashed var(--border-color)',
              borderRadius: '8px',
              padding: '12px 16px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              flexWrap: 'wrap',
              gap: '12px',
              marginBottom: '16px',
              backgroundColor: 'var(--bg-page)',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <UploadCloud size={20} color="#3b82f6" />
              <span style={{ fontSize: '0.84rem', color: 'var(--text-muted)' }}>
                {tUI('dragAndDropNotice')}
              </span>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <input
                ref={fileInputRef}
                type="file"
                accept=".csv,.tsv,.txt,.json,.ndjson"
                onChange={handleFileUpload}
                style={{ display: 'none' }}
              />
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                style={{
                  padding: '6px 12px',
                  backgroundColor: 'rgba(59, 130, 246, 0.1)',
                  border: '1px solid rgba(59, 130, 246, 0.3)',
                  borderRadius: '6px',
                  color: '#3b82f6',
                  fontSize: '0.78rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                }}
              >
                Browse File
              </button>

              <button
                type="button"
                onClick={() => setInput('')}
                style={{
                  padding: '6px 10px',
                  backgroundColor: 'transparent',
                  border: '1px solid var(--border-color)',
                  borderRadius: '6px',
                  color: 'var(--text-muted)',
                  fontSize: '0.78rem',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px',
                }}
              >
                <Trash2 size={13} /> Clear
              </button>
            </div>
          </div>

          {/* QUICK TEMPLATES */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              flexWrap: 'wrap',
              marginBottom: '16px',
            }}
          >
            <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)', fontWeight: 600 }}>
              Quick Presets:
            </span>
            {[
              { id: 'products', label: '🛍️ Products & Prices' },
              { id: 'users', label: '👤 Users (Dot-Nested)' },
              { id: 'iot', label: '📡 IoT Sensor Logs' },
            ].map((p) => (
              <button
                key={p.id}
                type="button"
                onClick={() => loadPreset(p.id as 'products' | 'users' | 'iot')}
                style={{
                  padding: '3px 10px',
                  backgroundColor: 'var(--bg-page)',
                  border: '1px solid var(--border-color)',
                  borderRadius: '16px',
                  fontSize: '0.74rem',
                  color: 'var(--text-main)',
                  fontWeight: 500,
                  cursor: 'pointer',
                }}
              >
                {p.label}
              </button>
            ))}
          </div>

          {/* DUAL TEXTAREA WORKSPACE */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
              gap: '16px',
              marginBottom: '16px',
            }}
          >
            {/* INPUT PANEL */}
            <div>
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  marginBottom: '6px',
                }}
              >
                <label
                  style={{
                    fontSize: '0.84rem',
                    fontWeight: 600,
                    color: 'var(--text-main)',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '5px',
                  }}
                >
                  <FileCode size={14} color="#3b82f6" />{' '}
                  {mode === 'csv2json' ? tUI('csvInput') : tUI('jsonInput')}
                </label>
                <span
                  style={{
                    fontSize: '0.74rem',
                    color: 'var(--text-muted)',
                    fontFamily: 'monospace',
                  }}
                >
                  {stats.inSize}
                </span>
              </div>
              <textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                rows={16}
                placeholder={mode === 'csv2json' ? tUI('csvPlaceholder') : tUI('jsonPlaceholder')}
                style={{
                  width: '100%',
                  backgroundColor: 'var(--bg-page)',
                  border: '1px solid var(--border-color)',
                  borderRadius: '8px',
                  color: 'var(--text-main)',
                  padding: '12px',
                  fontFamily: 'monospace',
                  fontSize: '0.82rem',
                  lineHeight: '1.5',
                  outline: 'none',
                  resize: 'vertical',
                  boxSizing: 'border-box',
                }}
              />
            </div>

            {/* OUTPUT PANEL */}
            <div>
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  marginBottom: '6px',
                }}
              >
                <label
                  style={{
                    fontSize: '0.84rem',
                    fontWeight: 600,
                    color: 'var(--text-main)',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '5px',
                  }}
                >
                  <Braces size={14} color="#10b981" />{' '}
                  {mode === 'csv2json' ? tUI('jsonOutput') : tUI('csvOutput')}
                </label>
                <div style={{ display: 'flex', gap: '6px' }}>
                  <button
                    type="button"
                    onClick={handleDownload}
                    disabled={!output}
                    style={{
                      padding: '4px 10px',
                      backgroundColor: output
                        ? 'rgba(16, 185, 129, 0.15)'
                        : 'rgba(255,255,255,0.05)',
                      color: output ? '#34d399' : '#64748b',
                      border: '1px solid rgba(16, 185, 129, 0.3)',
                      borderRadius: '6px',
                      fontSize: '0.74rem',
                      fontWeight: 600,
                      cursor: output ? 'pointer' : 'not-allowed',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px',
                    }}
                  >
                    <Download size={13} />{' '}
                    {mode === 'csv2json' ? tUI('downloadJson') : tUI('downloadCsv')}
                  </button>

                  <button
                    type="button"
                    onClick={handleCopy}
                    disabled={!output}
                    style={{
                      padding: '4px 12px',
                      backgroundColor: copied
                        ? '#10b981'
                        : output
                          ? '#2563eb'
                          : 'rgba(255,255,255,0.05)',
                      color: '#ffffff',
                      border: 'none',
                      borderRadius: '6px',
                      fontSize: '0.74rem',
                      fontWeight: 600,
                      cursor: output ? 'pointer' : 'not-allowed',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px',
                      transition: 'background 0.15s ease',
                    }}
                  >
                    {copied ? <Check size={13} /> : <Copy size={13} />}
                    {copied ? tUI('copied') : tUI('copy')}
                  </button>
                </div>
              </div>
              <textarea
                value={output}
                readOnly
                rows={16}
                placeholder={tUI('outputPlaceholder')}
                style={{
                  width: '100%',
                  backgroundColor: 'var(--bg-page)',
                  border: '1px solid var(--border-color)',
                  borderRadius: '8px',
                  color: mode === 'csv2json' ? '#34d399' : '#60a5fa',
                  padding: '12px',
                  fontFamily: 'monospace',
                  fontSize: '0.82rem',
                  lineHeight: '1.5',
                  outline: 'none',
                  resize: 'vertical',
                  boxSizing: 'border-box',
                }}
              />
            </div>
          </div>

          {/* TELEMETRY & STATS BAR */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '16px',
              flexWrap: 'wrap',
              backgroundColor: 'var(--bg-page)',
              border: '1px solid var(--border-color)',
              borderRadius: '8px',
              padding: '8px 16px',
              fontSize: '0.8rem',
              color: 'var(--text-muted)',
            }}
          >
            <span style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
              <Table size={13} color="#3b82f6" /> <strong>{stats.rows.toLocaleString()}</strong>{' '}
              rows
            </span>
            <span>•</span>
            <span style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
              <Layers size={13} color="#8b5cf6" /> <strong>{stats.cols}</strong> columns
            </span>
            <span>•</span>
            <span style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
              Input: <strong>{stats.inSize}</strong>
            </span>
            <span>•</span>
            <span style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
              Output: <strong>{stats.outSize}</strong>
            </span>
          </div>

          {/* ERROR ALERT */}
          {error && (
            <div
              style={{
                marginTop: '12px',
                backgroundColor: 'rgba(239, 68, 68, 0.1)',
                border: '1px solid rgba(239, 68, 68, 0.3)',
                borderRadius: '8px',
                padding: '10px 14px',
                color: '#ef4444',
                fontSize: '0.82rem',
              }}
            >
              ⚠️ {error}
            </div>
          )}
        </div>

        {/* STRUCTURED SEO & FAQ CONTENT */}
        <ToolSeoContent
          toolSlug="csv-to-json"
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
