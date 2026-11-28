'use client';

import React, { useState, useMemo, useRef } from 'react';
import { useTranslations } from 'next-intl';
import { GlobalContainer } from '@/components/layout';
import { SectionHeading } from '@/components/ui';
import { ToolSeoContent } from '@/features/tools/sections/ToolSeoContent';
import { Copy, Check, Download, Upload, Trash2, Sparkles, FileCode, Layers } from 'lucide-react';

type ModelMode = 'pydantic_v2' | 'dataclass' | 'pydantic_v1';

interface FieldInfo {
  name: string;
  pyType: string;
  isOptional: boolean;
  needsAlias: boolean;
  alias: string;
  defaultValue?: string;
}

interface ModelClass {
  className: string;
  fields: FieldInfo[];
}

const PYTHON_RESERVED_WORDS = new Set([
  'False',
  'None',
  'True',
  'and',
  'as',
  'assert',
  'async',
  'await',
  'break',
  'class',
  'continue',
  'def',
  'del',
  'elif',
  'else',
  'except',
  'finally',
  'for',
  'from',
  'global',
  'if',
  'import',
  'in',
  'is',
  'lambda',
  'nonlocal',
  'not',
  'or',
  'pass',
  'raise',
  'return',
  'try',
  'while',
  'with',
  'yield',
  'id',
  'type',
  'input',
  'list',
  'dict',
  'set',
  'str',
  'int',
  'float',
  'bool',
]);

const ISO_DATE_REGEX = /^\d{4}-\d{2}-\d{2}(T\d{2}:\d{2}:\d{2}(\.\d+)?(Z|[+-]\d{2}:\d{2})?)?$/;
const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const EMAIL_REGEX = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

function toSnakeCase(str: string): string {
  return str
    .replace(/([a-z\d])([A-Z])/g, '$1_$2')
    .replace(/[-\s.]+/g, '_')
    .toLowerCase();
}

function toPascalCase(str: string): string {
  return str
    .replace(/[-_.\s]+(.)?/g, (_, c) => (c ? c.toUpperCase() : ''))
    .replace(/^[a-z]/, (c) => c.toUpperCase());
}

function sanitizeFieldName(
  key: string,
  useSnakeCase: boolean
): { fieldName: string; needsAlias: boolean; alias: string } {
  let name = useSnakeCase ? toSnakeCase(key) : key;
  name = name.replace(/[^a-zA-Z0-9_]/g, '_');
  if (/^[0-9]/.test(name)) {
    name = '_' + name;
  }
  let needsAlias = name !== key;
  if (PYTHON_RESERVED_WORDS.has(name)) {
    name = `${name}_`;
    needsAlias = true;
  }
  return { fieldName: name, needsAlias, alias: key };
}

// Relaxed JSON / Python Dict / JS Object Parser
function parseRelaxedInput(raw: string): { parsed: unknown; usedRelaxed: boolean } {
  try {
    return { parsed: JSON.parse(raw), usedRelaxed: false };
  } catch (err) {
    // 1. Python dictionary normalization (True, False, None)
    const pythonNormalized = raw
      .replace(/:\s*True\b/g, ': true')
      .replace(/:\s*False\b/g, ': false')
      .replace(/:\s*None\b/g, ': null')
      .replace(/\[\s*True\b/g, '[true')
      .replace(/\[\s*False\b/g, '[false')
      .replace(/\[\s*None\b/g, '[null');
    try {
      return { parsed: JSON.parse(pythonNormalized), usedRelaxed: true };
    } catch {
      // 2. Safe JS Object Literal evaluation
      try {
        const fn = new Function(`"use strict"; return (${raw});`);
        return { parsed: fn(), usedRelaxed: true };
      } catch {
        throw err;
      }
    }
  }
}

// Quick Sample Presets
const SAMPLE_PRESETS = {
  userProfile: {
    label: 'User & Auth Profile (camelCase & Field Aliases)',
    data: JSON.stringify(
      {
        userId: 1042,
        userName: 'alex_mercer',
        emailAddress: 'alex.mercer@velnoxlabs.com',
        isVerified: true,
        accountUuid: '9b1deb4d-3b7d-4bad-9bdd-2b0d7b3dcb6d',
        createdAt: '2026-11-28T09:30:00Z',
        roles: ['admin', 'developer'],
        settings: {
          themeMode: 'dark',
          emailNotifications: true,
          refreshIntervalMs: 5000,
        },
        dynamicMetadata: {},
        class: 'enterprise_tier',
      },
      null,
      2
    ),
  },
  ecommerceOrder: {
    label: 'E-Commerce Order (Multi-Sample Array)',
    data: JSON.stringify(
      {
        orderId: 'ORD-98214',
        currency: 'USD',
        totalAmount: 189.5,
        discountApplied: null,
        items: [
          {
            sku: 'KB-PRO-RGB',
            name: 'Mechanical Gaming Keyboard',
            price: 129.99,
            quantity: 1,
            warrantyYears: 2,
          },
          {
            sku: 'MS-ULTRA-WL',
            name: 'Wireless Ergonomic Mouse',
            price: 59.51,
            quantity: 1,
            colorVariant: 'Matte Black',
          },
        ],
      },
      null,
      2
    ),
  },
  pythonDict: {
    label: 'Python Dict / FastAPI (True, False, None)',
    data: `{\n  'status': 'healthy',\n  'debug_mode': True,\n  'maintenance_active': False,\n  'last_backup': None,\n  'worker_threads': 8,\n  'active_regions': ['us-east', 'eu-central', 'ap-south'],\n  'cluster_metadata': {'version': '2.4.0', 'ready': True}\n}`,
  },
  analyticsJsonValue: {
    label: 'Dynamic Analytics (JsonValue & Arbitrary Fields)',
    data: JSON.stringify(
      {
        eventName: 'checkout_completed',
        timestamp: '2026-11-28T10:15:32Z',
        rawPayload: {
          cartId: 'c_8892',
          browserEngine: 'Gecko/Firefox',
          customDimensions: { abTestVariant: 'B', sourceCampaign: 'winter_sale' },
        },
        arbitraryStats: null,
      },
      null,
      2
    ),
  },
};

export default function JsonToPydanticPage() {
  const tUI = useTranslations('ToolUI.jsonToPydantic');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [input, setInput] = useState<string>(SAMPLE_PRESETS.userProfile.data);
  const [modelMode, setModelMode] = useState<ModelMode>('pydantic_v2');
  const [rootName, setRootName] = useState<string>('RootModel');
  const [useSnakeCase, setUseSnakeCase] = useState<boolean>(true);
  const [useModernTypes, setUseModernTypes] = useState<boolean>(true); // Python 3.10+ | syntax
  const [detectSmartTypes, setDetectSmartTypes] = useState<boolean>(true); // datetime, UUID, EmailStr
  const [includeValidationCode, setIncludeValidationCode] = useState<boolean>(true);
  const [copied, setCopied] = useState<boolean>(false);
  const [isDragging, setIsDragging] = useState<boolean>(false);

  // Conversion Engine
  const conversionResult = useMemo(() => {
    const raw = input.trim();
    if (!raw) {
      return { code: '', error: null, usedRelaxed: false, modelCount: 0 };
    }

    try {
      const { parsed, usedRelaxed } = parseRelaxedInput(raw);
      const modelsMap = new Map<string, ModelClass>();
      const imports = new Set<string>();
      const pydanticImports = new Set<string>();

      if (modelMode === 'pydantic_v2') {
        pydanticImports.add('BaseModel');
      } else if (modelMode === 'pydantic_v1') {
        pydanticImports.add('BaseModel');
      } else {
        imports.add('dataclass');
      }

      function resolveType(val: unknown, hintName: string): string {
        if (val === null || val === undefined) {
          return useModernTypes ? 'Any | None' : 'Optional[Any]';
        }

        if (typeof val === 'string') {
          if (detectSmartTypes) {
            if (EMAIL_REGEX.test(val)) {
              if (modelMode !== 'dataclass') {
                pydanticImports.add('EmailStr');
                return 'EmailStr';
              }
              return 'str';
            }
            if (UUID_REGEX.test(val)) {
              imports.add('UUID');
              return 'UUID';
            }
            if (ISO_DATE_REGEX.test(val)) {
              imports.add('datetime');
              return 'datetime';
            }
          }
          return 'str';
        }

        if (typeof val === 'number') {
          return Number.isInteger(val) ? 'int' : 'float';
        }

        if (typeof val === 'boolean') {
          return 'bool';
        }

        // Array / List resolution with multi-sample analysis
        if (Array.isArray(val)) {
          if (val.length === 0) {
            return modelMode === 'dataclass' || !useModernTypes ? 'list[Any]' : 'list[Any]';
          }

          // Sample types
          const itemTypes = new Set<string>();
          const objectSamples: Record<string, unknown>[] = [];

          for (const item of val) {
            if (item && typeof item === 'object' && !Array.isArray(item)) {
              objectSamples.push(item as Record<string, unknown>);
            } else {
              itemTypes.add(resolveType(item, `${hintName}Item`));
            }
          }

          if (objectSamples.length > 0) {
            const nestedClassName = toPascalCase(`${hintName}Item`);
            extractModel(objectSamples, nestedClassName);
            itemTypes.add(nestedClassName);
          }

          const typesArr = Array.from(itemTypes);
          if (typesArr.length === 1) {
            return `list[${typesArr[0]}]`;
          }
          if (useModernTypes) {
            return `list[${typesArr.join(' | ')}]`;
          }
          imports.add('Union');
          return `list[Union[${typesArr.join(', ')}]]`;
        }

        // Object resolution
        if (typeof val === 'object') {
          const keys = Object.keys(val as Record<string, unknown>);
          if (keys.length === 0) {
            // Empty / dynamic dictionary
            if (modelMode === 'pydantic_v2') {
              pydanticImports.add('JsonValue');
              return 'JsonValue';
            }
            return 'dict[str, Any]';
          }

          const nestedClassName = toPascalCase(hintName);
          extractModel([val as Record<string, unknown>], nestedClassName);
          return nestedClassName;
        }

        return 'Any';
      }

      function extractModel(samples: Record<string, unknown>[], className: string) {
        if (modelsMap.has(className)) return;

        // Consolidate all fields across samples
        const allKeys = new Set<string>();
        for (const s of samples) {
          for (const k of Object.keys(s)) {
            allKeys.add(k);
          }
        }

        const fields: FieldInfo[] = [];

        for (const key of allKeys) {
          const { fieldName, needsAlias, alias } = sanitizeFieldName(key, useSnakeCase);
          let appearances = 0;
          const values: unknown[] = [];

          for (const s of samples) {
            if (key in s) {
              appearances++;
              values.push(s[key]);
            }
          }

          const isOptional = appearances < samples.length || values.some((v) => v === null);
          const nonNullVal = values.find((v) => v !== null && v !== undefined);
          let pyType =
            nonNullVal !== undefined ? resolveType(nonNullVal, `${className}_${key}`) : 'Any';

          if (isOptional) {
            if (useModernTypes) {
              if (!pyType.includes('None')) {
                pyType = `${pyType} | None`;
              }
            } else {
              imports.add('Optional');
              if (!pyType.startsWith('Optional[')) {
                pyType = `Optional[${pyType}]`;
              }
            }
          }

          if (needsAlias && modelMode !== 'dataclass') {
            pydanticImports.add('Field');
          }

          fields.push({
            name: fieldName,
            pyType,
            isOptional,
            needsAlias,
            alias,
          });
        }

        modelsMap.set(className, { className, fields });
      }

      // Root extraction
      const cleanRootName = toPascalCase(rootName.trim() || 'RootModel');

      if (Array.isArray(parsed)) {
        if (parsed.length === 0) {
          const rootFields: FieldInfo[] = [
            {
              name: 'items',
              pyType: 'list[Any]',
              isOptional: false,
              needsAlias: false,
              alias: 'items',
            },
          ];
          modelsMap.set(cleanRootName, { className: cleanRootName, fields: rootFields });
        } else {
          const objectSamples = parsed.filter(
            (it) => it && typeof it === 'object' && !Array.isArray(it)
          ) as Record<string, unknown>[];

          if (objectSamples.length > 0) {
            extractModel(objectSamples, `${cleanRootName}Item`);
            const rootFields: FieldInfo[] = [
              {
                name: 'items',
                pyType: `list[${cleanRootName}Item]`,
                isOptional: false,
                needsAlias: false,
                alias: 'items',
              },
            ];
            modelsMap.set(cleanRootName, { className: cleanRootName, fields: rootFields });
          } else {
            const sampleType = resolveType(parsed[0], `${cleanRootName}Item`);
            const rootFields: FieldInfo[] = [
              {
                name: 'items',
                pyType: `list[${sampleType}]`,
                isOptional: false,
                needsAlias: false,
                alias: 'items',
              },
            ];
            modelsMap.set(cleanRootName, { className: cleanRootName, fields: rootFields });
          }
        }
      } else if (parsed && typeof parsed === 'object') {
        extractModel([parsed as Record<string, unknown>], cleanRootName);
      } else {
        const rootFields: FieldInfo[] = [
          {
            name: 'value',
            pyType: resolveType(parsed, cleanRootName),
            isOptional: false,
            needsAlias: false,
            alias: 'value',
          },
        ];
        modelsMap.set(cleanRootName, { className: cleanRootName, fields: rootFields });
      }

      // Generate Code
      const codeLines: string[] = [];

      // 1. Imports
      const standardImports: string[] = [];
      if (modelMode === 'dataclass') {
        standardImports.push('from dataclasses import dataclass, field');
      }

      if (detectSmartTypes) {
        if (imports.has('datetime')) standardImports.push('from datetime import datetime');
        if (imports.has('UUID')) standardImports.push('from uuid import UUID');
      }

      const typingImports = Array.from(imports).filter(
        (i) => i !== 'dataclass' && i !== 'datetime' && i !== 'UUID'
      );
      if (typingImports.length > 0) {
        standardImports.push(`from typing import ${typingImports.sort().join(', ')}`);
      }

      if (modelMode === 'pydantic_v2' || modelMode === 'pydantic_v1') {
        const pImports = Array.from(pydanticImports).sort();
        standardImports.push(`from pydantic import ${pImports.join(', ')}`);
      }

      if (standardImports.length > 0) {
        codeLines.push(standardImports.join('\n'));
        codeLines.push('\n');
      }

      // 2. Class Definitions (Reverse order so dependencies precede root)
      const allClasses = Array.from(modelsMap.values());
      const orderedClasses = allClasses.sort((a, b) => {
        if (a.className === cleanRootName) return 1;
        if (b.className === cleanRootName) return -1;
        return 0;
      });

      for (const cls of orderedClasses) {
        if (modelMode === 'dataclass') {
          codeLines.push(`@dataclass\nclass ${cls.className}:`);
        } else {
          codeLines.push(`class ${cls.className}(BaseModel):`);
        }

        if (cls.fields.length === 0) {
          codeLines.push('    pass\n');
          continue;
        }

        for (const f of cls.fields) {
          if (modelMode === 'dataclass') {
            if (f.isOptional) {
              codeLines.push(`    ${f.name}: ${f.pyType} = None`);
            } else if (f.pyType.startsWith('list[')) {
              codeLines.push(`    ${f.name}: ${f.pyType} = field(default_factory=list)`);
            } else if (f.pyType.startsWith('dict[')) {
              codeLines.push(`    ${f.name}: ${f.pyType} = field(default_factory=dict)`);
            } else {
              codeLines.push(`    ${f.name}: ${f.pyType}`);
            }
          } else {
            // Pydantic V2 / V1
            const parts: string[] = [];
            if (f.needsAlias) {
              parts.push(`alias="${f.alias}"`);
            }
            if (f.isOptional) {
              parts.push('default=None');
            }

            if (parts.length > 0) {
              if (!f.isOptional && f.needsAlias) {
                codeLines.push(`    ${f.name}: ${f.pyType} = Field(..., ${parts.join(', ')})`);
              } else {
                codeLines.push(`    ${f.name}: ${f.pyType} = Field(${parts.join(', ')})`);
              }
            } else {
              codeLines.push(`    ${f.name}: ${f.pyType}`);
            }
          }
        }
        codeLines.push('\n');
      }

      // 3. Optional Executable Validation Code Snippet
      if (includeValidationCode) {
        codeLines.push('\n# =========================================================');
        codeLines.push('# Executable Usage Example & Serialization:');
        codeLines.push('# =========================================================');

        if (modelMode === 'pydantic_v2') {
          codeLines.push('# from pydantic import ValidationError\n#');
          codeLines.push(
            "# json_payload = '''{\"" + (allClasses[0]?.fields[0]?.alias || 'id') + "\": ...}'''\n#"
          );
          codeLines.push(
            `# 1. High-Performance JSON Deserialization (Rust Engine):\n# record = ${cleanRootName}.model_validate_json(json_payload)`
          );
          codeLines.push('# print(record)\n#');
          codeLines.push(
            `# 2. Serialization back to JSON:\n# json_output = record.model_dump_json(indent=2, by_alias=True)\n# print(json_output)`
          );
        } else if (modelMode === 'dataclass') {
          codeLines.push('# import json\n# from dataclasses import asdict\n#');
          codeLines.push(
            "# json_payload = '''{\"" + (allClasses[0]?.fields[0]?.alias || 'id') + "\": ...}'''\n#"
          );
          codeLines.push(
            `# 1. Deserialization via Standard Library:\n# data_dict = json.loads(json_payload)\n# record = ${cleanRootName}(**data_dict)`
          );
          codeLines.push('# print(record)\n#');
          codeLines.push(
            '# 2. Convert to dictionary:\n# dict_output = asdict(record)\n# print(dict_output)'
          );
        } else {
          codeLines.push(
            "# json_payload = '''{\"" + (allClasses[0]?.fields[0]?.alias || 'id') + "\": ...}'''\n#"
          );
          codeLines.push(
            `# record = ${cleanRootName}.parse_raw(json_payload)\n# print(record.json())`
          );
        }
      }

      return {
        code: codeLines.join('\n').trim(),
        error: null,
        usedRelaxed,
        modelCount: allClasses.length,
      };
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      return {
        code: '',
        error: msg,
        usedRelaxed: false,
        modelCount: 0,
      };
    }
  }, [
    input,
    modelMode,
    rootName,
    useSnakeCase,
    useModernTypes,
    detectSmartTypes,
    includeValidationCode,
  ]);

  // Copy code handler
  const handleCopy = () => {
    if (!conversionResult.code) return;
    navigator.clipboard.writeText(conversionResult.code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Download Python file handler
  const handleDownload = () => {
    if (!conversionResult.code) return;
    const cleanFileName = toSnakeCase(rootName.trim() || 'models') + '.py';
    const blob = new Blob([conversionResult.code], { type: 'text/x-python' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = cleanFileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  // File upload handler
  const handleFileUpload = (file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const text = e.target?.result as string;
      if (typeof text === 'string') {
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

  // Load Preset
  const handleLoadPreset = (key: keyof typeof SAMPLE_PRESETS) => {
    const p = SAMPLE_PRESETS[key];
    setInput(p.data);
  };

  // Format JSON
  const handleBeautify = () => {
    try {
      const { parsed } = parseRelaxedInput(input);
      setInput(JSON.stringify(parsed, null, 2));
    } catch {
      // ignore
    }
  };

  // Telemetry stats
  const inputLines = input ? input.split('\n').length : 0;
  const outputLines = conversionResult.code ? conversionResult.code.split('\n').length : 0;
  const inputBytes = new Blob([input]).size;
  const outputBytes = new Blob([conversionResult.code]).size;

  return (
    <>
      <GlobalContainer maxWidth="2xl">
        <div style={{ paddingTop: 'var(--space-8)', paddingBottom: 'var(--space-16)' }}>
          {/* Header & Badges */}
          <SectionHeading
            title={tUI('title')}
            subtitle={tUI('subtitle')}
            toolSlug="json-to-pydantic-&-python-dataclass-generator"
          />

          <div
            style={{
              display: 'flex',
              flexWrap: 'wrap',
              gap: '8px',
              justifyContent: 'center',
              marginTop: '12px',
              marginBottom: '20px',
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
                color: '#60a5fa',
                backgroundColor: 'rgba(96, 165, 250, 0.1)',
                border: '1px solid rgba(96, 165, 250, 0.3)',
                borderRadius: '9999px',
                padding: '4px 12px',
              }}
            >
              <Layers size={12} />
              {conversionResult.modelCount} {conversionResult.modelCount === 1 ? 'Model' : 'Models'}{' '}
              Generated
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

          {/* Preset Buttons Bar */}
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
                onClick={() => handleLoadPreset('userProfile')}
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
                {tUI('presetUser')}
              </button>
              <button
                type="button"
                onClick={() => handleLoadPreset('ecommerceOrder')}
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
                {tUI('presetOrder')}
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
                {tUI('presetPython')}
              </button>
              <button
                type="button"
                onClick={() => handleLoadPreset('analyticsJsonValue')}
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
                {tUI('presetDynamic')}
              </button>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <button
                type="button"
                onClick={handleBeautify}
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
                {tUI('beautify')}
              </button>
              <button
                type="button"
                onClick={() => setInput('')}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '4px',
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
          </div>

          {/* Mode Tabs & Configuration Options Bar */}
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
            {/* Mode Switcher */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <button
                type="button"
                onClick={() => setModelMode('pydantic_v2')}
                style={{
                  backgroundColor:
                    modelMode === 'pydantic_v2' ? 'rgba(59, 130, 246, 0.25)' : 'var(--bg-page)',
                  color: modelMode === 'pydantic_v2' ? '#60a5fa' : 'var(--text-muted)',
                  border:
                    modelMode === 'pydantic_v2'
                      ? '1px solid rgba(59, 130, 246, 0.4)'
                      : '1px solid var(--border-color)',
                  borderRadius: '6px',
                  padding: '6px 14px',
                  fontSize: '0.8rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                }}
              >
                {tUI('pydanticV2Tab')}
              </button>
              <button
                type="button"
                onClick={() => setModelMode('dataclass')}
                style={{
                  backgroundColor:
                    modelMode === 'dataclass' ? 'rgba(52, 211, 153, 0.25)' : 'var(--bg-page)',
                  color: modelMode === 'dataclass' ? '#34d399' : 'var(--text-muted)',
                  border:
                    modelMode === 'dataclass'
                      ? '1px solid rgba(52, 211, 153, 0.4)'
                      : '1px solid var(--border-color)',
                  borderRadius: '6px',
                  padding: '6px 14px',
                  fontSize: '0.8rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                }}
              >
                {tUI('dataclassTab')}
              </button>
              <button
                type="button"
                onClick={() => setModelMode('pydantic_v1')}
                style={{
                  backgroundColor:
                    modelMode === 'pydantic_v1' ? 'rgba(168, 85, 247, 0.25)' : 'var(--bg-page)',
                  color: modelMode === 'pydantic_v1' ? '#c084fc' : 'var(--text-muted)',
                  border:
                    modelMode === 'pydantic_v1'
                      ? '1px solid rgba(168, 85, 247, 0.4)'
                      : '1px solid var(--border-color)',
                  borderRadius: '6px',
                  padding: '6px 14px',
                  fontSize: '0.8rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                }}
              >
                {tUI('pydanticV1Tab')}
              </button>
            </div>

            {/* Root Model Name */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600 }}>
                {tUI('rootModelName')}:
              </span>
              <input
                type="text"
                value={rootName}
                onChange={(e) => setRootName(e.target.value)}
                placeholder="RootModel"
                style={{
                  backgroundColor: 'var(--bg-page)',
                  border: '1px solid var(--border-color)',
                  borderRadius: '6px',
                  color: 'var(--text-main)',
                  padding: '4px 8px',
                  fontSize: '0.75rem',
                  fontFamily: 'monospace',
                  width: '130px',
                  outline: 'none',
                }}
              />
            </div>

            {/* Checkbox Toggles */}
            <div style={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
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
                  checked={useSnakeCase}
                  onChange={(e) => setUseSnakeCase(e.target.checked)}
                  style={{ cursor: 'pointer' }}
                />
                <span>{tUI('snakeCaseOption')}</span>
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
                  checked={useModernTypes}
                  onChange={(e) => setUseModernTypes(e.target.checked)}
                  style={{ cursor: 'pointer' }}
                />
                <span>{tUI('modernTypesOption')}</span>
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
                  checked={detectSmartTypes}
                  onChange={(e) => setDetectSmartTypes(e.target.checked)}
                  style={{ cursor: 'pointer' }}
                />
                <span>{tUI('smartTypesOption')}</span>
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
                  checked={includeValidationCode}
                  onChange={(e) => setIncludeValidationCode(e.target.checked)}
                  style={{ cursor: 'pointer' }}
                />
                <span>{tUI('validationCodeOption')}</span>
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
              {/* Input Area */}
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
                      accept=".json,.py,.js,.txt"
                      style={{ display: 'none' }}
                    />

                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
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
                      Upload
                    </button>
                  </div>
                </div>

                <textarea
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  rows={18}
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
                    minHeight: '340px',
                    lineHeight: '1.45',
                  }}
                />
              </div>

              {/* Output Area */}
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
                      color: modelMode === 'dataclass' ? '#34d399' : '#60a5fa',
                      fontSize: '0.875rem',
                      fontWeight: 600,
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px',
                    }}
                  >
                    <FileCode size={15} />
                    {modelMode === 'dataclass' ? 'Python @dataclass' : 'Pydantic Models'}
                  </label>

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
                      disabled={!conversionResult.code}
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '4px',
                        padding: '3px 8px',
                        borderRadius: '4px',
                        fontSize: '0.72rem',
                        fontWeight: 600,
                        backgroundColor: conversionResult.code
                          ? 'rgba(59, 130, 246, 0.15)'
                          : 'rgba(255,255,255,0.05)',
                        border: '1px solid rgba(59, 130, 246, 0.3)',
                        color: conversionResult.code ? '#60a5fa' : 'var(--text-muted)',
                        cursor: conversionResult.code ? 'pointer' : 'not-allowed',
                      }}
                    >
                      {copied ? <Check size={11} /> : <Copy size={11} />}
                      {copied ? tUI('copied') : tUI('copyCode')}
                    </button>

                    <button
                      type="button"
                      onClick={handleDownload}
                      disabled={!conversionResult.code}
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '4px',
                        padding: '3px 8px',
                        borderRadius: '4px',
                        fontSize: '0.72rem',
                        fontWeight: 600,
                        backgroundColor: conversionResult.code
                          ? 'rgba(52, 211, 153, 0.15)'
                          : 'rgba(255,255,255,0.05)',
                        border: '1px solid rgba(52, 211, 153, 0.3)',
                        color: conversionResult.code ? '#34d399' : 'var(--text-muted)',
                        cursor: conversionResult.code ? 'pointer' : 'not-allowed',
                      }}
                    >
                      <Download size={11} />
                      {tUI('downloadPy')}
                    </button>
                  </div>
                </div>

                <textarea
                  value={conversionResult.code}
                  readOnly
                  rows={18}
                  placeholder={tUI('pyPlaceholder')}
                  style={{
                    width: '100%',
                    backgroundColor: 'var(--bg-page)',
                    border: '1px solid var(--border-color)',
                    borderRadius: '8px',
                    color: modelMode === 'dataclass' ? '#34d399' : '#60a5fa',
                    padding: '12px',
                    fontFamily: 'monospace',
                    fontSize: '0.82rem',
                    outline: 'none',
                    resize: 'vertical',
                    minHeight: '340px',
                    lineHeight: '1.45',
                  }}
                />
              </div>
            </div>

            {/* Error Message */}
            {conversionResult.error && (
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
                ❌ <strong>Syntax Parsing Error:</strong> {conversionResult.error}
              </div>
            )}
          </div>

          {/* SEO Content Section */}
          <ToolSeoContent
            toolSlug="json-to-pydantic-&-python-dataclass-generator"
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
