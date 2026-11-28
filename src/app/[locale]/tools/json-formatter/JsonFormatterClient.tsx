'use client';

import React, { useState, useMemo, useRef, useEffect, useCallback } from 'react';
import { useTranslations } from 'next-intl';
import { GlobalContainer } from '@/components/layout';
import { SectionHeading } from '@/components/ui';
import { ToolSeoContent } from '@/features/tools/sections/ToolSeoContent';
import {
  Copy,
  Check,
  Download,
  Upload,
  Trash2,
  Sparkles,
  FileCode,
  Layers,
  Search,
  ChevronRight,
  ChevronDown,
  Wrench,
  ArrowUpDown,
  Braces,
  Eye,
  Code,
  AlertCircle,
  CheckCircle2,
  ShieldCheck,
} from 'lucide-react';

// Indentation options
type IndentOption = '2' | '3' | '4' | 'tab' | 'minified';

// Sample presets
const PRESETS = {
  cleanApi: {
    label: 'Clean API Payload (Users & Orders)',
    data: JSON.stringify(
      {
        status: 'success',
        statusCode: 200,
        requestId: 'req_88192a7c',
        timestamp: '2026-11-28T12:00:00Z',
        data: {
          user: {
            id: 1042,
            username: 'alex_mercer',
            email: 'alex.mercer@velnoxlabs.com',
            roles: ['admin', 'developer'],
            profile: {
              firstName: 'Alex',
              lastName: 'Mercer',
              isVerified: true,
            },
          },
          recentOrders: [
            { id: 'ORD-991', total: 129.99, status: 'delivered' },
            { id: 'ORD-992', total: 49.5, status: 'processing' },
          ],
        },
      },
      null,
      2
    ),
  },
  brokenLlm: {
    label: 'Broken LLM Output (Markdown, Trailing Commas, Single Quotes)',
    data: `\`\`\`json\n{\n  'service_name': 'ai-gateway',\n  'version': '2.4.0',\n  'is_healthy': True,\n  'debug_mode': False,\n  'error_log': None,\n  'rate_limits': {\n    'requests_per_minute': 1000,\n    'burst': 1500,\n  },\n  'active_regions': ['us-east', 'eu-west', 'ap-south',],\n}\n\`\`\``,
  },
  nestedConfig: {
    label: 'Deeply Nested Config (Tree Viewer Demo)',
    data: JSON.stringify(
      {
        cluster: {
          name: 'k8s-prod-cluster',
          region: 'us-east-1',
          nodes: {
            controlPlane: {
              count: 3,
              instanceType: 'c6g.xlarge',
              haEnabled: true,
            },
            workerPools: [
              {
                poolName: 'general-workers',
                minCount: 5,
                maxCount: 50,
                autoScaling: true,
                diskGb: 200,
              },
              {
                poolName: 'gpu-infer-workers',
                minCount: 2,
                maxCount: 16,
                autoScaling: false,
                diskGb: 500,
              },
            ],
          },
          telemetry: {
            metricsPort: 9090,
            tracingEnabled: true,
            labels: {
              environment: 'production',
              managedBy: 'velnoxlabs-iac',
            },
          },
        },
      },
      null,
      2
    ),
  },
  pythonDict: {
    label: 'Python Dict / Machine Learning Params (True, False, None)',
    data: `{\n  'model_name': 'mistral-large-2611',\n  'temperature': 0.7,\n  'streaming_enabled': True,\n  'fallback_model': None,\n  'penalties': {\n    'presence': 0.1,\n    'frequency': 0.2,\n  },\n  'tags': ['nlp', 'generative-ai', 'production'],\n}`,
  },
};

// Smart Auto-Repair Engine for Broken JSON / LLM Output
function autoRepairJson(raw: string): { repairedText: string; fixes: string[] } {
  const fixes: string[] = [];
  let text = raw.trim();

  // 1. Strip Markdown code blocks (```json ... ``` or ``` ...)
  const markdownMatch = text.match(/^```(?:json)?\s*\n([\s\S]*?)\n```$/i);
  if (markdownMatch) {
    text = markdownMatch[1].trim();
    fixes.push('Stripped markdown code block wrappers (```json ... ```)');
  } else if (text.startsWith('```') && text.endsWith('```')) {
    text = text
      .replace(/^```[a-zA-Z]*\n?/, '')
      .replace(/\n?```$/, '')
      .trim();
    fixes.push('Stripped markdown code block markers');
  }

  // 2. Wrap loose key-value pairs if missing outer braces
  if (!text.startsWith('{') && !text.startsWith('[') && text.includes(':')) {
    text = `{\n${text}\n}`;
    fixes.push('Wrapped loose properties in outer object braces { ... }');
  }

  // 3. Normalize Python-style booleans and None
  if (/:\s*(True|False|None)\b/.test(text) || /\[\s*(True|False|None)\b/.test(text)) {
    text = text
      .replace(/:\s*True\b/g, ': true')
      .replace(/:\s*False\b/g, ': false')
      .replace(/:\s*None\b/g, ': null')
      .replace(/\[\s*True\b/g, '[true')
      .replace(/\[\s*False\b/g, '[false')
      .replace(/\[\s*None\b/g, '[null');
    fixes.push('Normalized Python constants (True, False, None → true, false, null)');
  }

  // 4. Remove trailing commas before } or ]
  const trailingCommaRegex = /,\s*([\]}])/g;
  if (trailingCommaRegex.test(text)) {
    text = text.replace(trailingCommaRegex, '$1');
    fixes.push('Removed illegal trailing commas before closing braces/brackets');
  }

  // 5. Convert single quotes to double quotes
  if (/'[^'\\]*(?:\\.[^'\\]*)*'/.test(text)) {
    const converted = text.replace(/'((?:\\.|[^'])*)'/g, (_, content) => {
      const escaped = content.replace(/(?<!\\)"/g, '\\"');
      return `"${escaped}"`;
    });
    if (converted !== text) {
      text = converted;
      fixes.push('Converted single quotes to valid JSON double quotes');
    }
  }

  // 6. Fix unquoted object keys: { foo: "bar" } -> { "foo": "bar" }
  const unquotedKeyRegex = /([{,]\s*)([a-zA-Z_$][a-zA-Z0-9_$-]*)\s*:/g;
  if (unquotedKeyRegex.test(text)) {
    text = text.replace(unquotedKeyRegex, '$1"$2":');
    fixes.push('Enclosed unquoted object keys in double quotes');
  }

  // 7. Check trailing commas again after regex replacements
  if (/,\s*([\]}])/g.test(text)) {
    text = text.replace(/,\s*([\]}])/g, '$1');
  }

  return { repairedText: text, fixes };
}

// Format JSON with sorting and indentation
function formatJsonString(val: unknown, indent: IndentOption, sortKeys: boolean): string {
  let processed = val;
  if (sortKeys) {
    processed = sortObjectKeys(val);
  }

  if (indent === 'minified') {
    return JSON.stringify(processed);
  }

  const space = indent === 'tab' ? '\t' : parseInt(indent, 10);
  return JSON.stringify(processed, null, space);
}

// Recursively sort object keys alphabetically
function sortObjectKeys(obj: unknown): unknown {
  if (Array.isArray(obj)) {
    return obj.map(sortObjectKeys);
  }
  if (typeof obj === 'object' && obj !== null) {
    const sorted: Record<string, unknown> = {};
    const keys = Object.keys(obj as Record<string, unknown>).sort((a, b) =>
      a.localeCompare(b, undefined, { sensitivity: 'base' })
    );
    for (const key of keys) {
      sorted[key] = sortObjectKeys((obj as Record<string, unknown>)[key]);
    }
    return sorted;
  }
  return obj;
}

// Extract exact line and column numbers from JSON.parse error
function parseJsonWithLocation(raw: string): {
  parsed: unknown | null;
  error: { message: string; line: number; column: number; snippet: string } | null;
} {
  try {
    const parsed = JSON.parse(raw);
    return { parsed, error: null };
  } catch (err: unknown) {
    const rawMsg = err instanceof Error ? err.message : String(err);
    let line = 1;
    let column = 1;

    const lineColMatch = rawMsg.match(/line (\d+) column (\d+)/i);
    const posMatch = rawMsg.match(/position (\d+)/i);

    if (lineColMatch) {
      line = parseInt(lineColMatch[1], 10);
      column = parseInt(lineColMatch[2], 10);
    } else if (posMatch) {
      const pos = parseInt(posMatch[1], 10);
      const before = raw.slice(0, pos);
      const lines = before.split('\n');
      line = lines.length;
      column = lines[lines.length - 1].length + 1;
    }

    const allLines = raw.split('\n');
    const startLine = Math.max(0, line - 2);
    const endLine = Math.min(allLines.length, line + 1);
    const snippetLines = allLines.slice(startLine, endLine).map((l, i) => {
      const curLineNum = startLine + i + 1;
      const isTarget = curLineNum === line;
      return `${isTarget ? '▶ ' : '  '}${String(curLineNum).padStart(3, ' ')} | ${l}`;
    });

    return {
      parsed: null,
      error: {
        message: rawMsg,
        line,
        column,
        snippet: snippetLines.join('\n'),
      },
    };
  }
}

// Telemetry & stats calculation
function analyzeJsonStats(obj: unknown): {
  totalKeys: number;
  maxDepth: number;
  isArray: boolean;
  itemCount: number;
} {
  let totalKeys = 0;
  let maxDepth = 0;
  let itemCount = 0;

  function walk(node: unknown, depth: number) {
    if (depth > maxDepth) maxDepth = depth;
    if (Array.isArray(node)) {
      itemCount += node.length;
      for (const item of node) {
        walk(item, depth + 1);
      }
    } else if (typeof node === 'object' && node !== null) {
      const keys = Object.keys(node as Record<string, unknown>);
      totalKeys += keys.length;
      for (const key of keys) {
        walk((node as Record<string, unknown>)[key], depth + 1);
      }
    }
  }

  walk(obj, 1);
  return { totalKeys, maxDepth, isArray: Array.isArray(obj), itemCount };
}

// Format byte size
function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
}

// ==========================================
// Interactive Tree Node Component
// ==========================================
interface TreeNodeProps {
  name?: string;
  value: unknown;
  path: string;
  searchQuery: string;
  expandedPaths: Set<string>;
  onToggle: (path: string) => void;
  onCopyPath: (path: string) => void;
}

const TreeNode: React.FC<TreeNodeProps> = React.memo(function TreeNode({
  name,
  value,
  path,
  searchQuery,
  expandedPaths,
  onToggle,
  onCopyPath,
}) {
  const isObject = typeof value === 'object' && value !== null;
  const isArray = Array.isArray(value);
  const isExpanded = expandedPaths.has(path);

  // Match check for filter highlight
  const matchesSearch = useMemo(() => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    if (name && name.toLowerCase().includes(q)) return true;
    if (!isObject && String(value).toLowerCase().includes(q)) return true;
    return false;
  }, [name, value, isObject, searchQuery]);

  if (!isObject) {
    // Primitive leaf node
    let valueColor = '#34d399'; // string
    let displayValue = JSON.stringify(value);

    if (typeof value === 'number') {
      valueColor = '#f59e0b';
      displayValue = String(value);
    } else if (typeof value === 'boolean') {
      valueColor = '#c084fc';
      displayValue = String(value);
    } else if (value === null) {
      valueColor = '#94a3b8';
      displayValue = 'null';
    }

    return (
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '6px',
          padding: '2px 0',
          fontFamily: 'monospace',
          fontSize: '0.82rem',
          lineHeight: '1.4',
          backgroundColor:
            matchesSearch && searchQuery ? 'rgba(59, 130, 246, 0.15)' : 'transparent',
          borderRadius: '4px',
        }}
      >
        <span style={{ width: '16px' }} />
        {name !== undefined && (
          <span style={{ color: '#60a5fa', fontWeight: 600 }}>&quot;{name}&quot;:</span>
        )}
        <span style={{ color: valueColor }}>{displayValue}</span>
        <button
          type="button"
          onClick={() => onCopyPath(path)}
          title={`Copy JSONPath: ${path}`}
          style={{
            background: 'none',
            border: 'none',
            color: 'var(--text-muted)',
            cursor: 'pointer',
            padding: '0 4px',
            fontSize: '0.68rem',
            opacity: 0.6,
          }}
        >
          #
        </button>
      </div>
    );
  }

  // Object / Array Container node
  const childKeys = Object.keys(value as Record<string, unknown>);
  const badgeLabel = isArray ? `[${childKeys.length} items]` : `{${childKeys.length} keys}`;

  return (
    <div style={{ padding: '2px 0' }}>
      <div
        onClick={() => onToggle(path)}
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '6px',
          cursor: 'pointer',
          fontFamily: 'monospace',
          fontSize: '0.82rem',
          lineHeight: '1.4',
          userSelect: 'none',
          backgroundColor:
            matchesSearch && searchQuery ? 'rgba(59, 130, 246, 0.15)' : 'transparent',
          borderRadius: '4px',
          padding: '2px 4px',
        }}
      >
        <span style={{ color: 'var(--text-muted)', display: 'inline-flex' }}>
          {isExpanded ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
        </span>
        {name !== undefined && (
          <span style={{ color: '#60a5fa', fontWeight: 600 }}>&quot;{name}&quot;:</span>
        )}
        <span
          style={{
            fontSize: '0.72rem',
            color: 'var(--text-muted)',
            backgroundColor: 'rgba(255, 255, 255, 0.05)',
            padding: '1px 6px',
            borderRadius: '4px',
            border: '1px solid var(--border-color)',
          }}
        >
          {badgeLabel}
        </span>
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onCopyPath(path);
          }}
          title={`Copy JSONPath: ${path}`}
          style={{
            background: 'none',
            border: 'none',
            color: 'var(--text-muted)',
            cursor: 'pointer',
            padding: '0 4px',
            fontSize: '0.68rem',
            opacity: 0.6,
          }}
        >
          #
        </button>
      </div>

      {isExpanded && (
        <div
          style={{
            marginLeft: '14px',
            paddingLeft: '8px',
            borderLeft: '1px solid rgba(255, 255, 255, 0.1)',
          }}
        >
          {childKeys.map((k) => {
            const childVal = (value as Record<string, unknown>)[k];
            const childPath = isArray ? `${path}[${k}]` : `${path}.${k}`;
            return (
              <TreeNode
                key={k}
                name={isArray ? undefined : k}
                value={childVal}
                path={childPath}
                searchQuery={searchQuery}
                expandedPaths={expandedPaths}
                onToggle={onToggle}
                onCopyPath={onCopyPath}
              />
            );
          })}
        </div>
      )}
    </div>
  );
});

// ==========================================
// Main Client Component
// ==========================================
export default function JsonFormatterClient() {
  const tUI = useTranslations('ToolUI.jsonFormatter');

  // Input & Formatting States
  const [inputJson, setInputJson] = useState<string>(PRESETS.cleanApi.data);
  const [indentOption, setIndentOption] = useState<IndentOption>('2');
  const [sortKeys, setSortKeys] = useState(false);
  const [viewMode, setViewMode] = useState<'code' | 'tree'>('code');

  // UI state
  const [copied, setCopied] = useState(false);
  const [copiedPath, setCopiedPath] = useState('');
  const [repairSuccessMsg, setRepairSuccessMsg] = useState<string[] | null>(null);
  const [treeSearch, setTreeSearch] = useState('');
  const [expandedPaths, setExpandedPaths] = useState<Set<string>>(new Set(['$']));
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Parse & Validate
  const parseResult = useMemo(() => {
    if (!inputJson.trim()) {
      return { parsed: null, error: null, formatted: '' };
    }

    const res = parseJsonWithLocation(inputJson);
    if (res.error || res.parsed === null) {
      return { parsed: null, error: res.error, formatted: '' };
    }

    try {
      const formatted = formatJsonString(res.parsed, indentOption, sortKeys);
      return { parsed: res.parsed, error: null, formatted };
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      return {
        parsed: null,
        error: { message: msg, line: 1, column: 1, snippet: '' },
        formatted: '',
      };
    }
  }, [inputJson, indentOption, sortKeys]);

  // Telemetry & Stats
  const stats = useMemo(() => {
    const inputBytes = new Blob([inputJson]).size;
    const outputBytes = new Blob([parseResult.formatted]).size;
    const inputLines = inputJson ? inputJson.split('\n').length : 0;
    const outputLines = parseResult.formatted ? parseResult.formatted.split('\n').length : 0;

    let jsonDetails = { totalKeys: 0, maxDepth: 0, isArray: false, itemCount: 0 };
    if (parseResult.parsed !== null) {
      jsonDetails = analyzeJsonStats(parseResult.parsed);
    }

    const compressionRatio =
      inputBytes > 0 && outputBytes > 0
        ? Math.round(((outputBytes - inputBytes) / inputBytes) * 100)
        : 0;

    return {
      inputBytes,
      outputBytes,
      inputLines,
      outputLines,
      totalKeys: jsonDetails.totalKeys,
      maxDepth: jsonDetails.maxDepth,
      isArray: jsonDetails.isArray,
      compressionRatio,
    };
  }, [inputJson, parseResult]);

  // Action: Smart AI Auto-Repair
  const handleAutoRepair = () => {
    if (!inputJson.trim()) return;
    const { repairedText, fixes } = autoRepairJson(inputJson);

    // Test if repaired text parses cleanly
    const testParse = parseJsonWithLocation(repairedText);
    if (!testParse.error && testParse.parsed !== null) {
      const prettyRepaired = formatJsonString(testParse.parsed, indentOption, sortKeys);
      setInputJson(prettyRepaired);
      setRepairSuccessMsg(fixes.length > 0 ? fixes : ['Successfully repaired invalid syntax.']);
      setTimeout(() => setRepairSuccessMsg(null), 6000);
    } else {
      // Even if not 100% repaired, update text to best effort
      setInputJson(repairedText);
      setRepairSuccessMsg(
        fixes.length > 0
          ? [...fixes, 'Partial repair applied. Please check highlighted syntax error.']
          : ['Attempted repair, syntax error still detected.']
      );
      setTimeout(() => setRepairSuccessMsg(null), 6000);
    }
  };

  // Action: Copy
  const handleCopy = () => {
    if (!parseResult.formatted) return;
    navigator.clipboard.writeText(parseResult.formatted);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Action: Copy JSONPath
  const handleCopyPath = useCallback((path: string) => {
    navigator.clipboard.writeText(path);
    setCopiedPath(path);
    setTimeout(() => setCopiedPath(''), 2000);
  }, []);

  // Action: Download
  const handleDownload = () => {
    if (!parseResult.formatted) return;
    const blob = new Blob([parseResult.formatted], { type: 'application/json;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = indentOption === 'minified' ? 'data.min.json' : 'data.formatted.json';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  // Action: File Upload
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      if (content) setInputJson(content);
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  // Action: Drag and Drop
  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    const file = e.dataTransfer.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      if (content) setInputJson(content);
    };
    reader.readAsText(file);
  };

  // Tree View Expand / Collapse All
  const handleToggleNode = useCallback((path: string) => {
    setExpandedPaths((prev) => {
      const next = new Set(prev);
      if (next.has(path)) {
        next.delete(path);
      } else {
        next.add(path);
      }
      return next;
    });
  }, []);

  const handleExpandAll = () => {
    if (!parseResult.parsed) return;
    const allPaths = new Set<string>();

    function walk(node: unknown, path: string) {
      allPaths.add(path);
      if (Array.isArray(node)) {
        node.forEach((item, idx) => walk(item, `${path}[${idx}]`));
      } else if (typeof node === 'object' && node !== null) {
        Object.entries(node as Record<string, unknown>).forEach(([k, v]) =>
          walk(v, `${path}.${k}`)
        );
      }
    }

    walk(parseResult.parsed, '$');
    setExpandedPaths(allPaths);
  };

  const handleCollapseAll = () => {
    setExpandedPaths(new Set(['$']));
  };

  // Set initial expanded tree paths on load
  useEffect(() => {
    if (parseResult.parsed) {
      const initial = new Set<string>(['$']);
      if (typeof parseResult.parsed === 'object' && parseResult.parsed !== null) {
        Object.keys(parseResult.parsed).forEach((k) => initial.add(`$.${k}`));
      }
      setExpandedPaths(initial);
    }
  }, [parseResult.parsed]);

  return (
    <>
      <GlobalContainer maxWidth="2xl">
        <div style={{ paddingTop: 'var(--space-8)', paddingBottom: 'var(--space-16)' }}>
          <SectionHeading
            title={tUI('title')}
            subtitle={tUI('subtitle')}
            toolSlug="json-formatter"
          />

          {/* Sample Presets Bar */}
          <div
            style={{
              display: 'flex',
              flexWrap: 'wrap',
              gap: '8px',
              alignItems: 'center',
              marginBottom: '16px',
            }}
          >
            <span
              style={{
                fontSize: '0.78rem',
                fontWeight: 600,
                color: 'var(--text-muted)',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '4px',
              }}
            >
              <Sparkles size={14} style={{ color: '#60a5fa' }} />
              {tUI('presetsLabel')}:
            </span>

            {Object.entries(PRESETS).map(([key, item]) => (
              <button
                key={key}
                type="button"
                onClick={() => setInputJson(item.data)}
                style={{
                  padding: '4px 10px',
                  borderRadius: '6px',
                  fontSize: '0.75rem',
                  fontWeight: 500,
                  cursor: 'pointer',
                  backgroundColor: 'rgba(255, 255, 255, 0.04)',
                  border: '1px solid var(--border-color)',
                  color: 'var(--text-muted)',
                  transition: 'all 0.15s ease',
                }}
              >
                {key === 'cleanApi' && tUI('presetCleanApi')}
                {key === 'brokenLlm' && tUI('presetBrokenLlm')}
                {key === 'nestedConfig' && tUI('presetNestedConfig')}
                {key === 'pythonDict' && tUI('presetPythonDict')}
              </button>
            ))}
          </div>

          {/* Controls & Toolbar */}
          <div
            style={{
              backgroundColor: 'var(--bg-card)',
              border: '1px solid var(--border-color)',
              borderRadius: '12px',
              padding: '16px 20px',
              marginBottom: '16px',
              display: 'flex',
              flexWrap: 'wrap',
              gap: '12px',
              alignItems: 'center',
              justifyContent: 'space-between',
            }}
          >
            {/* Left Controls: Indent, Sort, Auto-Repair */}
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px', alignItems: 'center' }}>
              <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)' }}>
                  {tUI('indentLabel')}:
                </span>
                <select
                  value={indentOption}
                  onChange={(e) => setIndentOption(e.target.value as IndentOption)}
                  style={{
                    backgroundColor: 'var(--bg-page)',
                    border: '1px solid var(--border-color)',
                    borderRadius: '6px',
                    color: 'var(--text-main)',
                    padding: '5px 8px',
                    fontSize: '0.78rem',
                    outline: 'none',
                    cursor: 'pointer',
                  }}
                >
                  <option value="2">{tUI('indent2Spaces')}</option>
                  <option value="3">{tUI('indent3Spaces')}</option>
                  <option value="4">{tUI('indent4Spaces')}</option>
                  <option value="tab">{tUI('indentTabs')}</option>
                  <option value="minified">{tUI('indentMinified')}</option>
                </select>
              </div>

              <label
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '5px',
                  fontSize: '0.75rem',
                  color: 'var(--text-main)',
                  cursor: 'pointer',
                }}
              >
                <input
                  type="checkbox"
                  checked={sortKeys}
                  onChange={(e) => setSortKeys(e.target.checked)}
                />
                <ArrowUpDown size={12} style={{ color: '#60a5fa' }} />
                <span>{tUI('sortKeysLabel')}</span>
              </label>

              <button
                type="button"
                onClick={handleAutoRepair}
                title="Automatically fix missing quotes, trailing commas, markdown wrappers & Python syntax"
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                  padding: '5px 12px',
                  borderRadius: '6px',
                  fontSize: '0.75rem',
                  fontWeight: 600,
                  backgroundColor: 'rgba(59, 130, 246, 0.18)',
                  border: '1px solid rgba(59, 130, 246, 0.4)',
                  color: '#60a5fa',
                  cursor: 'pointer',
                  transition: 'all 0.15s ease',
                }}
              >
                <Wrench size={13} />
                {tUI('autoRepairBtn')}
              </button>
            </div>

            {/* Right Controls: View Toggle (Code vs Tree) */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <div
                style={{
                  display: 'inline-flex',
                  backgroundColor: 'var(--bg-page)',
                  border: '1px solid var(--border-color)',
                  borderRadius: '6px',
                  padding: '2px',
                }}
              >
                <button
                  type="button"
                  onClick={() => setViewMode('code')}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '5px',
                    padding: '4px 10px',
                    borderRadius: '4px',
                    fontSize: '0.75rem',
                    fontWeight: 600,
                    cursor: 'pointer',
                    backgroundColor:
                      viewMode === 'code' ? 'rgba(59, 130, 246, 0.2)' : 'transparent',
                    border: 'none',
                    color: viewMode === 'code' ? '#60a5fa' : 'var(--text-muted)',
                  }}
                >
                  <Code size={13} />
                  {tUI('viewCode')}
                </button>
                <button
                  type="button"
                  onClick={() => setViewMode('tree')}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '5px',
                    padding: '4px 10px',
                    borderRadius: '4px',
                    fontSize: '0.75rem',
                    fontWeight: 600,
                    cursor: 'pointer',
                    backgroundColor:
                      viewMode === 'tree' ? 'rgba(52, 211, 153, 0.2)' : 'transparent',
                    border: 'none',
                    color: viewMode === 'tree' ? '#34d399' : 'var(--text-muted)',
                  }}
                >
                  <Eye size={13} />
                  {tUI('viewTree')}
                </button>
              </div>
            </div>
          </div>

          {/* Auto-Repair Success Notice */}
          {repairSuccessMsg && (
            <div
              style={{
                marginBottom: '16px',
                backgroundColor: 'rgba(52, 211, 153, 0.12)',
                border: '1px solid rgba(52, 211, 153, 0.35)',
                borderRadius: '8px',
                padding: '12px 16px',
                color: '#34d399',
                fontSize: '0.8rem',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 600 }}>
                <CheckCircle2 size={16} />
                <span>{tUI('repairSuccessHeading')}</span>
              </div>
              <ul style={{ margin: '6px 0 0 24px', padding: 0 }}>
                {repairSuccessMsg.map((fix, idx) => (
                  <li key={idx}>{fix}</li>
                ))}
              </ul>
            </div>
          )}

          {/* Main Work Area */}
          <div
            style={{
              backgroundColor: 'var(--bg-card)',
              border: '1px solid var(--border-color)',
              borderRadius: '12px',
              padding: '20px',
              marginBottom: '20px',
            }}
          >
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
                gap: '20px',
              }}
            >
              {/* Left Column: Input Editor */}
              <div
                onDragOver={(e) => e.preventDefault()}
                onDrop={handleDrop}
                style={{ display: 'flex', flexDirection: 'column' }}
              >
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
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '6px',
                    }}
                  >
                    <FileCode size={14} style={{ color: '#60a5fa' }} />
                    {tUI('inputLabel')}
                  </label>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <span
                      style={{
                        fontSize: '0.72rem',
                        color: 'var(--text-muted)',
                        fontFamily: 'monospace',
                      }}
                    >
                      {stats.inputLines} L | {formatBytes(stats.inputBytes)}
                    </span>

                    <input
                      type="file"
                      ref={fileInputRef}
                      onChange={handleFileUpload}
                      accept=".json,.txt,.jsonld"
                      style={{ display: 'none' }}
                    />

                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      title="Upload JSON file"
                      style={{
                        padding: '3px 8px',
                        borderRadius: '4px',
                        fontSize: '0.72rem',
                        backgroundColor: 'rgba(255, 255, 255, 0.05)',
                        border: '1px solid var(--border-color)',
                        color: 'var(--text-muted)',
                        cursor: 'pointer',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '4px',
                      }}
                    >
                      <Upload size={11} />
                    </button>

                    <button
                      type="button"
                      onClick={() => setInputJson('')}
                      title="Clear editor"
                      style={{
                        padding: '3px 8px',
                        borderRadius: '4px',
                        fontSize: '0.72rem',
                        backgroundColor: 'rgba(255, 255, 255, 0.05)',
                        border: '1px solid var(--border-color)',
                        color: 'var(--text-muted)',
                        cursor: 'pointer',
                        display: 'inline-flex',
                        alignItems: 'center',
                      }}
                    >
                      <Trash2 size={11} />
                    </button>
                  </div>
                </div>

                <textarea
                  value={inputJson}
                  onChange={(e) => setInputJson(e.target.value)}
                  rows={18}
                  placeholder={tUI('inputPlaceholder')}
                  style={{
                    width: '100%',
                    backgroundColor: 'var(--bg-page)',
                    border: parseResult.error
                      ? '1px solid rgba(239, 68, 68, 0.5)'
                      : '1px solid var(--border-color)',
                    borderRadius: '8px',
                    color: 'var(--text-main)',
                    padding: '12px',
                    fontFamily: 'monospace',
                    fontSize: '0.82rem',
                    outline: 'none',
                    resize: 'vertical',
                    minHeight: '360px',
                    lineHeight: '1.45',
                  }}
                />
              </div>

              {/* Right Column: Code View OR Interactive Tree View */}
              <div style={{ display: 'flex', flexDirection: 'column' }}>
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
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '6px',
                    }}
                  >
                    {viewMode === 'code' ? (
                      <Braces size={14} style={{ color: '#34d399' }} />
                    ) : (
                      <Layers size={14} style={{ color: '#34d399' }} />
                    )}
                    {viewMode === 'code' ? tUI('outputLabel') : tUI('treeViewerLabel')}
                  </label>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    {copiedPath && (
                      <span
                        style={{ fontSize: '0.72rem', color: '#60a5fa', fontFamily: 'monospace' }}
                      >
                        Path Copied!
                      </span>
                    )}

                    <span
                      style={{
                        fontSize: '0.72rem',
                        color: 'var(--text-muted)',
                        fontFamily: 'monospace',
                      }}
                    >
                      {viewMode === 'code'
                        ? `${stats.outputLines} L | ${formatBytes(stats.outputBytes)}`
                        : `${stats.totalKeys} Keys | Depth ${stats.maxDepth}`}
                    </span>

                    <button
                      type="button"
                      onClick={handleCopy}
                      disabled={!parseResult.formatted}
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '4px',
                        padding: '3px 8px',
                        borderRadius: '4px',
                        fontSize: '0.72rem',
                        fontWeight: 600,
                        backgroundColor: parseResult.formatted
                          ? 'rgba(59, 130, 246, 0.15)'
                          : 'rgba(255,255,255,0.05)',
                        border: '1px solid rgba(59, 130, 246, 0.3)',
                        color: parseResult.formatted ? '#60a5fa' : 'var(--text-muted)',
                        cursor: parseResult.formatted ? 'pointer' : 'not-allowed',
                      }}
                    >
                      {copied ? <Check size={11} /> : <Copy size={11} />}
                      {copied ? tUI('copied') : tUI('copyBtn')}
                    </button>

                    <button
                      type="button"
                      onClick={handleDownload}
                      disabled={!parseResult.formatted}
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '4px',
                        padding: '3px 8px',
                        borderRadius: '4px',
                        fontSize: '0.72rem',
                        fontWeight: 600,
                        backgroundColor: parseResult.formatted
                          ? 'rgba(52, 211, 153, 0.15)'
                          : 'rgba(255,255,255,0.05)',
                        border: '1px solid rgba(52, 211, 153, 0.3)',
                        color: parseResult.formatted ? '#34d399' : 'var(--text-muted)',
                        cursor: parseResult.formatted ? 'pointer' : 'not-allowed',
                      }}
                    >
                      <Download size={11} />
                      {tUI('downloadBtn')}
                    </button>
                  </div>
                </div>

                {viewMode === 'code' ? (
                  /* Standard Code Output Area */
                  <textarea
                    value={parseResult.formatted}
                    readOnly
                    rows={18}
                    placeholder={tUI('outputPlaceholder')}
                    style={{
                      width: '100%',
                      backgroundColor: 'var(--bg-page)',
                      border: '1px solid var(--border-color)',
                      borderRadius: '8px',
                      color: '#34d399',
                      padding: '12px',
                      fontFamily: 'monospace',
                      fontSize: '0.82rem',
                      outline: 'none',
                      resize: 'vertical',
                      minHeight: '360px',
                      lineHeight: '1.45',
                    }}
                  />
                ) : (
                  /* Interactive Tree Viewer Area */
                  <div
                    style={{
                      width: '100%',
                      backgroundColor: 'var(--bg-page)',
                      border: '1px solid var(--border-color)',
                      borderRadius: '8px',
                      padding: '12px',
                      minHeight: '360px',
                      maxHeight: '600px',
                      overflowY: 'auto',
                    }}
                  >
                    {/* Tree controls bar */}
                    <div
                      style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        marginBottom: '10px',
                        paddingBottom: '8px',
                        borderBottom: '1px solid var(--border-color)',
                        flexWrap: 'wrap',
                        gap: '8px',
                      }}
                    >
                      <div
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '6px',
                          backgroundColor: 'var(--bg-card)',
                          border: '1px solid var(--border-color)',
                          borderRadius: '6px',
                          padding: '2px 8px',
                        }}
                      >
                        <Search size={12} style={{ color: 'var(--text-muted)' }} />
                        <input
                          type="text"
                          value={treeSearch}
                          onChange={(e) => setTreeSearch(e.target.value)}
                          placeholder={tUI('filterPlaceholder')}
                          style={{
                            background: 'none',
                            border: 'none',
                            outline: 'none',
                            fontSize: '0.75rem',
                            color: 'var(--text-main)',
                            width: '140px',
                          }}
                        />
                      </div>

                      <div style={{ display: 'flex', gap: '6px' }}>
                        <button
                          type="button"
                          onClick={handleExpandAll}
                          style={{
                            padding: '3px 8px',
                            borderRadius: '4px',
                            fontSize: '0.7rem',
                            backgroundColor: 'rgba(255, 255, 255, 0.05)',
                            border: '1px solid var(--border-color)',
                            color: 'var(--text-muted)',
                            cursor: 'pointer',
                          }}
                        >
                          {tUI('expandAll')}
                        </button>
                        <button
                          type="button"
                          onClick={handleCollapseAll}
                          style={{
                            padding: '3px 8px',
                            borderRadius: '4px',
                            fontSize: '0.7rem',
                            backgroundColor: 'rgba(255, 255, 255, 0.05)',
                            border: '1px solid var(--border-color)',
                            color: 'var(--text-muted)',
                            cursor: 'pointer',
                          }}
                        >
                          {tUI('collapseAll')}
                        </button>
                      </div>
                    </div>

                    {/* Tree Root */}
                    {parseResult.parsed !== null ? (
                      <TreeNode
                        value={parseResult.parsed}
                        path="$"
                        searchQuery={treeSearch}
                        expandedPaths={expandedPaths}
                        onToggle={handleToggleNode}
                        onCopyPath={handleCopyPath}
                      />
                    ) : (
                      <div
                        style={{
                          padding: '24px',
                          textAlign: 'center',
                          color: 'var(--text-muted)',
                          fontSize: '0.85rem',
                        }}
                      >
                        {parseResult.error ? tUI('treeFixSyntaxFirst') : tUI('treeEmptyState')}
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* Error Message with Exact Line & Column Snippet */}
            {parseResult.error && (
              <div
                style={{
                  marginTop: '16px',
                  backgroundColor: 'rgba(239, 68, 68, 0.1)',
                  border: '1px solid rgba(239, 68, 68, 0.35)',
                  borderRadius: '8px',
                  padding: '14px 18px',
                  color: '#f87171',
                }}
              >
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    fontWeight: 600,
                    fontSize: '0.85rem',
                    marginBottom: '6px',
                  }}
                >
                  <AlertCircle size={16} />
                  <span>
                    {tUI('syntaxErrorHeading', {
                      line: parseResult.error.line,
                      column: parseResult.error.column,
                    })}
                  </span>
                </div>
                <div style={{ fontSize: '0.8rem', marginBottom: '8px' }}>
                  {parseResult.error.message}
                </div>
                {parseResult.error.snippet && (
                  <pre
                    style={{
                      margin: 0,
                      padding: '8px 12px',
                      backgroundColor: 'rgba(0, 0, 0, 0.3)',
                      borderRadius: '6px',
                      fontSize: '0.75rem',
                      fontFamily: 'monospace',
                      color: '#fca5a5',
                      overflowX: 'auto',
                    }}
                  >
                    {parseResult.error.snippet}
                  </pre>
                )}
                <div style={{ marginTop: '10px' }}>
                  <button
                    type="button"
                    onClick={handleAutoRepair}
                    style={{
                      padding: '4px 12px',
                      borderRadius: '6px',
                      fontSize: '0.75rem',
                      fontWeight: 600,
                      backgroundColor: 'rgba(239, 68, 68, 0.2)',
                      border: '1px solid rgba(239, 68, 68, 0.4)',
                      color: '#fca5a5',
                      cursor: 'pointer',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '5px',
                    }}
                  >
                    <Wrench size={12} />
                    {tUI('repairNowBtn')}
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Quick Technical Architecture & Cheatsheet */}
          <div
            style={{
              backgroundColor: 'var(--bg-card)',
              border: '1px solid var(--border-color)',
              borderRadius: '12px',
              padding: '24px',
              marginBottom: '32px',
            }}
          >
            <h3
              style={{
                fontSize: '1.05rem',
                fontWeight: 700,
                color: 'var(--text-main)',
                marginBottom: '16px',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
              }}
            >
              <ShieldCheck size={20} style={{ color: '#34d399' }} />
              Client-Side JSON Validation & AI Repair Engine
            </h3>

            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
                gap: '16px',
              }}
            >
              <div
                style={{
                  backgroundColor: 'var(--bg-page)',
                  border: '1px solid var(--border-color)',
                  borderRadius: '8px',
                  padding: '14px',
                }}
              >
                <h4
                  style={{
                    fontSize: '0.88rem',
                    fontWeight: 600,
                    color: '#60a5fa',
                    marginBottom: '8px',
                  }}
                >
                  AI LLM Auto-Repair
                </h4>
                <p
                  style={{
                    fontSize: '0.8rem',
                    color: 'var(--text-muted)',
                    lineHeight: '1.5',
                    margin: 0,
                  }}
                >
                  Language models (ChatGPT, Claude, Gemini) frequently output JSON wrapped in
                  markdown, trailing commas, or Python constants. Our auto-repair engine heals these
                  malformed outputs into RFC 8259 standard JSON in one click.
                </p>
              </div>

              <div
                style={{
                  backgroundColor: 'var(--bg-page)',
                  border: '1px solid var(--border-color)',
                  borderRadius: '8px',
                  padding: '14px',
                }}
              >
                <h4
                  style={{
                    fontSize: '0.88rem',
                    fontWeight: 600,
                    color: '#34d399',
                    marginBottom: '8px',
                  }}
                >
                  Collapsible Tree View & JSONPath
                </h4>
                <p
                  style={{
                    fontSize: '0.8rem',
                    color: 'var(--text-muted)',
                    lineHeight: '1.5',
                    margin: 0,
                  }}
                >
                  Explore nested structures without drowning in raw text. Color-coded nodes
                  (strings, numbers, booleans, null) and one-click JSONPath copying (e.g.{' '}
                  <code>$.data.user.id</code>) streamline API response analysis.
                </p>
              </div>

              <div
                style={{
                  backgroundColor: 'var(--bg-page)',
                  border: '1px solid var(--border-color)',
                  borderRadius: '8px',
                  padding: '14px',
                }}
              >
                <h4
                  style={{
                    fontSize: '0.88rem',
                    fontWeight: 600,
                    color: '#f59e0b',
                    marginBottom: '8px',
                  }}
                >
                  Zero-Server Privacy
                </h4>
                <p
                  style={{
                    fontSize: '0.8rem',
                    color: 'var(--text-muted)',
                    lineHeight: '1.5',
                    margin: 0,
                  }}
                >
                  Your proprietary schemas, API keys, and sensitive database exports never leave
                  your browser. All parsing, validation, and tree rendering execute 100% locally in
                  client-side JavaScript.
                </p>
              </div>
            </div>
          </div>

          {/* SEO Content Section */}
          <ToolSeoContent
            toolSlug="json-formatter"
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
              { q: tUI('faq5Q'), a: tUI('faq5A') },
            ]}
          />
        </div>
      </GlobalContainer>
    </>
  );
}
