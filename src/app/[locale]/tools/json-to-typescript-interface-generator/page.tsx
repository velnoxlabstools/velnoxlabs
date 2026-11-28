'use client';

import React, { useState, useMemo, useRef } from 'react';
import { useTranslations } from 'next-intl';
import { GlobalContainer } from '@/components/layout';
import { SectionHeading } from '@/components/ui';
import { ToolSeoContent } from '@/features/tools/sections/ToolSeoContent';
import {
  Code,
  Copy,
  Check,
  Download,
  Upload,
  Sparkles,
  Settings,
  Trash2,
  FileCode,
  Layers,
  Wand2,
} from 'lucide-react';

type DeclarationType = 'interface' | 'type';

interface GeneratorOptions {
  rootName: string;
  declarationType: DeclarationType;
  exportKeyword: boolean;
  readonlyFields: boolean;
  includeExamples: boolean;
  optionalStyle: 'question' | 'null';
}

interface ParsedInput {
  data: unknown;
  format: 'json' | 'js-object' | 'python-dict' | 'json-schema';
  error: string | null;
}

// Sample Presets
const SAMPLE_PRESETS = {
  python: {
    label: 'Python FastAPI Dict',
    rootName: 'UserResponse',
    raw: `{\n  'user_id': 'usr_981a2f',\n  'username': 'alex_dev',\n  'email': 'alex@fastapi.cloud',\n  'is_active': True,\n  'is_superuser': False,\n  'bio': None,\n  'login_count': 142,\n  'roles': ['developer', 'admin']\n}`,
  },
  jsobject: {
    label: 'JavaScript Object Literal',
    rootName: 'BlogPost',
    raw: `{\n  title: 'Modern Next.js 15 & React 19',\n  slug: 'nextjs-15-react-19-guide',\n  published: true,\n  views: 18450,\n  tags: ['react', 'nextjs', 'typescript',],\n  author: {\n    name: 'Sarah Connor',\n    socials: {\n      twitter: '@sarah_dev',\n      github: 'sarahc',\n    },\n  },\n}`,
  },
  arrayMulti: {
    label: 'E-Commerce Array (Multi-Sample)',
    rootName: 'Catalog',
    raw: `[\n  {\n    "id": 101,\n    "productName": "Ergonomic Mechanical Keyboard",\n    "price": 149.99,\n    "inStock": true,\n    "discountCode": "SUMMERSALE",\n    "tags": ["hardware", "peripherals"]\n  },\n  {\n    "id": 102,\n    "productName": "USB-C Braided Cable 2M",\n    "price": 18.5,\n    "inStock": true,\n    "rating": 4.8\n  },\n  {\n    "id": 103,\n    "productName": "Noise-Cancelling Headphones",\n    "price": 299.0,\n    "inStock": false,\n    "discountCode": "VIP20",\n    "rating": 4.9\n  }\n]`,
  },
  jsonSchema: {
    label: 'JSON Schema (draft-07)',
    rootName: 'CustomerRecord',
    raw: `{\n  "$schema": "http://json-schema.org/draft-07/schema#",\n  "title": "CustomerRecord",\n  "type": "object",\n  "description": "Standard enterprise customer model",\n  "properties": {\n    "customerId": {\n      "type": "string",\n      "description": "Unique customer UUID identifier"\n    },\n    "fullName": {\n      "type": "string"\n    },\n    "emailAddress": {\n      "type": "string",\n      "format": "email"\n    },\n    "membershipTier": {\n      "type": "string",\n      "enum": ["silver", "gold", "platinum"]\n    },\n    "creditLimit": {\n      "type": "number"\n    }\n  },\n  "required": ["customerId", "fullName", "emailAddress"]\n}`,
  },
};

function capitalize(s: string): string {
  if (!s) return '';
  return s.charAt(0).toUpperCase() + s.slice(1);
}

function isValidIdentifier(s: string): boolean {
  return /^[a-zA-Z_$][a-zA-Z0-9_$]*$/.test(s);
}

function formatPropKey(key: string): string {
  return isValidIdentifier(key) ? key : JSON.stringify(key);
}

// Relaxed Parser (handles Strict JSON, JS Objects, Python Dicts & JSON Schema)
function parseRelaxedInput(raw: string): ParsedInput {
  const trimmed = raw.trim();
  if (!trimmed) {
    return { data: null, format: 'json', error: null };
  }

  // 1. Try standard strict JSON
  try {
    const parsed = JSON.parse(trimmed);
    const isJsonSchema =
      parsed &&
      typeof parsed === 'object' &&
      !Array.isArray(parsed) &&
      ('$schema' in parsed || ('properties' in parsed && 'type' in parsed));
    return {
      data: parsed,
      format: isJsonSchema ? 'json-schema' : 'json',
      error: null,
    };
  } catch {
    // Proceed to relaxed normalization
  }

  let isPython = false;
  if (/\b(True|False|None)\b/.test(trimmed)) {
    isPython = true;
  }

  // Normalize Python tokens
  const normalized = trimmed
    .replace(/\bTrue\b/g, 'true')
    .replace(/\bFalse\b/g, 'false')
    .replace(/\bNone\b/g, 'null');

  try {
    // Evaluate safely in client-side JS environment
    const parsed = new Function(`"use strict"; return (${normalized});`)();
    const isJsonSchema =
      parsed &&
      typeof parsed === 'object' &&
      !Array.isArray(parsed) &&
      ('$schema' in parsed || ('properties' in parsed && 'type' in parsed));

    return {
      data: parsed,
      format: isJsonSchema ? 'json-schema' : isPython ? 'python-dict' : 'js-object',
      error: null,
    };
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    return {
      data: null,
      format: 'json',
      error: msg,
    };
  }
}

export default function JsonToTsPage() {
  const tUI = useTranslations('ToolUI.jsonToTypescript');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [inputCode, setInputCode] = useState<string>(SAMPLE_PRESETS.python.raw);
  const [options, setOptions] = useState<GeneratorOptions>({
    rootName: SAMPLE_PRESETS.python.rootName,
    declarationType: 'interface',
    exportKeyword: true,
    readonlyFields: false,
    includeExamples: true,
    optionalStyle: 'question',
  });

  const [copied, setCopied] = useState<boolean>(false);

  // Parse Input
  const parsedState = useMemo(() => {
    return parseRelaxedInput(inputCode);
  }, [inputCode]);

  // Generate TypeScript Definitions Engine
  const generationResult = useMemo(() => {
    if (!parsedState.data || parsedState.error) {
      return {
        code: '',
        interfacesCount: 0,
        propertiesCount: 0,
        maxDepth: 0,
        detectedTypes: new Set<string>(),
      };
    }

    const data = parsedState.data;
    const interfaces: Map<string, string> = new Map();
    let propCount = 0;
    let maxDepth = 1;
    const detectedTypes = new Set<string>();

    const prefix = options.exportKeyword ? 'export ' : '';
    const ro = options.readonlyFields ? 'readonly ' : '';

    // Handle Official JSON Schema input
    if (parsedState.format === 'json-schema') {
      const schemaObj = data as Record<string, unknown>;
      const rootInterfaceName = capitalize(
        options.rootName || String(schemaObj.title || 'RootSchema')
      );

      const parseSchemaNode = (
        node: Record<string, unknown>,
        nameHint: string,
        depth: number
      ): string => {
        maxDepth = Math.max(maxDepth, depth);

        if (node.enum && Array.isArray(node.enum)) {
          detectedTypes.add('enum');
          return node.enum.map((e) => JSON.stringify(e)).join(' | ');
        }

        const type = String(node.type || 'any');

        if (type === 'string') {
          detectedTypes.add('string');
          return 'string';
        }
        if (type === 'number' || type === 'integer') {
          detectedTypes.add('number');
          return 'number';
        }
        if (type === 'boolean') {
          detectedTypes.add('boolean');
          return 'boolean';
        }
        if (type === 'null') {
          detectedTypes.add('null');
          return 'null';
        }

        if (type === 'array' && node.items && typeof node.items === 'object') {
          detectedTypes.add('array');
          const itemType = parseSchemaNode(
            node.items as Record<string, unknown>,
            `${nameHint}Item`,
            depth + 1
          );
          return `${itemType}[]`;
        }

        if (type === 'object' || node.properties) {
          detectedTypes.add('object');
          const props = (node.properties || {}) as Record<string, Record<string, unknown>>;
          const requiredList = new Set<string>(
            Array.isArray(node.required) ? (node.required as string[]) : []
          );
          const lines: string[] = [];

          for (const [propName, propDef] of Object.entries(props)) {
            propCount++;
            const isReq = requiredList.has(propName);
            const optChar = isReq ? '' : '?';
            const childType = parseSchemaNode(propDef, capitalize(propName), depth + 1);

            let docComment = '';
            if (options.includeExamples && propDef.description) {
              docComment = `  /** ${propDef.description} */\n`;
            }

            lines.push(`${docComment}  ${ro}${formatPropKey(propName)}${optChar}: ${childType};`);
          }

          const ifaceName = capitalize(nameHint);
          const body =
            options.declarationType === 'interface'
              ? `${prefix}interface ${ifaceName} {\n${lines.join('\n')}\n}`
              : `${prefix}type ${ifaceName} = {\n${lines.join('\n')}\n};`;

          interfaces.set(ifaceName, body);
          return ifaceName;
        }

        return 'any';
      };

      parseSchemaNode(schemaObj, rootInterfaceName, 1);

      return {
        code: Array.from(interfaces.values()).join('\n\n'),
        interfacesCount: interfaces.size,
        propertiesCount: propCount,
        maxDepth,
        detectedTypes,
      };
    }

    // Handle Raw JSON / Python Dict / JS Object input
    const inferTsType = (val: unknown, nameHint: string, depth: number): string => {
      maxDepth = Math.max(maxDepth, depth);

      if (val === null) {
        detectedTypes.add('null');
        return 'null';
      }

      if (typeof val === 'string') {
        detectedTypes.add('string');
        return 'string';
      }
      if (typeof val === 'number') {
        detectedTypes.add('number');
        return 'number';
      }
      if (typeof val === 'boolean') {
        detectedTypes.add('boolean');
        return 'boolean';
      }

      // Arrays: Multi-sample merging
      if (Array.isArray(val)) {
        detectedTypes.add('array');
        if (val.length === 0) return 'any[]';

        const isAllObjects = val.every((it) => it && typeof it === 'object' && !Array.isArray(it));

        if (isAllObjects && val.length > 0) {
          // Merge all keys across all array samples
          const allKeys = new Set<string>();
          val.forEach((it) => {
            Object.keys(it as Record<string, unknown>).forEach((k) => allKeys.add(k));
          });

          const itemInterfaceName = capitalize(nameHint.replace(/s$/, '')) + 'Item';
          const lines: string[] = [];

          allKeys.forEach((key) => {
            propCount++;
            const presentItems = val.filter(
              (it) => key in (it as Record<string, unknown>)
            ) as Record<string, unknown>[];

            const isOptional = presentItems.length < val.length;
            const values = presentItems.map((it) => it[key]);
            const hasNull = values.some((v) => v === null);
            const nonNullValues = values.filter((v) => v !== null);

            let fieldType = 'any';
            if (nonNullValues.length > 0) {
              const types = Array.from(
                new Set(nonNullValues.map((v) => inferTsType(v, capitalize(key), depth + 1)))
              );
              fieldType = types.length === 1 ? types[0] : `(${types.join(' | ')})`;
            }

            if (hasNull) {
              fieldType = fieldType === 'null' ? 'null' : `${fieldType} | null`;
            }

            const optChar = isOptional ? '?' : '';

            let exampleDoc = '';
            if (options.includeExamples && nonNullValues.length > 0) {
              const sampleVal = JSON.stringify(nonNullValues[0]);
              if (sampleVal && sampleVal.length < 50) {
                exampleDoc = `  /** @example ${sampleVal} */\n`;
              }
            }

            lines.push(`${exampleDoc}  ${ro}${formatPropKey(key)}${optChar}: ${fieldType};`);
          });

          const body =
            options.declarationType === 'interface'
              ? `${prefix}interface ${itemInterfaceName} {\n${lines.join('\n')}\n}`
              : `${prefix}type ${itemInterfaceName} = {\n${lines.join('\n')}\n};`;

          interfaces.set(itemInterfaceName, body);
          return `${itemInterfaceName}[]`;
        }

        // Array of primitives
        const primitiveTypes = Array.from(
          new Set(val.map((v) => inferTsType(v, `${nameHint}Item`, depth + 1)))
        );
        if (primitiveTypes.length === 1) {
          return `${primitiveTypes[0]}[]`;
        }
        return `(${primitiveTypes.join(' | ')})[]`;
      }

      // Objects
      if (typeof val === 'object' && val !== null) {
        detectedTypes.add('object');
        const record = val as Record<string, unknown>;
        const keys = Object.keys(record);
        const ifaceName = capitalize(nameHint);

        if (keys.length === 0) {
          return 'Record<string, unknown>';
        }

        const lines: string[] = [];
        keys.forEach((key) => {
          propCount++;
          const childVal = record[key];
          let childType = inferTsType(childVal, capitalize(key), depth + 1);

          if (childVal === null) {
            childType = 'string | null';
          }

          let exampleDoc = '';
          if (options.includeExamples && childVal !== null && typeof childVal !== 'object') {
            const sampleVal = JSON.stringify(childVal);
            if (sampleVal && sampleVal.length < 50) {
              exampleDoc = `  /** @example ${sampleVal} */\n`;
            }
          }

          lines.push(`${exampleDoc}  ${ro}${formatPropKey(key)}: ${childType};`);
        });

        const body =
          options.declarationType === 'interface'
            ? `${prefix}interface ${ifaceName} {\n${lines.join('\n')}\n}`
            : `${prefix}type ${ifaceName} = {\n${lines.join('\n')}\n};`;

        interfaces.set(ifaceName, body);
        return ifaceName;
      }

      return 'any';
    };

    const rootName = capitalize(options.rootName || 'Root');

    if (Array.isArray(data)) {
      const itemType = inferTsType(data, rootName, 1);
      const rootBody = `${prefix}type ${rootName} = ${itemType};`;
      interfaces.set(rootName, rootBody);
    } else {
      inferTsType(data, rootName, 1);
    }

    return {
      code: Array.from(interfaces.values()).join('\n\n'),
      interfacesCount: interfaces.size,
      propertiesCount: propCount,
      maxDepth,
      detectedTypes,
    };
  }, [parsedState, options]);

  // Load Preset
  const handleLoadPreset = (key: keyof typeof SAMPLE_PRESETS) => {
    const p = SAMPLE_PRESETS[key];
    setInputCode(p.raw);
    setOptions((prev) => ({ ...prev, rootName: p.rootName }));
  };

  // Copy Output
  const handleCopy = () => {
    if (!generationResult.code) return;
    navigator.clipboard.writeText(generationResult.code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Download Output File
  const handleDownload = () => {
    if (!generationResult.code) return;
    const blob = new Blob([generationResult.code], { type: 'text/typescript' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${options.rootName || 'types'}.ts`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  // Beautify / Format Input
  const handleBeautifyInput = () => {
    if (parsedState.data) {
      setInputCode(JSON.stringify(parsedState.data, null, 2));
    }
  };

  // File Upload
  const handleFileUpload = (file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const text = e.target?.result as string;
      if (typeof text === 'string') {
        setInputCode(text);
        const nameWithoutExt = file.name.replace(/\.[^/.]+$/, '');
        if (nameWithoutExt && isValidIdentifier(nameWithoutExt)) {
          setOptions((prev) => ({ ...prev, rootName: capitalize(nameWithoutExt) }));
        }
      }
    };
    reader.readAsText(file);
  };

  // Telemetry stats
  const inputLines = inputCode ? inputCode.split('\n').length : 0;
  const outputLines = generationResult.code ? generationResult.code.split('\n').length : 0;

  const formatBadge = useMemo(() => {
    switch (parsedState.format) {
      case 'python-dict':
        return { label: '🐍 Python Dictionary', color: '#4ade80' };
      case 'js-object':
        return { label: '⚡ JavaScript Object Literal', color: '#facc15' };
      case 'json-schema':
        return { label: '📜 JSON Schema Specification', color: '#38bdf8' };
      default:
        return { label: '📋 Standard JSON', color: '#60a5fa' };
    }
  }, [parsedState.format]);

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
                color: formatBadge.color,
                backgroundColor: `${formatBadge.color}18`,
                border: `1px solid ${formatBadge.color}40`,
                borderRadius: '9999px',
                padding: '4px 12px',
              }}
            >
              <Sparkles size={12} />
              {formatBadge.label}
            </span>

            <span
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                fontSize: '0.75rem',
                fontWeight: 600,
                color: '#c084fc',
                backgroundColor: 'rgba(192, 132, 252, 0.1)',
                border: '1px solid rgba(192, 132, 252, 0.3)',
                borderRadius: '9999px',
                padding: '4px 12px',
              }}
            >
              <Layers size={12} />
              Multi-Sample Array Consolidation
            </span>
          </div>

          {/* Presets Bar */}
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
            <div style={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: '8px' }}>
              <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 600 }}>
                {tUI('presets')}:
              </span>
              <button
                type="button"
                onClick={() => handleLoadPreset('python')}
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
                {tUI('presetPython')}
              </button>
              <button
                type="button"
                onClick={() => handleLoadPreset('jsobject')}
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
                {tUI('presetJsObject')}
              </button>
              <button
                type="button"
                onClick={() => handleLoadPreset('arrayMulti')}
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
                {tUI('presetArray')}
              </button>
              <button
                type="button"
                onClick={() => handleLoadPreset('jsonSchema')}
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
                {tUI('presetJsonSchema')}
              </button>
            </div>

            <button
              type="button"
              onClick={() => setInputCode('')}
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

          {/* Configuration Settings Bar */}
          <div
            style={{
              backgroundColor: 'var(--bg-card)',
              border: '1px solid var(--border-color)',
              borderRadius: '12px',
              padding: '14px 18px',
              marginBottom: '16px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              flexWrap: 'wrap',
              gap: '14px',
            }}
          >
            {/* Root Type Name */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Settings size={15} color="#60a5fa" />
              <label style={{ fontSize: '0.78rem', color: 'var(--text-main)', fontWeight: 600 }}>
                {tUI('rootName')}:
              </label>
              <input
                type="text"
                value={options.rootName}
                onChange={(e) => setOptions((prev) => ({ ...prev, rootName: e.target.value }))}
                style={{
                  backgroundColor: 'var(--bg-page)',
                  border: '1px solid var(--border-color)',
                  borderRadius: '6px',
                  color: 'var(--text-main)',
                  padding: '4px 10px',
                  fontSize: '0.8rem',
                  fontFamily: 'monospace',
                  width: '140px',
                  outline: 'none',
                }}
              />
            </div>

            {/* Declaration Style */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)', fontWeight: 600 }}>
                {tUI('declarationStyle')}:
              </span>
              <div
                style={{
                  display: 'flex',
                  backgroundColor: 'var(--bg-page)',
                  borderRadius: '6px',
                  padding: '2px',
                }}
              >
                <button
                  type="button"
                  onClick={() => setOptions((prev) => ({ ...prev, declarationType: 'interface' }))}
                  style={{
                    padding: '4px 10px',
                    borderRadius: '4px',
                    fontSize: '0.75rem',
                    fontWeight: 600,
                    border: 'none',
                    cursor: 'pointer',
                    backgroundColor:
                      options.declarationType === 'interface'
                        ? 'rgba(59, 130, 246, 0.25)'
                        : 'transparent',
                    color:
                      options.declarationType === 'interface' ? '#60a5fa' : 'var(--text-muted)',
                  }}
                >
                  interface
                </button>
                <button
                  type="button"
                  onClick={() => setOptions((prev) => ({ ...prev, declarationType: 'type' }))}
                  style={{
                    padding: '4px 10px',
                    borderRadius: '4px',
                    fontSize: '0.75rem',
                    fontWeight: 600,
                    border: 'none',
                    cursor: 'pointer',
                    backgroundColor:
                      options.declarationType === 'type'
                        ? 'rgba(59, 130, 246, 0.25)'
                        : 'transparent',
                    color: options.declarationType === 'type' ? '#60a5fa' : 'var(--text-muted)',
                  }}
                >
                  type alias
                </button>
              </div>
            </div>

            {/* Toggles */}
            <div style={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: '14px' }}>
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
                  checked={options.exportKeyword}
                  onChange={(e) =>
                    setOptions((prev) => ({ ...prev, exportKeyword: e.target.checked }))
                  }
                  style={{ cursor: 'pointer' }}
                />
                <span>export</span>
              </label>

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
                  checked={options.readonlyFields}
                  onChange={(e) =>
                    setOptions((prev) => ({ ...prev, readonlyFields: e.target.checked }))
                  }
                  style={{ cursor: 'pointer' }}
                />
                <span>readonly</span>
              </label>

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
                  checked={options.includeExamples}
                  onChange={(e) =>
                    setOptions((prev) => ({ ...prev, includeExamples: e.target.checked }))
                  }
                  style={{ cursor: 'pointer' }}
                />
                <span>JSDoc @example</span>
              </label>
            </div>
          </div>

          {/* Main 2-Column Workspace */}
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
              {/* Left Column: Input Panel */}
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
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px',
                    }}
                  >
                    <Code size={15} color="#60a5fa" />
                    {tUI('jsonInput')}
                  </label>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span
                      style={{
                        fontSize: '0.72rem',
                        color: 'var(--text-muted)',
                        fontFamily: 'monospace',
                      }}
                    >
                      {inputLines} Lines
                    </span>

                    <button
                      type="button"
                      onClick={handleBeautifyInput}
                      title={tUI('beautify')}
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
                      <Wand2 size={11} />
                      {tUI('beautify')}
                    </button>

                    <input
                      type="file"
                      ref={fileInputRef}
                      onChange={(e) => {
                        if (e.target.files && e.target.files[0]) {
                          handleFileUpload(e.target.files[0]);
                        }
                      }}
                      accept=".json,.js,.py,.txt"
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
                  value={inputCode}
                  onChange={(e) => setInputCode(e.target.value)}
                  rows={16}
                  placeholder={tUI('jsonPlaceholder')}
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
                    minHeight: '320px',
                    lineHeight: '1.45',
                  }}
                />
              </div>

              {/* Right Column: Output TypeScript Panel */}
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
                      color: '#34d399',
                      fontSize: '0.875rem',
                      fontWeight: 600,
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px',
                    }}
                  >
                    <FileCode size={15} />
                    {tUI('tsOutput')}
                  </label>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span
                      style={{
                        fontSize: '0.72rem',
                        color: 'var(--text-muted)',
                        fontFamily: 'monospace',
                      }}
                    >
                      {outputLines} Lines | {generationResult.interfacesCount} Interfaces
                    </span>

                    <button
                      type="button"
                      onClick={handleCopy}
                      disabled={!generationResult.code}
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '4px',
                        padding: '3px 8px',
                        borderRadius: '4px',
                        fontSize: '0.72rem',
                        fontWeight: 600,
                        backgroundColor: generationResult.code
                          ? 'rgba(59, 130, 246, 0.15)'
                          : 'rgba(255,255,255,0.05)',
                        border: '1px solid rgba(59, 130, 246, 0.3)',
                        color: generationResult.code ? '#60a5fa' : 'var(--text-muted)',
                        cursor: generationResult.code ? 'pointer' : 'not-allowed',
                      }}
                    >
                      {copied ? <Check size={11} /> : <Copy size={11} />}
                      {copied ? tUI('copied') : tUI('copyTs')}
                    </button>

                    <button
                      type="button"
                      onClick={handleDownload}
                      disabled={!generationResult.code}
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '4px',
                        padding: '3px 8px',
                        borderRadius: '4px',
                        fontSize: '0.72rem',
                        fontWeight: 600,
                        backgroundColor: generationResult.code
                          ? 'rgba(52, 211, 153, 0.15)'
                          : 'rgba(255,255,255,0.05)',
                        border: '1px solid rgba(52, 211, 153, 0.3)',
                        color: generationResult.code ? '#34d399' : 'var(--text-muted)',
                        cursor: generationResult.code ? 'pointer' : 'not-allowed',
                      }}
                    >
                      <Download size={11} />
                      {tUI('download')}
                    </button>
                  </div>
                </div>

                <textarea
                  value={generationResult.code}
                  readOnly
                  rows={16}
                  placeholder={tUI('tsPlaceholder')}
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
                    minHeight: '320px',
                    lineHeight: '1.45',
                  }}
                />
              </div>
            </div>

            {/* Error Diagnostics Banner */}
            {parsedState.error && (
              <div
                style={{
                  marginTop: '16px',
                  backgroundColor: 'rgba(239, 68, 68, 0.1)',
                  border: '1px solid rgba(239, 68, 68, 0.3)',
                  borderRadius: '8px',
                  padding: '12px 16px',
                  color: '#f87171',
                  fontSize: '0.82rem',
                }}
              >
                ❌ {tUI('invalidJson', { message: parsedState.error })}
              </div>
            )}
          </div>

          {/* Tool SEO Content Section */}
          <ToolSeoContent
            toolSlug="json-to-typescript-interface-generator"
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
