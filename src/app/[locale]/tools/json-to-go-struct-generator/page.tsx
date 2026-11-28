'use client';

import React, { useState, useMemo, useRef } from 'react';
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
  Settings,
  Code2,
} from 'lucide-react';

// Go Common Initialisms from standard golang/lint conventions
const GO_COMMON_INITIALISMS = new Set([
  'ACL',
  'API',
  'ASCII',
  'CPU',
  'CSS',
  'DNS',
  'EOF',
  'GUID',
  'HTML',
  'HTTP',
  'HTTPS',
  'ID',
  'IP',
  'JSON',
  'LHS',
  'QPS',
  'RAM',
  'RHS',
  'RPC',
  'SLA',
  'SMTP',
  'SQL',
  'SSH',
  'TCP',
  'TLS',
  'TTL',
  'UDP',
  'UI',
  'UID',
  'UUID',
  'URI',
  'URL',
  'UTF8',
  'VM',
  'XML',
  'XMPP',
  'XSRF',
  'XSS',
  'SIP',
  'RTSP',
]);

const GO_RESERVED_WORDS = new Set([
  'break',
  'case',
  'chan',
  'const',
  'continue',
  'default',
  'defer',
  'else',
  'fallthrough',
  'for',
  'func',
  'go',
  'goto',
  'if',
  'import',
  'interface',
  'map',
  'package',
  'range',
  'return',
  'select',
  'struct',
  'switch',
  'type',
  'var',
]);

const ISO_DATE_REGEX = /^\d{4}-\d{2}-\d{2}(T\d{2}:\d{2}:\d{2}(\.\d+)?(Z|[+-]\d{2}:\d{2})?)?$/;

// Convert key to idiomatic exported Go field name (PascalCase + Initialisms)
function toGoFieldName(key: string, useInitialisms: boolean = true): string {
  // Strip special symbols if leading (e.g. MongoDB _id -> ID)
  let cleanKey = key;
  if (cleanKey.startsWith('_')) {
    cleanKey = cleanKey.substring(1);
  }

  const words = cleanKey
    .replace(/([a-z0-9])([A-Z])/g, '$1 $2')
    .split(/[^a-zA-Z0-9]+/)
    .filter(Boolean);

  if (words.length === 0) return 'Field';

  const parts = words.map((w) => {
    const upper = w.toUpperCase();
    if (useInitialisms && GO_COMMON_INITIALISMS.has(upper)) {
      return upper;
    }
    return w.charAt(0).toUpperCase() + w.slice(1).toLowerCase();
  });

  let result = parts.join('');
  if (/^[0-9]/.test(result)) {
    result = 'X' + result;
  }
  if (GO_RESERVED_WORDS.has(result.toLowerCase())) {
    result = 'Go' + result;
  }
  return result;
}

// Singularize words for array element struct naming
function singularize(word: string): string {
  if (word.endsWith('ies')) return word.slice(0, -3) + 'y';
  if (/(ses|xes|zes|ches|shes)$/.test(word)) return word.slice(0, -2);
  if (word.endsWith('s') && !word.endsWith('ss')) return word.slice(0, -1);
  return word;
}

function toGoStructName(nameHint: string, useInitialisms: boolean = true): string {
  const singular = singularize(nameHint);
  return toGoFieldName(singular, useInitialisms);
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

// Preset samples for quick demonstration and testing
const SAMPLE_PRESETS = {
  userPayload: {
    label: 'User & Auth Payload (ID, URL, API, UUID & time.Time)',
    data: JSON.stringify(
      {
        user_id: 1042,
        user_name: 'alex_mercer',
        email_address: 'alex.mercer@velnoxlabs.com',
        api_url: 'https://api.velnoxlabs.com/v1',
        auth_token_uuid: '9b1deb4d-3b7d-4bad-9bdd-2b0d7b3dcb6d',
        ip_address: '192.168.1.100',
        created_at: '2026-11-28T09:30:00Z',
        is_active: true,
        avatar_url: null,
        roles: ['admin', 'developer'],
        http_status_code: 200,
      },
      null,
      2
    ),
  },
  ecommerceOrder: {
    label: 'E-Commerce Order (Multi-Sample Array & omitempty)',
    data: JSON.stringify(
      {
        order_id: 'ORD-98214',
        currency: 'USD',
        total_amount: 189.5,
        discount_code: null,
        created_at: '2026-11-28T10:15:00Z',
        items: [
          {
            sku: 'KB-PRO-RGB',
            name: 'Mechanical Gaming Keyboard',
            price: 129.99,
            quantity: 1,
            warranty_years: 2,
          },
          {
            sku: 'MS-ULTRA-WL',
            name: 'Wireless Ergonomic Mouse',
            price: 59.51,
            quantity: 1,
            color_variant: 'Matte Black',
          },
        ],
      },
      null,
      2
    ),
  },
  mongodbBson: {
    label: 'MongoDB BSON Document (_id, BSON tags & Cluster)',
    data: JSON.stringify(
      {
        _id: '67484df243e813a1e9481234',
        tenant_id: 8801,
        service_name: 'billing-pipeline',
        is_healthy: true,
        last_synced_at: '2026-11-28T11:45:00Z',
        replica_count: 3,
        cluster_config: {
          datacenter: 'us-east-1',
          dns_endpoint: 'k8s.internal.velnoxlabs.com',
          enable_tls: true,
          cpu_limit: 4.5,
        },
      },
      null,
      2
    ),
  },
  pythonDict: {
    label: 'Python Dict / Cloud Analytics (True, False, None)',
    data: `{\n  'event_id': 'evt_998124',\n  'system_ready': True,\n  'maintenance_window': False,\n  'error_log': None,\n  'cpu_percent': 42.8,\n  'active_nodes': ['node-01', 'node-02'],\n  'runtime_metadata': {'python_version': '3.12', 'os': 'linux'}\n}`,
  },
};

interface GeneratorOptions {
  packageName: string;
  rootStructName: string;
  useModernAny: boolean; // Go 1.18+ any vs interface{}
  useInitialisms: boolean; // ID, URL, API, UUID, IP
  detectDates: boolean; // time.Time + import "time"
  pointersForNull: boolean; // *string, *int64 for nullable/omitted
  useInt64: boolean; // int64 vs int
  nestedMode: 'separate' | 'inline';
  includeHelpers: boolean; // os.ReadFile + json.Unmarshal helpers
  tagJson: boolean;
  tagOmitempty: boolean;
  tagBson: boolean;
  tagYaml: boolean;
  tagXml: boolean;
  tagGorm: boolean;
  tagDb: boolean;
}

interface StructField {
  rawKey: string;
  fieldName: string;
  fieldType: string;
  isOptional: boolean;
  isPointer: boolean;
}

interface GoStructMeta {
  name: string;
  fields: StructField[];
}

export default function JsonToGoPage() {
  const tUI = useTranslations('ToolUI.jsonToGoStruct');

  // Input state
  const [jsonInput, setJsonInput] = useState<string>(SAMPLE_PRESETS.userPayload.data);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Configuration options
  const [packageName, setPackageName] = useState('main');
  const [rootStructName, setRootStructName] = useState('AutoGenerated');
  const [useModernAny, setUseModernAny] = useState(true);
  const [useInitialisms, setUseInitialisms] = useState(true);
  const [detectDates, setDetectDates] = useState(true);
  const [pointersForNull, setPointersForNull] = useState(true);
  const [useInt64, setUseInt64] = useState(true);
  const [nestedMode, setNestedMode] = useState<'separate' | 'inline'>('separate');
  const [includeHelpers, setIncludeHelpers] = useState(false);

  // Struct Tags
  const [tagJson, setTagJson] = useState(true);
  const [tagOmitempty, setTagOmitempty] = useState(true);
  const [tagBson, setTagBson] = useState(false);
  const [tagYaml, setTagYaml] = useState(false);
  const [tagXml, setTagXml] = useState(false);
  const [tagGorm, setTagGorm] = useState(false);
  const [tagDb, setTagDb] = useState(false);

  // Output & UI state
  const [copied, setCopied] = useState(false);
  const [selectedPreset, setSelectedPreset] = useState<string>('userPayload');

  // Build options object
  const options: GeneratorOptions = useMemo(
    () => ({
      packageName: packageName.trim() || 'main',
      rootStructName: rootStructName.trim() || 'AutoGenerated',
      useModernAny,
      useInitialisms,
      detectDates,
      pointersForNull,
      useInt64,
      nestedMode,
      includeHelpers,
      tagJson,
      tagOmitempty,
      tagBson,
      tagYaml,
      tagXml,
      tagGorm,
      tagDb,
    }),
    [
      packageName,
      rootStructName,
      useModernAny,
      useInitialisms,
      detectDates,
      pointersForNull,
      useInt64,
      nestedMode,
      includeHelpers,
      tagJson,
      tagOmitempty,
      tagBson,
      tagYaml,
      tagXml,
      tagGorm,
      tagDb,
    ]
  );

  // Conversion logic
  const conversionResult = useMemo(() => {
    if (!jsonInput.trim()) {
      return { code: '', error: null, usedRelaxed: false, structCount: 0 };
    }

    try {
      const { parsed, usedRelaxed } = parseRelaxedInput(jsonInput);
      const anyType = options.useModernAny ? 'any' : 'interface{}';
      const intType = options.useInt64 ? 'int64' : 'int';
      let needsTimeImport = false;
      const namedStructs: Map<string, StructField[]> = new Map();

      // Format struct tags for a single field
      const formatTags = (rawKey: string, isOptional: boolean): string => {
        const tags: string[] = [];
        if (options.tagJson) {
          const omit = options.tagOmitempty && isOptional ? ',omitempty' : '';
          tags.push(`json:"${rawKey}${omit}"`);
        }
        if (options.tagBson) {
          const omit = options.tagOmitempty && isOptional ? ',omitempty' : '';
          tags.push(`bson:"${rawKey}${omit}"`);
        }
        if (options.tagYaml) {
          tags.push(`yaml:"${rawKey}"`);
        }
        if (options.tagXml) {
          tags.push(`xml:"${rawKey}"`);
        }
        if (options.tagGorm) {
          tags.push(`gorm:"column:${rawKey}"`);
        }
        if (options.tagDb) {
          tags.push(`db:"${rawKey}"`);
        }
        if (tags.length === 0) return '';
        return `\`${tags.join(' ')}\``;
      };

      // Consolidate objects across an array to capture union of all keys and optionality
      const consolidateArrayOfObjects = (arr: unknown[]): Record<string, unknown[]> => {
        const consolidated: Record<string, unknown[]> = {};
        const totalItems = arr.length;

        for (const item of arr) {
          if (typeof item === 'object' && item !== null && !Array.isArray(item)) {
            const obj = item as Record<string, unknown>;
            for (const [k, v] of Object.entries(obj)) {
              if (!consolidated[k]) {
                consolidated[k] = [];
              }
              consolidated[k].push(v);
            }
          }
        }

        // Pad keys that were absent in some items with undefined to signal optionality
        for (const values of Object.values(consolidated)) {
          if (values.length < totalItems) {
            values.push(undefined);
          }
        }

        return consolidated;
      };

      // Type resolution engine
      const resolveType = (
        val: unknown,
        nameHint: string,
        parentIsOptional: boolean
      ): { goType: string; isOptional: boolean } => {
        if (val === undefined || val === null) {
          return {
            goType: options.pointersForNull ? `*${anyType}` : anyType,
            isOptional: true,
          };
        }

        if (typeof val === 'string') {
          if (options.detectDates && ISO_DATE_REGEX.test(val)) {
            needsTimeImport = true;
            return {
              goType: parentIsOptional && options.pointersForNull ? '*time.Time' : 'time.Time',
              isOptional: parentIsOptional,
            };
          }
          return {
            goType: parentIsOptional && options.pointersForNull ? '*string' : 'string',
            isOptional: parentIsOptional,
          };
        }

        if (typeof val === 'number') {
          if (Number.isInteger(val)) {
            return {
              goType: parentIsOptional && options.pointersForNull ? `*${intType}` : intType,
              isOptional: parentIsOptional,
            };
          }
          return {
            goType: parentIsOptional && options.pointersForNull ? '*float64' : 'float64',
            isOptional: parentIsOptional,
          };
        }

        if (typeof val === 'boolean') {
          return {
            goType: parentIsOptional && options.pointersForNull ? '*bool' : 'bool',
            isOptional: parentIsOptional,
          };
        }

        // Array Handling
        if (Array.isArray(val)) {
          if (val.length === 0) {
            return { goType: `[]${anyType}`, isOptional: parentIsOptional };
          }

          // Check if array of objects -> consolidate
          const isObjectArray = val.some(
            (item) => typeof item === 'object' && item !== null && !Array.isArray(item)
          );

          if (isObjectArray) {
            const consolidated = consolidateArrayOfObjects(val);
            const itemStructName = toGoStructName(nameHint, options.useInitialisms);

            if (options.nestedMode === 'inline') {
              const inlineFields: StructField[] = [];
              for (const [k, sampleValues] of Object.entries(consolidated)) {
                const hasUndefinedOrNull = sampleValues.some((v) => v === undefined || v === null);
                const nonNullVal = sampleValues.find((v) => v !== undefined && v !== null);
                const fieldInfo = resolveType(nonNullVal, k, hasUndefinedOrNull);
                inlineFields.push({
                  rawKey: k,
                  fieldName: toGoFieldName(k, options.useInitialisms),
                  fieldType: fieldInfo.goType,
                  isOptional: fieldInfo.isOptional,
                  isPointer: fieldInfo.goType.startsWith('*'),
                });
              }

              // Build inline struct representation
              const fieldLines = inlineFields.map((f) => {
                const tagStr = formatTags(f.rawKey, f.isOptional);
                return `\t\t${f.fieldName} ${f.fieldType} ${tagStr}`.trimEnd();
              });

              return {
                goType: `[]struct {\n${fieldLines.join('\n')}\n\t}`,
                isOptional: parentIsOptional,
              };
            } else {
              // Separate named struct
              const fields: StructField[] = [];
              for (const [k, sampleValues] of Object.entries(consolidated)) {
                const hasUndefinedOrNull = sampleValues.some((v) => v === undefined || v === null);
                const nonNullVal = sampleValues.find((v) => v !== undefined && v !== null);
                const fieldInfo = resolveType(nonNullVal, k, hasUndefinedOrNull);
                fields.push({
                  rawKey: k,
                  fieldName: toGoFieldName(k, options.useInitialisms),
                  fieldType: fieldInfo.goType,
                  isOptional: fieldInfo.isOptional,
                  isPointer: fieldInfo.goType.startsWith('*'),
                });
              }
              namedStructs.set(itemStructName, fields);
              return { goType: `[]${itemStructName}`, isOptional: parentIsOptional };
            }
          } else {
            // Array of primitives or mixed items
            const itemTypes = Array.from(
              new Set(val.map((item) => resolveType(item, nameHint, false).goType))
            );
            if (itemTypes.length === 1) {
              return { goType: `[]${itemTypes[0]}`, isOptional: parentIsOptional };
            }
            return { goType: `[]${anyType}`, isOptional: parentIsOptional };
          }
        }

        // Single Object Handling
        if (typeof val === 'object' && val !== null) {
          const obj = val as Record<string, unknown>;
          const structName = toGoStructName(nameHint, options.useInitialisms);

          if (options.nestedMode === 'inline') {
            const inlineFields: StructField[] = [];
            for (const [k, v] of Object.entries(obj)) {
              const fieldInfo = resolveType(v, k, v === null);
              inlineFields.push({
                rawKey: k,
                fieldName: toGoFieldName(k, options.useInitialisms),
                fieldType: fieldInfo.goType,
                isOptional: fieldInfo.isOptional,
                isPointer: fieldInfo.goType.startsWith('*'),
              });
            }

            const fieldLines = inlineFields.map((f) => {
              const tagStr = formatTags(f.rawKey, f.isOptional);
              return `\t${f.fieldName} ${f.fieldType} ${tagStr}`.trimEnd();
            });

            return {
              goType: `struct {\n${fieldLines.join('\n')}\n}`,
              isOptional: parentIsOptional,
            };
          } else {
            const fields: StructField[] = [];
            for (const [k, v] of Object.entries(obj)) {
              const fieldInfo = resolveType(v, k, v === null);
              fields.push({
                rawKey: k,
                fieldName: toGoFieldName(k, options.useInitialisms),
                fieldType: fieldInfo.goType,
                isOptional: fieldInfo.isOptional,
                isPointer: fieldInfo.goType.startsWith('*'),
              });
            }
            namedStructs.set(structName, fields);
            return {
              goType: parentIsOptional && options.pointersForNull ? `*${structName}` : structName,
              isOptional: parentIsOptional,
            };
          }
        }

        return { goType: anyType, isOptional: parentIsOptional };
      };

      // Process Root Object
      let rootTypeDefinition = '';
      if (Array.isArray(parsed)) {
        if (parsed.length === 0) {
          rootTypeDefinition = `type ${options.rootStructName} []${anyType}`;
        } else {
          const isObjectArray = parsed.some(
            (item) => typeof item === 'object' && item !== null && !Array.isArray(item)
          );
          if (isObjectArray) {
            const consolidated = consolidateArrayOfObjects(parsed);
            const itemStructName = `${options.rootStructName}Item`;

            const fields: StructField[] = [];
            for (const [k, sampleValues] of Object.entries(consolidated)) {
              const hasUndefinedOrNull = sampleValues.some((v) => v === undefined || v === null);
              const nonNullVal = sampleValues.find((v) => v !== undefined && v !== null);
              const fieldInfo = resolveType(nonNullVal, k, hasUndefinedOrNull);
              fields.push({
                rawKey: k,
                fieldName: toGoFieldName(k, options.useInitialisms),
                fieldType: fieldInfo.goType,
                isOptional: fieldInfo.isOptional,
                isPointer: fieldInfo.goType.startsWith('*'),
              });
            }
            namedStructs.set(itemStructName, fields);
            rootTypeDefinition = `type ${options.rootStructName} []${itemStructName}`;
          } else {
            const itemType = resolveType(parsed[0], `${options.rootStructName}Item`, false).goType;
            rootTypeDefinition = `type ${options.rootStructName} []${itemType}`;
          }
        }
      } else if (typeof parsed === 'object' && parsed !== null) {
        const obj = parsed as Record<string, unknown>;
        const rootFields: StructField[] = [];
        for (const [k, v] of Object.entries(obj)) {
          const fieldInfo = resolveType(v, k, v === null);
          rootFields.push({
            rawKey: k,
            fieldName: toGoFieldName(k, options.useInitialisms),
            fieldType: fieldInfo.goType,
            isOptional: fieldInfo.isOptional,
            isPointer: fieldInfo.goType.startsWith('*'),
          });
        }
        namedStructs.set(options.rootStructName, rootFields);
      } else {
        const primitive = resolveType(parsed, options.rootStructName, false).goType;
        rootTypeDefinition = `type ${options.rootStructName} = ${primitive}`;
      }

      // Format all named structs with clean tabular alignment
      const formatStructBlock = (meta: GoStructMeta): string => {
        let maxFieldLen = 0;
        let maxTypeLen = 0;

        for (const f of meta.fields) {
          if (f.fieldName.length > maxFieldLen) maxFieldLen = f.fieldName.length;
          if (f.fieldType.length > maxTypeLen) maxTypeLen = f.fieldType.length;
        }

        const lines = meta.fields.map((f) => {
          const paddedName = f.fieldName.padEnd(maxFieldLen, ' ');
          const tagStr = formatTags(f.rawKey, f.isOptional);
          if (tagStr) {
            const paddedType = f.fieldType.padEnd(maxTypeLen, ' ');
            return `\t${paddedName} ${paddedType} ${tagStr}`;
          }
          return `\t${paddedName} ${f.fieldType}`;
        });

        return `type ${meta.name} struct {\n${lines.join('\n')}\n}`;
      };

      // Assemble code blocks
      const structBlocks: string[] = [];

      // If root is directly in namedStructs, place it first
      if (namedStructs.has(options.rootStructName)) {
        structBlocks.push(
          formatStructBlock({
            name: options.rootStructName,
            fields: namedStructs.get(options.rootStructName)!,
          })
        );
        namedStructs.delete(options.rootStructName);
      } else if (rootTypeDefinition) {
        structBlocks.push(rootTypeDefinition);
      }

      // Add remaining sub-structs
      for (const [name, fields] of namedStructs.entries()) {
        structBlocks.push(formatStructBlock({ name, fields }));
      }

      // Assemble Imports
      const imports: string[] = [];
      if (options.includeHelpers) {
        imports.push('"encoding/json"');
        imports.push('"fmt"');
        imports.push('"os"');
      }
      if (needsTimeImport) {
        imports.push('"time"');
      }

      let importsHeader = '';
      if (imports.length === 1) {
        importsHeader = `import ${imports[0]}\n\n`;
      } else if (imports.length > 1) {
        importsHeader = `import (\n\t${imports.join('\n\t')}\n)\n\n`;
      }

      // Helper functions: Golang read json file to struct & Unmarshal
      let helperCode = '';
      if (options.includeHelpers) {
        const root = options.rootStructName;
        helperCode = `\n\n// Read${root}FromFile reads a JSON file and unmarshals it into ${root}\nfunc Read${root}FromFile(filePath string) (*${root}, error) {\n\tbytes, err := os.ReadFile(filePath)\n\tif err != nil {\n\t\treturn nil, fmt.Errorf("failed to read JSON file %s: %w", filePath, err)\n\t}\n\n\tvar target ${root}\n\tif err := json.Unmarshal(bytes, &target); err != nil {\n\t\treturn nil, fmt.Errorf("failed to unmarshal JSON into ${root}: %w", err)\n\t}\n\n\treturn &target, nil\n}\n\n// ${root}FromJSON parses raw JSON bytes into ${root}\nfunc ${root}FromJSON(data []byte) (*${root}, error) {\n\tvar target ${root}\n\tif err := json.Unmarshal(data, &target); err != nil {\n\t\treturn nil, fmt.Errorf("failed to unmarshal JSON: %w", err)\n\t}\n\treturn &target, nil\n}\n\n// ToJSON serializes ${root} into indented JSON bytes\nfunc (s *${root}) ToJSON() ([]byte, error) {\n\treturn json.MarshalIndent(s, "", "  ")\n}`;
      }

      const fullSource = `package ${options.packageName}\n\n${importsHeader}${structBlocks.join(
        '\n\n'
      )}${helperCode}`;

      return {
        code: fullSource.trim(),
        error: null,
        usedRelaxed,
        structCount: structBlocks.length,
      };
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      return { code: '', error: msg, usedRelaxed: false, structCount: 0 };
    }
  }, [jsonInput, options]);

  // Telemetry counts
  const inputStats = useMemo(() => {
    return {
      chars: jsonInput.length,
      lines: jsonInput ? jsonInput.split('\n').length : 0,
    };
  }, [jsonInput]);

  const outputStats = useMemo(() => {
    return {
      chars: conversionResult.code.length,
      lines: conversionResult.code ? conversionResult.code.split('\n').length : 0,
    };
  }, [conversionResult.code]);

  // Actions
  const handleCopy = () => {
    if (!conversionResult.code) return;
    navigator.clipboard.writeText(conversionResult.code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    if (!conversionResult.code) return;
    const blob = new Blob([conversionResult.code], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    const fileName = `${options.rootStructName.toLowerCase() || 'model'}.go`;
    link.download = fileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleBeautify = () => {
    try {
      const { parsed } = parseRelaxedInput(jsonInput);
      setJsonInput(JSON.stringify(parsed, null, 2));
    } catch {
      // ignore if invalid
    }
  };

  const handleClear = () => {
    setJsonInput('');
  };

  const handlePresetSelect = (presetKey: keyof typeof SAMPLE_PRESETS) => {
    setSelectedPreset(presetKey);
    setJsonInput(SAMPLE_PRESETS[presetKey].data);
    if (presetKey === 'mongodbBson') {
      setTagBson(true);
      setRootStructName('MongoDocument');
    } else if (presetKey === 'ecommerceOrder') {
      setRootStructName('OrderResponse');
    } else if (presetKey === 'userPayload') {
      setRootStructName('UserProfile');
    } else if (presetKey === 'pythonDict') {
      setRootStructName('TelemetryEvent');
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      if (content) setJsonInput(content);
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      if (content) setJsonInput(content);
    };
    reader.readAsText(file);
  };

  return (
    <>
      <GlobalContainer maxWidth="2xl">
        <div style={{ paddingTop: 'var(--space-8)', paddingBottom: 'var(--space-16)' }}>
          <SectionHeading
            title={tUI('title')}
            subtitle={tUI('subtitle')}
            toolSlug="json-to-go-struct-generator"
          />

          {/* Preset Selector Bar */}
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
            {Object.entries(SAMPLE_PRESETS).map(([key]) => {
              const isSelected = selectedPreset === key;
              return (
                <button
                  key={key}
                  type="button"
                  onClick={() => handlePresetSelect(key as keyof typeof SAMPLE_PRESETS)}
                  style={{
                    padding: '4px 10px',
                    borderRadius: '6px',
                    fontSize: '0.75rem',
                    fontWeight: 500,
                    cursor: 'pointer',
                    backgroundColor: isSelected
                      ? 'rgba(59, 130, 246, 0.18)'
                      : 'rgba(255, 255, 255, 0.04)',
                    border: isSelected
                      ? '1px solid rgba(59, 130, 246, 0.4)'
                      : '1px solid var(--border-color)',
                    color: isSelected ? '#60a5fa' : 'var(--text-muted)',
                    transition: 'all 0.15s ease',
                  }}
                >
                  {key === 'userPayload' && tUI('presetUser')}
                  {key === 'ecommerceOrder' && tUI('presetEcommerce')}
                  {key === 'mongodbBson' && tUI('presetMongo')}
                  {key === 'pythonDict' && tUI('presetPython')}
                </button>
              );
            })}
          </div>

          {/* Configuration Card */}
          <div
            style={{
              backgroundColor: 'var(--bg-card)',
              border: '1px solid var(--border-color)',
              borderRadius: '12px',
              padding: '16px 20px',
              marginBottom: '16px',
            }}
          >
            {/* Top row: Struct Name, Package Name, Go Version, Nested Mode */}
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                gap: '16px',
                marginBottom: '14px',
              }}
            >
              <div>
                <label
                  style={{
                    display: 'block',
                    fontSize: '0.75rem',
                    fontWeight: 600,
                    color: 'var(--text-muted)',
                    marginBottom: '6px',
                  }}
                >
                  {tUI('rootStructName')}
                </label>
                <input
                  type="text"
                  value={rootStructName}
                  onChange={(e) => setRootStructName(e.target.value)}
                  placeholder="AutoGenerated"
                  style={{
                    width: '100%',
                    backgroundColor: 'var(--bg-page)',
                    border: '1px solid var(--border-color)',
                    borderRadius: '6px',
                    color: 'var(--text-main)',
                    padding: '6px 10px',
                    fontSize: '0.82rem',
                    fontFamily: 'monospace',
                    outline: 'none',
                  }}
                />
              </div>

              <div>
                <label
                  style={{
                    display: 'block',
                    fontSize: '0.75rem',
                    fontWeight: 600,
                    color: 'var(--text-muted)',
                    marginBottom: '6px',
                  }}
                >
                  {tUI('packageName')}
                </label>
                <input
                  type="text"
                  value={packageName}
                  onChange={(e) => setPackageName(e.target.value)}
                  placeholder="main"
                  style={{
                    width: '100%',
                    backgroundColor: 'var(--bg-page)',
                    border: '1px solid var(--border-color)',
                    borderRadius: '6px',
                    color: 'var(--text-main)',
                    padding: '6px 10px',
                    fontSize: '0.82rem',
                    fontFamily: 'monospace',
                    outline: 'none',
                  }}
                />
              </div>

              <div>
                <label
                  style={{
                    display: 'block',
                    fontSize: '0.75rem',
                    fontWeight: 600,
                    color: 'var(--text-muted)',
                    marginBottom: '6px',
                  }}
                >
                  {tUI('goVersion')}
                </label>
                <select
                  value={useModernAny ? 'modern' : 'legacy'}
                  onChange={(e) => setUseModernAny(e.target.value === 'modern')}
                  style={{
                    width: '100%',
                    backgroundColor: 'var(--bg-page)',
                    border: '1px solid var(--border-color)',
                    borderRadius: '6px',
                    color: 'var(--text-main)',
                    padding: '6px 10px',
                    fontSize: '0.82rem',
                    outline: 'none',
                    cursor: 'pointer',
                  }}
                >
                  <option value="modern">{tUI('goModern')}</option>
                  <option value="legacy">{tUI('goLegacy')}</option>
                </select>
              </div>

              <div>
                <label
                  style={{
                    display: 'block',
                    fontSize: '0.75rem',
                    fontWeight: 600,
                    color: 'var(--text-muted)',
                    marginBottom: '6px',
                  }}
                >
                  {tUI('nestedModeLabel')}
                </label>
                <select
                  value={nestedMode}
                  onChange={(e) => setNestedMode(e.target.value as 'separate' | 'inline')}
                  style={{
                    width: '100%',
                    backgroundColor: 'var(--bg-page)',
                    border: '1px solid var(--border-color)',
                    borderRadius: '6px',
                    color: 'var(--text-main)',
                    padding: '6px 10px',
                    fontSize: '0.82rem',
                    outline: 'none',
                    cursor: 'pointer',
                  }}
                >
                  <option value="separate">{tUI('nestedSeparate')}</option>
                  <option value="inline">{tUI('nestedInline')}</option>
                </select>
              </div>
            </div>

            {/* Struct Tag Checkboxes */}
            <div
              style={{
                paddingTop: '10px',
                borderTop: '1px solid var(--border-color)',
                display: 'flex',
                flexWrap: 'wrap',
                gap: '14px',
                alignItems: 'center',
              }}
            >
              <span
                style={{
                  fontSize: '0.75rem',
                  fontWeight: 600,
                  color: 'var(--text-muted)',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '4px',
                }}
              >
                <Settings size={13} />
                {tUI('structTags')}:
              </span>

              <label
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '5px',
                  fontSize: '0.75rem',
                  color: 'var(--text-main)',
                  cursor: 'pointer',
                }}
              >
                <input
                  type="checkbox"
                  checked={tagJson}
                  onChange={(e) => setTagJson(e.target.checked)}
                />
                <span>{tUI('tagJson')}</span>
              </label>

              <label
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '5px',
                  fontSize: '0.75rem',
                  color: tagJson ? 'var(--text-main)' : 'var(--text-muted)',
                  cursor: tagJson ? 'pointer' : 'not-allowed',
                }}
              >
                <input
                  type="checkbox"
                  checked={tagOmitempty}
                  disabled={!tagJson}
                  onChange={(e) => setTagOmitempty(e.target.checked)}
                />
                <span>{tUI('tagOmitempty')}</span>
              </label>

              <label
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '5px',
                  fontSize: '0.75rem',
                  color: 'var(--text-main)',
                  cursor: 'pointer',
                }}
              >
                <input
                  type="checkbox"
                  checked={tagBson}
                  onChange={(e) => setTagBson(e.target.checked)}
                />
                <span>{tUI('tagBson')}</span>
              </label>

              <label
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '5px',
                  fontSize: '0.75rem',
                  color: 'var(--text-main)',
                  cursor: 'pointer',
                }}
              >
                <input
                  type="checkbox"
                  checked={tagYaml}
                  onChange={(e) => setTagYaml(e.target.checked)}
                />
                <span>{tUI('tagYaml')}</span>
              </label>

              <label
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '5px',
                  fontSize: '0.75rem',
                  color: 'var(--text-main)',
                  cursor: 'pointer',
                }}
              >
                <input
                  type="checkbox"
                  checked={tagXml}
                  onChange={(e) => setTagXml(e.target.checked)}
                />
                <span>{tUI('tagXml')}</span>
              </label>

              <label
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '5px',
                  fontSize: '0.75rem',
                  color: 'var(--text-main)',
                  cursor: 'pointer',
                }}
              >
                <input
                  type="checkbox"
                  checked={tagGorm}
                  onChange={(e) => setTagGorm(e.target.checked)}
                />
                <span>{tUI('tagGorm')}</span>
              </label>

              <label
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '5px',
                  fontSize: '0.75rem',
                  color: 'var(--text-main)',
                  cursor: 'pointer',
                }}
              >
                <input
                  type="checkbox"
                  checked={tagDb}
                  onChange={(e) => setTagDb(e.target.checked)}
                />
                <span>{tUI('tagDb')}</span>
              </label>
            </div>

            {/* Type & Feature Toggles */}
            <div
              style={{
                marginTop: '10px',
                paddingTop: '10px',
                borderTop: '1px solid var(--border-color)',
                display: 'flex',
                flexWrap: 'wrap',
                gap: '14px',
                alignItems: 'center',
              }}
            >
              <label
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '5px',
                  fontSize: '0.75rem',
                  color: 'var(--text-main)',
                  cursor: 'pointer',
                }}
              >
                <input
                  type="checkbox"
                  checked={useInitialisms}
                  onChange={(e) => setUseInitialisms(e.target.checked)}
                />
                <span>{tUI('idiomaticInitialisms')}</span>
              </label>

              <label
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '5px',
                  fontSize: '0.75rem',
                  color: 'var(--text-main)',
                  cursor: 'pointer',
                }}
              >
                <input
                  type="checkbox"
                  checked={detectDates}
                  onChange={(e) => setDetectDates(e.target.checked)}
                />
                <span>{tUI('detectDates')}</span>
              </label>

              <label
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '5px',
                  fontSize: '0.75rem',
                  color: 'var(--text-main)',
                  cursor: 'pointer',
                }}
              >
                <input
                  type="checkbox"
                  checked={pointersForNull}
                  onChange={(e) => setPointersForNull(e.target.checked)}
                />
                <span>{tUI('pointersForNull')}</span>
              </label>

              <label
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '5px',
                  fontSize: '0.75rem',
                  color: 'var(--text-main)',
                  cursor: 'pointer',
                }}
              >
                <input
                  type="checkbox"
                  checked={useInt64}
                  onChange={(e) => setUseInt64(e.target.checked)}
                />
                <span>{tUI('useInt64')}</span>
              </label>

              <label
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '5px',
                  fontSize: '0.75rem',
                  color: 'var(--text-main)',
                  cursor: 'pointer',
                }}
              >
                <input
                  type="checkbox"
                  checked={includeHelpers}
                  onChange={(e) => setIncludeHelpers(e.target.checked)}
                />
                <span>{tUI('includeHelpers')}</span>
              </label>
            </div>
          </div>

          {/* Main 2-Column Work Area */}
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
              {/* Left Column: Input */}
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
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '6px',
                    }}
                  >
                    <FileCode size={14} style={{ color: '#60a5fa' }} />
                    {tUI('jsonInput')}
                  </label>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <span
                      style={{
                        fontSize: '0.72rem',
                        color: 'var(--text-muted)',
                        fontFamily: 'monospace',
                      }}
                    >
                      {inputStats.lines} L | {inputStats.chars} C
                    </span>

                    <input
                      type="file"
                      ref={fileInputRef}
                      onChange={handleFileUpload}
                      accept=".json,.txt,.py"
                      style={{ display: 'none' }}
                    />

                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      title="Upload JSON/Python file"
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
                      onClick={handleBeautify}
                      title="Format / Beautify JSON"
                      style={{
                        padding: '3px 8px',
                        borderRadius: '4px',
                        fontSize: '0.72rem',
                        backgroundColor: 'rgba(255, 255, 255, 0.05)',
                        border: '1px solid var(--border-color)',
                        color: 'var(--text-muted)',
                        cursor: 'pointer',
                      }}
                    >
                      {tUI('beautifyJson')}
                    </button>

                    <button
                      type="button"
                      onClick={handleClear}
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
                  value={jsonInput}
                  onChange={(e) => setJsonInput(e.target.value)}
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

              {/* Right Column: Go Output */}
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
                    <Layers size={14} style={{ color: '#34d399' }} />
                    {tUI('goOutput')}
                  </label>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span
                      style={{
                        fontSize: '0.72rem',
                        color: 'var(--text-muted)',
                        fontFamily: 'monospace',
                      }}
                    >
                      {outputStats.lines} L |{' '}
                      {tUI('structCount', { count: conversionResult.structCount })}
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
                      {copied ? tUI('copied') : tUI('copyGo')}
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
                      {tUI('downloadGo')}
                    </button>
                  </div>
                </div>

                <textarea
                  value={conversionResult.code}
                  readOnly
                  rows={18}
                  placeholder={tUI('goPlaceholder')}
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
                    minHeight: '340px',
                    lineHeight: '1.45',
                  }}
                />
              </div>
            </div>

            {/* Relaxed Parser Notice */}
            {conversionResult.usedRelaxed && (
              <div
                style={{
                  marginTop: '14px',
                  backgroundColor: 'rgba(59, 130, 246, 0.1)',
                  border: '1px solid rgba(59, 130, 246, 0.3)',
                  borderRadius: '8px',
                  padding: '10px 14px',
                  color: '#93c5fd',
                  fontSize: '0.8rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                }}
              >
                <Sparkles size={14} />
                <span>{tUI('relaxedNotice')}</span>
              </div>
            )}

            {/* Error Message */}
            {conversionResult.error && (
              <div
                style={{
                  marginTop: '14px',
                  backgroundColor: 'rgba(239, 68, 68, 0.1)',
                  border: '1px solid rgba(239, 68, 68, 0.3)',
                  borderRadius: '8px',
                  padding: '12px 16px',
                  color: '#f87171',
                  fontSize: '0.82rem',
                }}
              >
                ❌ {tUI('invalidJson', { message: conversionResult.error })}
              </div>
            )}
          </div>

          {/* Quick Technical Reference Guide for SEO & Developers */}
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
                fontSize: '1.1rem',
                fontWeight: 700,
                color: 'var(--text-main)',
                marginBottom: '16px',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
              }}
            >
              <Code2 size={20} style={{ color: '#60a5fa' }} />
              Golang JSON Struct Tags & Unmarshaling Cheatsheet
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
                  `omitempty` & Pointer Types (*T)
                </h4>
                <p
                  style={{
                    fontSize: '0.8rem',
                    color: 'var(--text-muted)',
                    lineHeight: '1.5',
                    margin: 0,
                  }}
                >
                  In Go, scalars default to zero values (<code>0</code>, <code>&quot;&quot;</code>,{' '}
                  <code>false</code>). Use pointer types like <code>*string</code> or{' '}
                  <code>*int64</code> with <code>`json:&quot;tag,omitempty&quot;`</code> so{' '}
                  <code>null</code> and omitted keys deserialize to <code>nil</code> instead of
                  overwriting existing data.
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
                  Modern Go 1.18+ `any` vs `interface{}`
                </h4>
                <p
                  style={{
                    fontSize: '0.8rem',
                    color: 'var(--text-muted)',
                    lineHeight: '1.5',
                    margin: 0,
                  }}
                >
                  Go 1.18 introduced <code>any</code> as an alias for{' '}
                  <code>interface&#123;&#125;</code>. It is standard for polymorphic JSON
                  properties, dynamic payloads, and empty array slices (<code>[]any</code>).
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
                  Idiomatic Go Initialisms
                </h4>
                <p
                  style={{
                    fontSize: '0.8rem',
                    color: 'var(--text-muted)',
                    lineHeight: '1.5',
                    margin: 0,
                  }}
                >
                  Official Go conventions require common acronyms to remain uniformly capitalized:{' '}
                  <code>UserID</code> (not <code>UserId</code>), <code>APIURL</code> (not{' '}
                  <code>ApiUrl</code>), <code>UUID</code>, <code>IP</code>, and{' '}
                  <code>HTTPStatus</code>.
                </p>
              </div>
            </div>
          </div>

          {/* SEO Content Section */}
          <ToolSeoContent
            toolSlug="json-to-go-struct-generator"
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
