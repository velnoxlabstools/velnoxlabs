'use client';

import React, { useState, useMemo, useRef } from 'react';
import { useTranslations } from 'next-intl';
import YAML from 'yaml';
import { GlobalContainer } from '@/components/layout';
import { SectionHeading } from '@/components/ui';
import { ToolSeoContent } from '@/features/tools/sections/ToolSeoContent';
import {
  ArrowLeftRight,
  Download,
  Upload,
  Copy,
  Check,
  FileCode,
  Trash2,
  Sparkles,
  AlertTriangle,
  Settings2,
} from 'lucide-react';

type Mode = 'json2yaml' | 'yaml2json';

interface DetectedSchema {
  type: 'openapi' | 'k8s' | 'compose' | 'github' | 'cloudformation' | 'generic';
  label: string;
  badgeColor: string;
}

// Sample Presets
const SAMPLE_PRESETS = {
  openapi: {
    label: 'OpenAPI / Swagger 3.0',
    mode: 'json2yaml' as Mode,
    json: JSON.stringify(
      {
        openapi: '3.0.3',
        info: {
          title: 'VelnoxLabs Cloud API',
          version: '1.0.0',
          description: 'Production-ready developer transformation APIs',
        },
        paths: {
          '/v1/convert': {
            post: {
              summary: 'Convert JSON to YAML',
              operationId: 'convertJsonToYaml',
              requestBody: {
                required: true,
                content: {
                  'application/json': {
                    schema: {
                      type: 'object',
                      properties: {
                        source: { type: 'string', example: '{"app": "velnox"}' },
                        indent: { type: 'integer', default: 2 },
                      },
                    },
                  },
                },
              },
              responses: {
                '200': {
                  description: 'YAML document formatted successfully',
                },
              },
            },
          },
        },
      },
      null,
      2
    ),
    yaml: `openapi: 3.0.3
info:
  title: VelnoxLabs Cloud API
  version: 1.0.0
  description: Production-ready developer transformation APIs
paths:
  /v1/convert:
    post:
      summary: Convert JSON to YAML
      operationId: convertJsonToYaml
      requestBody:
        required: true
        content:
          application/json:
            schema:
              type: object
              properties:
                source:
                  type: string
                  example: '{"app": "velnox"}'
                indent:
                  type: integer
                  default: 2
      responses:
        '200':
          description: YAML document formatted successfully`,
  },
  k8s: {
    label: 'Kubernetes Multi-Doc (Deployment + Service)',
    mode: 'yaml2json' as Mode,
    yaml: `apiVersion: apps/v1
kind: Deployment
metadata:
  name: velnox-gateway
  namespace: production
  labels:
    app: velnox-gateway
spec:
  replicas: 3
  selector:
    matchLabels:
      app: velnox-gateway
  template:
    metadata:
      labels:
        app: velnox-gateway
    spec:
      containers:
        - name: web
          image: 'node:20-alpine'
          ports:
            - containerPort: 3000
          env:
            - name: NODE_ENV
              value: 'production'
            - name: PORT
              value: '3000'
---
apiVersion: v1
kind: Service
metadata:
  name: velnox-gateway-svc
  namespace: production
spec:
  type: ClusterIP
  selector:
    app: velnox-gateway
  ports:
    - port: 80
      targetPort: 3000
      protocol: TCP`,
    json: JSON.stringify(
      [
        {
          apiVersion: 'apps/v1',
          kind: 'Deployment',
          metadata: {
            name: 'velnox-gateway',
            namespace: 'production',
            labels: { app: 'velnox-gateway' },
          },
          spec: {
            replicas: 3,
            selector: { matchLabels: { app: 'velnox-gateway' } },
            template: {
              metadata: { labels: { app: 'velnox-gateway' } },
              spec: {
                containers: [
                  {
                    name: 'web',
                    image: 'node:20-alpine',
                    ports: [{ containerPort: 3000 }],
                    env: [
                      { name: 'NODE_ENV', value: 'production' },
                      { name: 'PORT', value: '3000' },
                    ],
                  },
                ],
              },
            },
          },
        },
        {
          apiVersion: 'v1',
          kind: 'Service',
          metadata: {
            name: 'velnox-gateway-svc',
            namespace: 'production',
          },
          spec: {
            type: 'ClusterIP',
            selector: {
              app: 'velnox-gateway',
            },
            ports: [
              {
                port: 80,
                targetPort: 3000,
                protocol: 'TCP',
              },
            ],
          },
        },
      ],
      null,
      2
    ),
  },
  compose: {
    label: 'Docker Compose',
    mode: 'yaml2json' as Mode,
    yaml: `version: '3.8'
services:
  web:
    image: 'nginx:alpine'
    restart: always
    ports:
      - '80:80'
      - '443:443'
    depends_on:
      - api
  api:
    build: .
    environment:
      PORT: 3000
      DB_HOST: postgres
    ports:
      - '3000:3000'
  postgres:
    image: 'postgres:16-alpine'
    environment:
      POSTGRES_DB: velnox_db
      POSTGRES_PASSWORD: secretpassword
    volumes:
      - pgdata:/var/lib/postgresql/data
volumes:
  pgdata:`,
    json: JSON.stringify(
      {
        version: '3.8',
        services: {
          web: {
            image: 'nginx:alpine',
            restart: 'always',
            ports: ['80:80', '443:443'],
            depends_on: ['api'],
          },
          api: {
            build: '.',
            environment: {
              PORT: 3000,
              DB_HOST: 'postgres',
            },
            ports: ['3000:3000'],
          },
          postgres: {
            image: 'postgres:16-alpine',
            environment: {
              POSTGRES_DB: 'velnox_db',
              POSTGRES_PASSWORD: 'secretpassword',
            },
            volumes: ['pgdata:/var/lib/postgresql/data'],
          },
        },
        volumes: {
          pgdata: null,
        },
      },
      null,
      2
    ),
  },
  github: {
    label: 'GitHub Actions CI',
    mode: 'yaml2json' as Mode,
    yaml: `name: CI
on:
  push:
    branches: [main]
  pull_request:
    branches: [main]
jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: pnpm/action-setup@v3
        with:
          version: 9
      - uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: pnpm
      - run: pnpm install
      - run: pnpm test`,
    json: JSON.stringify(
      {
        name: 'CI',
        on: {
          push: { branches: ['main'] },
          pull_request: { branches: ['main'] },
        },
        jobs: {
          test: {
            'runs-on': 'ubuntu-latest',
            steps: [
              { uses: 'actions/checkout@v4' },
              { uses: 'pnpm/action-setup@v3', with: { version: 9 } },
              { uses: 'actions/setup-node@v4', with: { 'node-version': 20, cache: 'pnpm' } },
              { run: 'pnpm install' },
              { run: 'pnpm test' },
            ],
          },
        },
      },
      null,
      2
    ),
  },
  pythonDict: {
    label: 'Python Dict / FastAPI',
    mode: 'json2yaml' as Mode,
    json: `{\n  'status': 'success',\n  'debug_mode': True,\n  'cache_enabled': False,\n  'backup_worker': None,\n  'services': ['auth', 'billing', 'notifications'],\n  'max_retries': 3\n}`,
    yaml: `status: success\ndebug_mode: true\ncache_enabled: false\nbackup_worker: null\nservices:\n  - auth\n  - billing\n  - notifications\nmax_retries: 3`,
  },
};

export default function JsonYamlPage() {
  const tUI = useTranslations('ToolUI.jsonYamlConverter');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [mode, setMode] = useState<Mode>('json2yaml');
  const [input, setInput] = useState<string>(SAMPLE_PRESETS.openapi.json);
  const [indentSize, setIndentSize] = useState<2 | 4>(2);
  const [safeQuoting, setSafeQuoting] = useState<boolean>(true);
  const [multiDocK8s, setMultiDocK8s] = useState<boolean>(true);
  const [relaxedParser, setRelaxedParser] = useState<boolean>(true);
  const [minifyJson, setMinifyJson] = useState<boolean>(false);
  const [copied, setCopied] = useState<boolean>(false);
  const [isDragging, setIsDragging] = useState<boolean>(false);

  // Conversion Engine
  const conversionResult = useMemo(() => {
    const raw = input.trim();
    if (!raw) {
      return { output: '', error: null, parsedObj: null, usedRelaxed: false };
    }

    try {
      if (mode === 'json2yaml') {
        let parsed: unknown;
        let usedRelaxed = false;

        try {
          parsed = JSON.parse(raw);
        } catch (jsonErr) {
          if (!relaxedParser) throw jsonErr;
          // 1. Try Python dict normalization (True, False, None)
          const pythonNormalized = raw
            .replace(/:\s*True\b/g, ': true')
            .replace(/:\s*False\b/g, ': false')
            .replace(/:\s*None\b/g, ': null')
            .replace(/\[\s*True\b/g, '[true')
            .replace(/\[\s*False\b/g, '[false')
            .replace(/\[\s*None\b/g, '[null');
          try {
            parsed = JSON.parse(pythonNormalized);
            usedRelaxed = true;
          } catch {
            // 2. Try JS object literal eval in sandbox
            try {
              const fn = new Function(`"use strict"; return (${raw});`);
              parsed = fn();
              usedRelaxed = true;
            } catch {
              throw jsonErr;
            }
          }
        }

        const yamlOptions = {
          indent: indentSize,
          lineWidth: 0,
          blockQuote: 'literal' as const,
          defaultKeyType: 'PLAIN' as const,
          defaultStringType: safeQuoting ? ('QUOTE_DOUBLE' as const) : ('PLAIN' as const),
        };

        let yamlStr = '';
        if (
          multiDocK8s &&
          Array.isArray(parsed) &&
          parsed.length > 1 &&
          parsed.every((item) => item && typeof item === 'object')
        ) {
          yamlStr = parsed
            .map((docItem) => YAML.stringify(docItem, yamlOptions).trimEnd())
            .join('\n---\n');
        } else {
          yamlStr = YAML.stringify(parsed, yamlOptions).trimEnd();
        }

        return {
          output: yamlStr,
          error: null,
          parsedObj: parsed,
          usedRelaxed,
        };
      } else {
        // YAML to JSON (supports multi-document YAML via parseAllDocuments)
        const docs = YAML.parseAllDocuments(raw);
        const parsedDocs = docs.map((doc) => doc.toJSON());

        // Check if documents had errors
        const firstError = docs.find((d) => d.errors.length > 0)?.errors[0];
        if (firstError) {
          throw new Error(firstError.message);
        }

        const finalData = parsedDocs.length === 1 ? parsedDocs[0] : parsedDocs;
        const jsonStr = minifyJson
          ? JSON.stringify(finalData)
          : JSON.stringify(finalData, null, indentSize);

        return {
          output: jsonStr,
          error: null,
          parsedObj: finalData,
          usedRelaxed: false,
        };
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      return {
        output: '',
        error: msg,
        parsedObj: null,
        usedRelaxed: false,
      };
    }
  }, [input, mode, indentSize, safeQuoting, multiDocK8s, relaxedParser, minifyJson]);

  // AI & Smart Schema Detector
  const detectedSchema: DetectedSchema = useMemo(() => {
    const obj = conversionResult.parsedObj;
    if (!obj || typeof obj !== 'object') {
      return { type: 'generic', label: 'Generic Configuration', badgeColor: '#64748b' };
    }

    // Check Multi-Document Kubernetes Array
    if (
      Array.isArray(obj) &&
      obj.length > 1 &&
      obj.some(
        (it) => it && typeof it === 'object' && 'apiVersion' in (it as Record<string, unknown>)
      )
    ) {
      return {
        type: 'k8s',
        label: `Kubernetes Multi-Document (${obj.length} Manifests)`,
        badgeColor: '#38bdf8',
      };
    }

    const target = Array.isArray(obj)
      ? (obj[0] as Record<string, unknown>)
      : (obj as Record<string, unknown>);
    if (!target) {
      return { type: 'generic', label: 'Generic Configuration', badgeColor: '#64748b' };
    }

    // 1. Kubernetes Single Resource
    if ('apiVersion' in target && 'kind' in target) {
      return {
        type: 'k8s',
        label: `Kubernetes ${String(target.kind || 'Resource')} (${String(target.apiVersion || '')})`,
        badgeColor: '#38bdf8',
      };
    }

    // 2. OpenAPI / Swagger
    if ('openapi' in target || 'swagger' in target) {
      const ver = String(target.openapi || target.swagger || '');
      return {
        type: 'openapi',
        label: `OpenAPI / Swagger ${ver} Specification`,
        badgeColor: '#4ade80',
      };
    }

    // 3. Docker Compose
    if ('services' in target) {
      return {
        type: 'compose',
        label: 'Docker Compose Configuration',
        badgeColor: '#60a5fa',
      };
    }

    // 4. GitHub Actions
    if ('jobs' in target && ('on' in target || 'name' in target)) {
      return {
        type: 'github',
        label: 'GitHub Actions Workflow',
        badgeColor: '#c084fc',
      };
    }

    return { type: 'generic', label: 'Standard Document', badgeColor: '#94a3b8' };
  }, [conversionResult.parsedObj]);

  // Mode Swap Handler
  const handleSwap = () => {
    if (conversionResult.output) {
      setInput(conversionResult.output);
    }
    setMode((prev) => (prev === 'json2yaml' ? 'yaml2json' : 'json2yaml'));
  };

  // Load Preset
  const handleLoadPreset = (key: keyof typeof SAMPLE_PRESETS) => {
    const p = SAMPLE_PRESETS[key];
    setMode(p.mode);
    setInput(p.mode === 'json2yaml' ? p.json || p.yaml : p.yaml || p.json);
  };

  // Copy Output
  const handleCopy = () => {
    if (!conversionResult.output) return;
    navigator.clipboard.writeText(conversionResult.output);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Download Output File
  const handleDownload = () => {
    if (!conversionResult.output) return;
    const isYaml = mode === 'json2yaml';
    const ext = isYaml ? 'yaml' : 'json';
    const mimeType = isYaml ? 'text/yaml' : 'application/json';
    const blob = new Blob([conversionResult.output], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `converted-${Date.now()}.${ext}`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  // File Upload / Drop
  const handleFileUpload = (file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const text = e.target?.result as string;
      if (typeof text === 'string') {
        // Auto-detect mode based on extension or first char
        if (file.name.endsWith('.yaml') || file.name.endsWith('.yml')) {
          setMode('yaml2json');
        } else if (file.name.endsWith('.json')) {
          setMode('json2yaml');
        }
        setInput(text);
      }
    };
    reader.readAsText(file);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileUpload(e.dataTransfer.files[0]);
    }
  };

  // Telemetry stats
  const inputLines = input ? input.split('\n').length : 0;
  const outputLines = conversionResult.output ? conversionResult.output.split('\n').length : 0;
  const inputBytes = new Blob([input]).size;
  const outputBytes = new Blob([conversionResult.output]).size;

  return (
    <>
      <GlobalContainer maxWidth="2xl">
        <div style={{ paddingTop: 'var(--space-8)', paddingBottom: 'var(--space-16)' }}>
          {/* Header & Badges */}
          <SectionHeading title={tUI('title')} subtitle={tUI('subtitle')} />

          <div
            style={{
              display: 'flex',
              flexWrap: 'wrap',
              gap: '8px',
              justifyContent: 'center',
              marginTop: '12px',
              marginBottom: '24px',
            }}
          >
            <span
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                fontSize: '0.75rem',
                fontWeight: 600,
                color: '#34d399',
                backgroundColor: 'rgba(52, 211, 153, 0.1)',
                border: '1px solid rgba(52, 211, 153, 0.3)',
                borderRadius: '9999px',
                padding: '4px 12px',
              }}
            >
              <FileCode size={12} />
              {tUI('clientSideNotice')}
            </span>

            <span
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                fontSize: '0.75rem',
                fontWeight: 600,
                color: detectedSchema.badgeColor,
                backgroundColor: `${detectedSchema.badgeColor}18`,
                border: `1px solid ${detectedSchema.badgeColor}40`,
                borderRadius: '9999px',
                padding: '4px 12px',
              }}
            >
              <Sparkles size={12} />
              {detectedSchema.label}
            </span>

            {conversionResult.usedRelaxed && (
              <span
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                  fontSize: '0.75rem',
                  fontWeight: 600,
                  color: '#fbbf24',
                  backgroundColor: 'rgba(251, 191, 36, 0.12)',
                  border: '1px solid rgba(251, 191, 36, 0.3)',
                  borderRadius: '9999px',
                  padding: '4px 12px',
                }}
              >
                <Sparkles size={12} />
                {tUI('relaxedNotice')}
              </span>
            )}
          </div>

          {/* Presets & Controls Bar */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              flexWrap: 'wrap',
              gap: '8px',
              marginBottom: '16px',
            }}
          >
            {/* Presets */}
            <div style={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: '8px' }}>
              <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 600 }}>
                {tUI('presets')}:
              </span>
              <button
                type="button"
                onClick={() => handleLoadPreset('openapi')}
                style={{
                  padding: '4px 10px',
                  borderRadius: '6px',
                  fontSize: '0.75rem',
                  fontWeight: 600,
                  backgroundColor: 'var(--bg-card)',
                  border: '1px solid var(--border-color)',
                  color: 'var(--text-main)',
                  cursor: 'pointer',
                }}
              >
                {tUI('presetOpenApi')}
              </button>
              <button
                type="button"
                onClick={() => handleLoadPreset('k8s')}
                style={{
                  padding: '4px 10px',
                  borderRadius: '6px',
                  fontSize: '0.75rem',
                  fontWeight: 600,
                  backgroundColor: 'var(--bg-card)',
                  border: '1px solid var(--border-color)',
                  color: 'var(--text-main)',
                  cursor: 'pointer',
                }}
              >
                {tUI('presetK8s')}
              </button>
              <button
                type="button"
                onClick={() => handleLoadPreset('compose')}
                style={{
                  padding: '4px 10px',
                  borderRadius: '6px',
                  fontSize: '0.75rem',
                  fontWeight: 600,
                  backgroundColor: 'var(--bg-card)',
                  border: '1px solid var(--border-color)',
                  color: 'var(--text-main)',
                  cursor: 'pointer',
                }}
              >
                {tUI('presetCompose')}
              </button>
              <button
                type="button"
                onClick={() => handleLoadPreset('github')}
                style={{
                  padding: '4px 10px',
                  borderRadius: '6px',
                  fontSize: '0.75rem',
                  fontWeight: 600,
                  backgroundColor: 'var(--bg-card)',
                  border: '1px solid var(--border-color)',
                  color: 'var(--text-main)',
                  cursor: 'pointer',
                }}
              >
                {tUI('presetGithub')}
              </button>
              <button
                type="button"
                onClick={() => handleLoadPreset('pythonDict')}
                style={{
                  padding: '4px 10px',
                  borderRadius: '6px',
                  fontSize: '0.75rem',
                  fontWeight: 600,
                  backgroundColor: 'var(--bg-card)',
                  border: '1px solid var(--border-color)',
                  color: 'var(--text-main)',
                  cursor: 'pointer',
                }}
              >
                {tUI('presetPythonDict')}
              </button>
            </div>

            {/* Clear Button */}
            <button
              type="button"
              onClick={() => setInput('')}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                padding: '4px 10px',
                borderRadius: '6px',
                fontSize: '0.75rem',
                fontWeight: 600,
                backgroundColor: 'transparent',
                border: '1px solid var(--border-color)',
                color: 'var(--text-muted)',
                cursor: 'pointer',
              }}
            >
              <Trash2 size={12} />
              {tUI('clear')}
            </button>
          </div>

          {/* Mode Switcher & Format Options Bar */}
          <div
            style={{
              backgroundColor: 'var(--bg-card)',
              border: '1px solid var(--border-color)',
              borderRadius: '12px',
              padding: '12px 16px',
              marginBottom: '16px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              flexWrap: 'wrap',
              gap: '12px',
            }}
          >
            {/* Mode Toggle Buttons */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <button
                type="button"
                onClick={() => setMode('json2yaml')}
                style={{
                  backgroundColor:
                    mode === 'json2yaml' ? 'rgba(59, 130, 246, 0.25)' : 'var(--bg-page)',
                  color: mode === 'json2yaml' ? '#60a5fa' : 'var(--text-muted)',
                  border:
                    mode === 'json2yaml'
                      ? '1px solid rgba(59, 130, 246, 0.4)'
                      : '1px solid var(--border-color)',
                  borderRadius: '6px',
                  padding: '6px 16px',
                  fontSize: '0.82rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                }}
              >
                {tUI('jsonToYamlTab')}
              </button>

              <button
                type="button"
                onClick={handleSwap}
                title={tUI('swapDirections')}
                style={{
                  backgroundColor: 'var(--bg-page)',
                  border: '1px solid var(--border-color)',
                  borderRadius: '6px',
                  padding: '6px 10px',
                  color: 'var(--text-main)',
                  display: 'flex',
                  alignItems: 'center',
                  cursor: 'pointer',
                }}
              >
                <ArrowLeftRight size={14} />
              </button>

              <button
                type="button"
                onClick={() => setMode('yaml2json')}
                style={{
                  backgroundColor:
                    mode === 'yaml2json' ? 'rgba(59, 130, 246, 0.25)' : 'var(--bg-page)',
                  color: mode === 'yaml2json' ? '#60a5fa' : 'var(--text-muted)',
                  border:
                    mode === 'yaml2json'
                      ? '1px solid rgba(59, 130, 246, 0.4)'
                      : '1px solid var(--border-color)',
                  borderRadius: '6px',
                  padding: '6px 16px',
                  fontSize: '0.82rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                }}
              >
                {tUI('yamlToJsonTab')}
              </button>
            </div>

            {/* Formatting Options */}
            <div style={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
              {/* Indentation Select */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Settings2 size={13} color="var(--text-muted)" />
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600 }}>
                  {tUI('indent')}:
                </span>
                <select
                  value={indentSize}
                  onChange={(e) => setIndentSize(Number(e.target.value) as 2 | 4)}
                  style={{
                    backgroundColor: 'var(--bg-page)',
                    border: '1px solid var(--border-color)',
                    borderRadius: '4px',
                    color: 'var(--text-main)',
                    fontSize: '0.75rem',
                    padding: '2px 6px',
                    cursor: 'pointer',
                  }}
                >
                  <option value={2}>2 Spaces (K8s/Docker)</option>
                  <option value={4}>4 Spaces</option>
                </select>
              </div>

              {/* Safe Quoting Safeguard */}
              {mode === 'json2yaml' && (
                <label
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    fontSize: '0.75rem',
                    color: 'var(--text-main)',
                    cursor: 'pointer',
                  }}
                >
                  <input
                    type="checkbox"
                    checked={safeQuoting}
                    onChange={(e) => setSafeQuoting(e.target.checked)}
                    style={{ cursor: 'pointer' }}
                  />
                  <span>{tUI('safeQuoting')}</span>
                </label>
              )}

              {/* Multi-Document K8s Separator */}
              {mode === 'json2yaml' && (
                <label
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    fontSize: '0.75rem',
                    color: 'var(--text-main)',
                    cursor: 'pointer',
                  }}
                >
                  <input
                    type="checkbox"
                    checked={multiDocK8s}
                    onChange={(e) => setMultiDocK8s(e.target.checked)}
                    style={{ cursor: 'pointer' }}
                  />
                  <span>{tUI('multiDocK8s')}</span>
                </label>
              )}

              {/* Relaxed Parser (Python / JS) */}
              {mode === 'json2yaml' && (
                <label
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    fontSize: '0.75rem',
                    color: 'var(--text-main)',
                    cursor: 'pointer',
                  }}
                >
                  <input
                    type="checkbox"
                    checked={relaxedParser}
                    onChange={(e) => setRelaxedParser(e.target.checked)}
                    style={{ cursor: 'pointer' }}
                  />
                  <span>{tUI('relaxedParser')}</span>
                </label>
              )}

              {/* Minify JSON */}
              {mode === 'yaml2json' && (
                <label
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    fontSize: '0.75rem',
                    color: 'var(--text-main)',
                    cursor: 'pointer',
                  }}
                >
                  <input
                    type="checkbox"
                    checked={minifyJson}
                    onChange={(e) => setMinifyJson(e.target.checked)}
                    style={{ cursor: 'pointer' }}
                  />
                  <span>{tUI('minifyJson')}</span>
                </label>
              )}
            </div>
          </div>

          {/* Main 2-Column Converter Workspace */}
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
              {/* Input Panel */}
              <div
                onDragOver={(e) => {
                  e.preventDefault();
                  setIsDragging(true);
                }}
                onDragLeave={() => setIsDragging(false)}
                onDrop={handleDrop}
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  borderRadius: '8px',
                  border: isDragging ? '2px dashed #60a5fa' : '1px solid transparent',
                  padding: isDragging ? '4px' : '0',
                }}
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
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px',
                    }}
                  >
                    <FileCode size={15} color="#60a5fa" />
                    {mode === 'json2yaml' ? tUI('jsonInput') : tUI('yamlInput')}
                  </label>

                  {/* Upload & Stats */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span
                      style={{
                        fontSize: '0.72rem',
                        color: 'var(--text-muted)',
                        fontFamily: 'monospace',
                      }}
                    >
                      {inputLines} L | {inputBytes} B
                    </span>

                    <input
                      type="file"
                      ref={fileInputRef}
                      onChange={(e) => {
                        if (e.target.files && e.target.files[0]) {
                          handleFileUpload(e.target.files[0]);
                        }
                      }}
                      accept=".json,.yaml,.yml,.txt"
                      style={{ display: 'none' }}
                    />

                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      title={tUI('uploadFile')}
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '4px',
                        padding: '3px 8px',
                        borderRadius: '4px',
                        fontSize: '0.72rem',
                        fontWeight: 600,
                        backgroundColor: 'var(--bg-page)',
                        border: '1px solid var(--border-color)',
                        color: 'var(--text-main)',
                        cursor: 'pointer',
                      }}
                    >
                      <Upload size={11} />
                      {tUI('uploadFile')}
                    </button>
                  </div>
                </div>

                <textarea
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  rows={16}
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
                    fontSize: '0.82rem',
                    outline: 'none',
                    resize: 'vertical',
                    minHeight: '300px',
                    lineHeight: '1.45',
                  }}
                />
              </div>

              {/* Output Panel */}
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
                      color: mode === 'json2yaml' ? '#38bdf8' : '#34d399',
                      fontSize: '0.875rem',
                      fontWeight: 600,
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px',
                    }}
                  >
                    <FileCode size={15} />
                    {mode === 'json2yaml' ? tUI('yamlOutput') : tUI('jsonOutput')}
                  </label>

                  {/* Actions & Stats */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span
                      style={{
                        fontSize: '0.72rem',
                        color: 'var(--text-muted)',
                        fontFamily: 'monospace',
                      }}
                    >
                      {outputLines} L | {outputBytes} B
                    </span>

                    <button
                      type="button"
                      onClick={handleCopy}
                      disabled={!conversionResult.output}
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '4px',
                        padding: '3px 8px',
                        borderRadius: '4px',
                        fontSize: '0.72rem',
                        fontWeight: 600,
                        backgroundColor: conversionResult.output
                          ? 'rgba(59, 130, 246, 0.15)'
                          : 'rgba(255,255,255,0.05)',
                        border: '1px solid rgba(59, 130, 246, 0.3)',
                        color: conversionResult.output ? '#60a5fa' : 'var(--text-muted)',
                        cursor: conversionResult.output ? 'pointer' : 'not-allowed',
                      }}
                    >
                      {copied ? <Check size={11} /> : <Copy size={11} />}
                      {copied ? tUI('copied') : tUI('copy')}
                    </button>

                    <button
                      type="button"
                      onClick={handleDownload}
                      disabled={!conversionResult.output}
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '4px',
                        padding: '3px 8px',
                        borderRadius: '4px',
                        fontSize: '0.72rem',
                        fontWeight: 600,
                        backgroundColor: conversionResult.output
                          ? 'rgba(52, 211, 153, 0.15)'
                          : 'rgba(255,255,255,0.05)',
                        border: '1px solid rgba(52, 211, 153, 0.3)',
                        color: conversionResult.output ? '#34d399' : 'var(--text-muted)',
                        cursor: conversionResult.output ? 'pointer' : 'not-allowed',
                      }}
                    >
                      <Download size={11} />
                      {tUI('download')}
                    </button>
                  </div>
                </div>

                <textarea
                  value={conversionResult.output}
                  readOnly
                  rows={16}
                  placeholder={tUI('outputPlaceholder')}
                  style={{
                    width: '100%',
                    backgroundColor: 'var(--bg-page)',
                    border: '1px solid var(--border-color)',
                    borderRadius: '8px',
                    color: mode === 'json2yaml' ? '#38bdf8' : '#34d399',
                    padding: '12px',
                    fontFamily: 'monospace',
                    fontSize: '0.82rem',
                    outline: 'none',
                    resize: 'vertical',
                    minHeight: '300px',
                    lineHeight: '1.45',
                  }}
                />
              </div>
            </div>

            {/* Error Banner with Line Diagnostics */}
            {conversionResult.error && (
              <div
                style={{
                  marginTop: '16px',
                  backgroundColor: 'rgba(239, 68, 68, 0.1)',
                  border: '1px solid rgba(239, 68, 68, 0.3)',
                  borderRadius: '8px',
                  padding: '12px 16px',
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: '10px',
                  color: '#f87171',
                  fontSize: '0.82rem',
                }}
              >
                <AlertTriangle size={16} style={{ marginTop: '2px', flexShrink: 0 }} />
                <div>
                  <strong>{tUI('errorTitle')}:</strong> {conversionResult.error}
                </div>
              </div>
            )}
          </div>

          {/* Tool SEO Content Section */}
          <ToolSeoContent
            toolSlug="json-yaml-converter"
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
