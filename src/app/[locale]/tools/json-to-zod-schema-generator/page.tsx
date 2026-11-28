'use client';

import React, { useState, useMemo } from 'react';
import { useTranslations } from 'next-intl';
import { GlobalContainer } from '@/components/layout';
import { SectionHeading } from '@/components/ui';
import { ToolSeoContent } from '@/features/tools/sections/ToolSeoContent';
import {
  Code,
  Copy,
  Check,
  Sparkles,
  Settings,
  Play,
  CheckCircle2,
  XCircle,
  Trash2,
  Layers,
  FileCode,
  Zap,
} from 'lucide-react';

interface GeneratorOptions {
  schemaName: string;
  typeName: string;
  coerce: boolean;
  smartStrings: boolean;
  modularSubSchemas: boolean;
  objectMode: 'strip' | 'strict' | 'passthrough';
  exportType: boolean;
  nullOption: 'nullable' | 'nullish';
}

interface SubSchema {
  name: string;
  code: string;
}

interface ValidationIssue {
  path: string;
  message: string;
}

// Sample JSON Presets
const SAMPLE_PRESETS = {
  user: {
    name: 'userSchema',
    type: 'User',
    data: {
      id: 'a5c7e123-4567-489b-a123-456789abcdef',
      name: 'Sarah Connor',
      email: 'sarah.connor@example.com',
      website: 'https://sarahconnor.dev',
      age: 34,
      isActive: true,
      registeredAt: '2026-03-15T14:30:00Z',
      roles: ['admin', 'developer'],
      address: {
        street: '100 Tech Boulevard',
        city: 'San Francisco',
        country: 'USA',
        zipCode: '94107',
      },
    },
  },
  order: {
    name: 'orderSchema',
    type: 'Order',
    data: {
      orderId: 'ord_98765',
      status: 'processing',
      createdAt: '2026-11-20T10:15:30Z',
      items: [
        {
          productId: 101,
          title: 'Ergonomic Mechanical Keyboard',
          price: 149.99,
          quantity: 1,
          discountCode: 'BLACKFRIDAY',
        },
        {
          productId: 102,
          title: 'USB-C Braided Cable',
          price: 19.5,
          quantity: 2,
        },
      ],
      customer: {
        name: 'David Miller',
        email: 'david.miller@example.org',
      },
      totalAmount: 188.99,
    },
  },
  apiResponse: {
    name: 'apiResponseSchema',
    type: 'ApiResponse',
    data: {
      success: true,
      page: 1,
      pageSize: 20,
      totalCount: 150,
      data: [
        {
          id: 1,
          title: 'Getting Started with Next.js 15',
          published: true,
          views: 4520,
          author: 'Tech Team',
        },
        {
          id: 2,
          title: 'Full-Stack TypeScript with Zod & tRPC',
          published: false,
          views: 0,
          author: null,
        },
      ],
    },
  },
  form: {
    name: 'formSchema',
    type: 'FormData',
    data: {
      username: 'alex99',
      email: 'alex@company.io',
      age: 28,
      newsletter: true,
      startDate: '2026-12-01T09:00:00Z',
    },
  },
};

// String pattern detectors
const EMAIL_REGEX = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
const URL_REGEX = /^https?:\/\/[^\s$.?#].[^\s]*$/i;
const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const ISO_DATE_REGEX = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(\.\d+)?(Z|[+-]\d{2}:\d{2})$/;
const IPV4_REGEX =
  /^(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/;

function capitalize(s: string): string {
  if (!s) return '';
  return s.charAt(0).toUpperCase() + s.slice(1);
}

function isValidIdentifier(s: string): boolean {
  return /^[a-zA-Z_$][a-zA-Z0-9_$]*$/.test(s);
}

function formatKey(key: string): string {
  return isValidIdentifier(key) ? key : JSON.stringify(key);
}

export default function Page() {
  const tUI = useTranslations('ToolUI.jsonToZod');

  const [inputJson, setInputJson] = useState<string>(
    JSON.stringify(SAMPLE_PRESETS.user.data, null, 2)
  );
  const [options, setOptions] = useState<GeneratorOptions>({
    schemaName: SAMPLE_PRESETS.user.name,
    typeName: SAMPLE_PRESETS.user.type,
    coerce: false,
    smartStrings: true,
    modularSubSchemas: true,
    objectMode: 'strip',
    exportType: true,
    nullOption: 'nullable',
  });

  const [activeTab, setActiveTab] = useState<'schema' | 'validator' | 'settings'>('schema');
  const [copiedField, setCopiedField] = useState<string>('');
  const [validationInput, setValidationInput] = useState<string>(
    JSON.stringify(SAMPLE_PRESETS.user.data, null, 2)
  );

  // Generate Zod Schema Engine
  const generationResult = useMemo(() => {
    const trimmed = inputJson.trim();
    if (!trimmed) {
      return {
        fullCode: '',
        schemaOnly: '',
        typeOnly: '',
        subSchemas: [] as SubSchema[],
        stats: { keys: 0, depth: 0, types: 0 },
        error: null,
      };
    }

    let parsed: unknown;
    try {
      parsed = JSON.parse(trimmed);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      return {
        fullCode: '',
        schemaOnly: '',
        typeOnly: '',
        subSchemas: [] as SubSchema[],
        stats: { keys: 0, depth: 0, types: 0 },
        error: msg,
      };
    }

    const subSchemas: SubSchema[] = [];
    let totalKeys = 0;
    let maxDepth = 0;
    const detectedTypes = new Set<string>();

    const inferValueType = (
      val: unknown,
      keyName: string,
      indentLevel: number,
      depth: number
    ): string => {
      maxDepth = Math.max(maxDepth, depth);
      const indent = '  '.repeat(indentLevel);
      const innerIndent = '  '.repeat(indentLevel + 1);

      // Null
      if (val === null) {
        detectedTypes.add('null');
        return 'z.null()';
      }

      // String
      if (typeof val === 'string') {
        detectedTypes.add('string');
        if (options.coerce) {
          if (options.smartStrings && ISO_DATE_REGEX.test(val)) {
            detectedTypes.add('date');
            return 'z.coerce.date()';
          }
          return 'z.coerce.string()';
        }

        if (options.smartStrings) {
          if (EMAIL_REGEX.test(val)) {
            detectedTypes.add('email');
            return 'z.string().email()';
          }
          if (URL_REGEX.test(val)) {
            detectedTypes.add('url');
            return 'z.string().url()';
          }
          if (UUID_REGEX.test(val)) {
            detectedTypes.add('uuid');
            return 'z.string().uuid()';
          }
          if (ISO_DATE_REGEX.test(val)) {
            detectedTypes.add('datetime');
            return 'z.string().datetime()';
          }
          if (IPV4_REGEX.test(val)) {
            detectedTypes.add('ip');
            return 'z.string().ip()';
          }
        }
        return 'z.string()';
      }

      // Number
      if (typeof val === 'number') {
        detectedTypes.add('number');
        if (options.coerce) {
          return Number.isInteger(val) ? 'z.coerce.number().int()' : 'z.coerce.number()';
        }
        return Number.isInteger(val) ? 'z.number().int()' : 'z.number()';
      }

      // Boolean
      if (typeof val === 'boolean') {
        detectedTypes.add('boolean');
        return options.coerce ? 'z.coerce.boolean()' : 'z.boolean()';
      }

      // Array
      if (Array.isArray(val)) {
        detectedTypes.add('array');
        if (val.length === 0) return 'z.array(z.unknown())';

        // Check if array of objects -> multi-sample merging
        const isAllObjects = val.every((it) => it && typeof it === 'object' && !Array.isArray(it));
        if (isAllObjects && val.length > 0) {
          // Merge keys across all items
          const allKeys = new Set<string>();
          val.forEach((it) => {
            Object.keys(it as Record<string, unknown>).forEach((k) => allKeys.add(k));
          });

          let objContent = 'z.object({\n';
          allKeys.forEach((k) => {
            totalKeys++;
            const presentItems = val.filter((it) => k in (it as Record<string, unknown>)) as Record<
              string,
              unknown
            >[];
            const isOptional = presentItems.length < val.length;
            const values = presentItems.map((it) => it[k]);
            const hasNull = values.some((v) => v === null);
            const nonNullValues = values.filter((v) => v !== null);

            let fieldType = 'z.unknown()';
            if (nonNullValues.length > 0) {
              const types = Array.from(
                new Set(nonNullValues.map((v) => inferValueType(v, k, indentLevel + 2, depth + 1)))
              );
              fieldType = types.length === 1 ? types[0] : `z.union([${types.join(', ')}])`;
            } else {
              fieldType = 'z.null()';
            }

            if (hasNull && fieldType !== 'z.null()') {
              fieldType += options.nullOption === 'nullish' ? '.nullish()' : '.nullable()';
            }
            if (
              isOptional &&
              !fieldType.includes('.nullish()') &&
              !fieldType.includes('.optional()')
            ) {
              fieldType += '.optional()';
            }

            objContent += `${innerIndent}  ${formatKey(k)}: ${fieldType},\n`;
          });
          objContent +=
            `${innerIndent}})` +
            (options.objectMode === 'strict'
              ? '.strict()'
              : options.objectMode === 'passthrough'
                ? '.passthrough()'
                : '');

          // If modular sub-schemas enabled, extract array item schema
          if (options.modularSubSchemas && keyName) {
            const itemSchemaName = capitalize(keyName.replace(/s$/, '')) + 'ItemSchema';
            if (!subSchemas.some((s) => s.name === itemSchemaName)) {
              subSchemas.push({
                name: itemSchemaName,
                code: `export const ${itemSchemaName} = ${objContent};`,
              });
            }
            return `z.array(${itemSchemaName})`;
          }

          return `z.array(${objContent})`;
        }

        // Array of primitives
        const primitiveTypes = Array.from(
          new Set(val.map((v) => inferValueType(v, `${keyName}Item`, indentLevel + 1, depth + 1)))
        );
        if (primitiveTypes.length === 1) {
          return `z.array(${primitiveTypes[0]})`;
        }
        return `z.array(z.union([${primitiveTypes.join(', ')}]))`;
      }

      // Object
      if (typeof val === 'object' && val !== null) {
        detectedTypes.add('object');
        const record = val as Record<string, unknown>;
        const keys = Object.keys(record);
        if (keys.length === 0) return 'z.object({})';

        let objBody = 'z.object({\n';
        keys.forEach((k) => {
          totalKeys++;
          const childVal = record[k];

          // If modular sub-schema enabled for nested object
          if (
            options.modularSubSchemas &&
            typeof childVal === 'object' &&
            childVal !== null &&
            !Array.isArray(childVal)
          ) {
            const childSchemaName = capitalize(k) + 'Schema';
            const childTypeDef = inferValueType(childVal, k, 0, depth + 1);
            if (!subSchemas.some((s) => s.name === childSchemaName)) {
              subSchemas.push({
                name: childSchemaName,
                code: `export const ${childSchemaName} = ${childTypeDef};`,
              });
            }
            objBody += `${innerIndent}${formatKey(k)}: ${childSchemaName},\n`;
          } else {
            const fieldType = inferValueType(childVal, k, indentLevel + 1, depth + 1);
            objBody += `${innerIndent}${formatKey(k)}: ${fieldType},\n`;
          }
        });
        objBody +=
          `${indent}})` +
          (options.objectMode === 'strict'
            ? '.strict()'
            : options.objectMode === 'passthrough'
              ? '.passthrough()'
              : '');
        return objBody;
      }

      return 'z.unknown()';
    };

    const rootSchema = inferValueType(parsed, options.schemaName, 0, 1);

    // Build Schema Only
    const subSchemasCode =
      subSchemas.length > 0 ? subSchemas.map((s) => s.code).join('\n\n') + '\n\n' : '';

    const rootSchemaCode = `export const ${options.schemaName || 'schema'} = ${rootSchema};`;

    const schemaOnly = subSchemasCode + rootSchemaCode;

    // Type Inference export
    const typeExportName = options.typeName || 'Schema';
    const typeOnly = options.exportType
      ? `export type ${typeExportName} = z.infer<typeof ${options.schemaName || 'schema'}>;`
      : '';

    // Full file output
    const fullCode = `import { z } from 'zod';\n\n${schemaOnly}${
      typeOnly ? '\n\n' + typeOnly : ''
    }`;

    return {
      fullCode,
      schemaOnly,
      typeOnly,
      subSchemas,
      stats: {
        keys: totalKeys,
        depth: maxDepth,
        types: detectedTypes.size,
      },
      error: null,
    };
  }, [inputJson, options]);

  // Client-Side Live Validation Engine
  const validationResults = useMemo(() => {
    if (!validationInput.trim()) {
      return { isValid: false, issues: [] as ValidationIssue[], message: 'Empty test input' };
    }

    let parsedTest: unknown;
    try {
      parsedTest = JSON.parse(validationInput);
    } catch {
      return {
        isValid: false,
        issues: [{ path: 'root', message: 'Invalid JSON syntax' }],
        message: 'JSON parse error',
      };
    }

    let parsedModel: unknown;
    try {
      parsedModel = JSON.parse(inputJson);
    } catch {
      return {
        isValid: false,
        issues: [{ path: 'schema', message: 'Original schema JSON is invalid' }],
        message: 'Invalid base schema',
      };
    }

    const issues: ValidationIssue[] = [];

    // Recursive structural validator against inferred rules
    const validateNode = (actual: unknown, expected: unknown, path: string) => {
      if (expected === null) {
        if (actual !== null) {
          issues.push({ path, message: `Expected null, received ${typeof actual}` });
        }
        return;
      }

      if (typeof expected === 'string') {
        if (typeof actual !== 'string') {
          issues.push({ path, message: `Expected string, received ${typeof actual}` });
          return;
        }
        if (options.smartStrings) {
          if (EMAIL_REGEX.test(expected) && !EMAIL_REGEX.test(actual)) {
            issues.push({ path, message: `Invalid email address format ("${actual}")` });
          }
          if (URL_REGEX.test(expected) && !URL_REGEX.test(actual)) {
            issues.push({ path, message: `Invalid URL format ("${actual}")` });
          }
          if (UUID_REGEX.test(expected) && !UUID_REGEX.test(actual)) {
            issues.push({ path, message: `Invalid UUID format ("${actual}")` });
          }
          if (ISO_DATE_REGEX.test(expected) && !ISO_DATE_REGEX.test(actual)) {
            issues.push({ path, message: `Invalid ISO-8601 datetime ("${actual}")` });
          }
        }
        return;
      }

      if (typeof expected === 'number') {
        if (typeof actual !== 'number' || isNaN(actual)) {
          issues.push({ path, message: `Expected number, received ${typeof actual}` });
          return;
        }
        if (Number.isInteger(expected) && !Number.isInteger(actual)) {
          issues.push({ path, message: `Expected integer, received float (${actual})` });
        }
        return;
      }

      if (typeof expected === 'boolean') {
        if (typeof actual !== 'boolean') {
          issues.push({ path, message: `Expected boolean, received ${typeof actual}` });
        }
        return;
      }

      if (Array.isArray(expected)) {
        if (!Array.isArray(actual)) {
          issues.push({ path, message: `Expected array, received ${typeof actual}` });
          return;
        }
        if (expected.length > 0 && actual.length > 0) {
          const sampleItem = expected[0];
          actual.forEach((actItem, idx) => {
            validateNode(actItem, sampleItem, `${path}[${idx}]`);
          });
        }
        return;
      }

      if (typeof expected === 'object' && expected !== null) {
        if (typeof actual !== 'object' || actual === null || Array.isArray(actual)) {
          issues.push({
            path,
            message: `Expected object, received ${actual === null ? 'null' : typeof actual}`,
          });
          return;
        }

        const expObj = expected as Record<string, unknown>;
        const actObj = actual as Record<string, unknown>;

        // Check required fields
        Object.keys(expObj).forEach((k) => {
          if (!(k in actObj)) {
            issues.push({
              path: path ? `${path}.${k}` : k,
              message: `Missing required field "${k}"`,
            });
          } else {
            validateNode(actObj[k], expObj[k], path ? `${path}.${k}` : k);
          }
        });

        // Strict mode check for extra keys
        if (options.objectMode === 'strict') {
          Object.keys(actObj).forEach((k) => {
            if (!(k in expObj)) {
              issues.push({
                path: path ? `${path}.${k}` : k,
                message: `Unrecognized extra key in strict mode`,
              });
            }
          });
        }
      }
    };

    validateNode(parsedTest, parsedModel, '');

    return {
      isValid: issues.length === 0,
      issues,
      message:
        issues.length === 0
          ? 'All constraints passed ✅'
          : `${issues.length} validation error(s) found`,
    };
  }, [validationInput, inputJson, options]);

  // Load Preset
  const handleLoadPreset = (key: keyof typeof SAMPLE_PRESETS) => {
    const p = SAMPLE_PRESETS[key];
    const jsonStr = JSON.stringify(p.data, null, 2);
    setInputJson(jsonStr);
    setValidationInput(jsonStr);
    setOptions((prev) => ({
      ...prev,
      schemaName: p.name,
      typeName: p.type,
    }));
  };

  // Copy helper
  const handleCopy = (text: string, field: string) => {
    if (!text) return;
    navigator.clipboard.writeText(text);
    setCopiedField(field);
    setTimeout(() => setCopiedField(''), 2000);
  };

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
              <Zap size={12} />
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
              <Sparkles size={12} />
              {tUI('aiInferenceBadge')}
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
              <FileCode size={12} />
              TypeScript Ready
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
                onClick={() => handleLoadPreset('user')}
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
                onClick={() => handleLoadPreset('order')}
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
                onClick={() => handleLoadPreset('apiResponse')}
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
                {tUI('presetApiResponse')}
              </button>
              <button
                type="button"
                onClick={() => handleLoadPreset('form')}
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
                {tUI('presetForm')}
              </button>
            </div>

            <button
              type="button"
              onClick={() => {
                setInputJson('');
                setValidationInput('');
              }}
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

          {/* Main Workspace (2-Column Grid) */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
              gap: '20px',
              marginBottom: '24px',
            }}
          >
            {/* Left Column: JSON Input & Config */}
            <div
              style={{
                backgroundColor: 'var(--bg-card)',
                border: '1px solid var(--border-color)',
                borderRadius: '12px',
                padding: '20px',
                display: 'flex',
                flexDirection: 'column',
              }}
            >
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  marginBottom: '10px',
                }}
              >
                <label
                  style={{
                    color: 'var(--text-main)',
                    fontSize: '0.875rem',
                    fontWeight: 700,
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                  }}
                >
                  <Code size={16} color="#60a5fa" />
                  {tUI('jsonInput')}
                </label>

                {/* Telemetry pill */}
                <span
                  style={{
                    fontSize: '0.75rem',
                    color: 'var(--text-muted)',
                    fontFamily: 'monospace',
                  }}
                >
                  {generationResult.stats.keys} keys | {generationResult.stats.depth} depth
                </span>
              </div>

              <textarea
                value={inputJson}
                onChange={(e) => setInputJson(e.target.value)}
                rows={14}
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
                  flex: 1,
                  minHeight: '260px',
                }}
              />

              {generationResult.error && (
                <div
                  style={{
                    marginTop: '12px',
                    padding: '8px 12px',
                    borderRadius: '6px',
                    backgroundColor: 'rgba(239, 68, 68, 0.1)',
                    border: '1px solid rgba(239, 68, 68, 0.3)',
                    color: '#f87171',
                    fontSize: '0.82rem',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                  }}
                >
                  <XCircle size={15} />
                  {tUI('invalidJson', { message: generationResult.error })}
                </div>
              )}
            </div>

            {/* Right Column: Output Tabs & Actions */}
            <div
              style={{
                backgroundColor: 'var(--bg-card)',
                border: '1px solid var(--border-color)',
                borderRadius: '12px',
                padding: '20px',
                display: 'flex',
                flexDirection: 'column',
              }}
            >
              {/* Tabs Navigation */}
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  borderBottom: '1px solid var(--border-color)',
                  paddingBottom: '10px',
                  marginBottom: '14px',
                  flexWrap: 'wrap',
                  gap: '8px',
                }}
              >
                <div style={{ display: 'flex', gap: '6px' }}>
                  <button
                    type="button"
                    onClick={() => setActiveTab('schema')}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px',
                      padding: '5px 12px',
                      borderRadius: '6px',
                      fontSize: '0.78rem',
                      fontWeight: 600,
                      backgroundColor:
                        activeTab === 'schema' ? 'rgba(59, 130, 246, 0.15)' : 'transparent',
                      color: activeTab === 'schema' ? '#60a5fa' : 'var(--text-muted)',
                      border:
                        activeTab === 'schema'
                          ? '1px solid rgba(59, 130, 246, 0.3)'
                          : '1px solid transparent',
                      cursor: 'pointer',
                    }}
                  >
                    <FileCode size={14} />
                    {tUI('tabSchema')}
                  </button>

                  <button
                    type="button"
                    onClick={() => setActiveTab('validator')}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px',
                      padding: '5px 12px',
                      borderRadius: '6px',
                      fontSize: '0.78rem',
                      fontWeight: 600,
                      backgroundColor:
                        activeTab === 'validator' ? 'rgba(52, 211, 153, 0.15)' : 'transparent',
                      color: activeTab === 'validator' ? '#34d399' : 'var(--text-muted)',
                      border:
                        activeTab === 'validator'
                          ? '1px solid rgba(52, 211, 153, 0.3)'
                          : '1px solid transparent',
                      cursor: 'pointer',
                    }}
                  >
                    <Play size={14} />
                    {tUI('tabValidator')}
                  </button>

                  <button
                    type="button"
                    onClick={() => setActiveTab('settings')}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px',
                      padding: '5px 12px',
                      borderRadius: '6px',
                      fontSize: '0.78rem',
                      fontWeight: 600,
                      backgroundColor:
                        activeTab === 'settings' ? 'rgba(168, 85, 247, 0.15)' : 'transparent',
                      color: activeTab === 'settings' ? '#a855f7' : 'var(--text-muted)',
                      border:
                        activeTab === 'settings'
                          ? '1px solid rgba(168, 85, 247, 0.3)'
                          : '1px solid transparent',
                      cursor: 'pointer',
                    }}
                  >
                    <Settings size={14} />
                    {tUI('tabSettings')}
                  </button>
                </div>

                {/* Quick Copy Dropdown / Button */}
                {activeTab === 'schema' && (
                  <div style={{ display: 'flex', gap: '6px' }}>
                    <button
                      type="button"
                      onClick={() => handleCopy(generationResult.fullCode, 'full')}
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '4px',
                        padding: '4px 10px',
                        borderRadius: '6px',
                        fontSize: '0.75rem',
                        fontWeight: 600,
                        backgroundColor: 'rgba(59, 130, 246, 0.15)',
                        border: '1px solid rgba(59, 130, 246, 0.3)',
                        color: '#60a5fa',
                        cursor: 'pointer',
                      }}
                    >
                      {copiedField === 'full' ? <Check size={12} /> : <Copy size={12} />}
                      {copiedField === 'full' ? tUI('copied') : tUI('copyFull')}
                    </button>
                  </div>
                )}
              </div>

              {/* Tab 1: Generated Schema Display */}
              {activeTab === 'schema' && (
                <div style={{ display: 'flex', flexDirection: 'column', flex: 1 }}>
                  <pre
                    style={{
                      flex: 1,
                      backgroundColor: 'var(--bg-page)',
                      border: '1px solid var(--border-color)',
                      borderRadius: '8px',
                      padding: '12px',
                      fontFamily: 'monospace',
                      fontSize: '0.82rem',
                      color: '#34d399',
                      overflow: 'auto',
                      margin: 0,
                      minHeight: '260px',
                      whiteSpace: 'pre-wrap',
                      wordBreak: 'break-word',
                    }}
                  >
                    {generationResult.fullCode || (
                      <span style={{ color: 'var(--text-muted)', fontStyle: 'italic' }}>
                        {tUI('zodPlaceholder')}
                      </span>
                    )}
                  </pre>

                  {/* Sub-Actions */}
                  <div
                    style={{
                      display: 'flex',
                      flexWrap: 'wrap',
                      gap: '8px',
                      marginTop: '12px',
                    }}
                  >
                    <button
                      type="button"
                      onClick={() => handleCopy(generationResult.schemaOnly, 'schemaOnly')}
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '4px',
                        padding: '4px 10px',
                        borderRadius: '6px',
                        fontSize: '0.75rem',
                        fontWeight: 600,
                        backgroundColor: 'var(--bg-page)',
                        border: '1px solid var(--border-color)',
                        color: 'var(--text-main)',
                        cursor: 'pointer',
                      }}
                    >
                      {copiedField === 'schemaOnly' ? <Check size={12} /> : <Copy size={12} />}
                      {copiedField === 'schemaOnly' ? tUI('copied') : tUI('copySchemaOnly')}
                    </button>

                    {options.exportType && (
                      <button
                        type="button"
                        onClick={() => handleCopy(generationResult.typeOnly, 'typeOnly')}
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '4px',
                          padding: '4px 10px',
                          borderRadius: '6px',
                          fontSize: '0.75rem',
                          fontWeight: 600,
                          backgroundColor: 'var(--bg-page)',
                          border: '1px solid var(--border-color)',
                          color: 'var(--text-main)',
                          cursor: 'pointer',
                        }}
                      >
                        {copiedField === 'typeOnly' ? <Check size={12} /> : <Copy size={12} />}
                        {copiedField === 'typeOnly' ? tUI('copied') : tUI('copyTypeOnly')}
                      </button>
                    )}
                  </div>
                </div>
              )}

              {/* Tab 2: Interactive Validation Playground */}
              {activeTab === 'validator' && (
                <div style={{ display: 'flex', flexDirection: 'column', flex: 1 }}>
                  <div
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      marginBottom: '8px',
                    }}
                  >
                    <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                      {tUI('validatorHelp')}
                    </span>
                    <span
                      style={{
                        fontSize: '0.75rem',
                        fontWeight: 700,
                        padding: '2px 8px',
                        borderRadius: '4px',
                        backgroundColor: validationResults.isValid
                          ? 'rgba(52, 211, 153, 0.15)'
                          : 'rgba(239, 68, 68, 0.15)',
                        color: validationResults.isValid ? '#34d399' : '#f87171',
                      }}
                    >
                      {validationResults.message}
                    </span>
                  </div>

                  <textarea
                    value={validationInput}
                    onChange={(e) => setValidationInput(e.target.value)}
                    rows={10}
                    placeholder="Paste sample JSON to test against generated schema..."
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
                      minHeight: '160px',
                      marginBottom: '10px',
                    }}
                  />

                  {/* Issues List */}
                  <div style={{ flex: 1, overflowY: 'auto', maxHeight: '120px' }}>
                    {validationResults.issues.length === 0 ? (
                      <div
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '6px',
                          color: '#34d399',
                          fontSize: '0.8rem',
                          padding: '8px',
                          backgroundColor: 'rgba(52, 211, 153, 0.05)',
                          borderRadius: '6px',
                        }}
                      >
                        <CheckCircle2 size={16} />
                        {tUI('validatorValid')}
                      </div>
                    ) : (
                      validationResults.issues.map((iss, idx) => (
                        <div
                          key={idx}
                          style={{
                            display: 'flex',
                            alignItems: 'flex-start',
                            gap: '6px',
                            color: '#f87171',
                            fontSize: '0.75rem',
                            padding: '4px 8px',
                            marginBottom: '4px',
                            backgroundColor: 'rgba(239, 68, 68, 0.05)',
                            borderRadius: '4px',
                          }}
                        >
                          <XCircle size={14} style={{ marginTop: '2px', flexShrink: 0 }} />
                          <div>
                            <strong>{iss.path || 'root'}:</strong> {iss.message}
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}

              {/* Tab 3: Configuration Settings */}
              {activeTab === 'settings' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', flex: 1 }}>
                  <div
                    style={{
                      display: 'grid',
                      gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
                      gap: '12px',
                    }}
                  >
                    <div>
                      <label
                        style={{
                          fontSize: '0.75rem',
                          fontWeight: 600,
                          color: 'var(--text-main)',
                          display: 'block',
                          marginBottom: '4px',
                        }}
                      >
                        {tUI('configSchemaName')}
                      </label>
                      <input
                        type="text"
                        value={options.schemaName}
                        onChange={(e) =>
                          setOptions((prev) => ({ ...prev, schemaName: e.target.value }))
                        }
                        style={{
                          width: '100%',
                          backgroundColor: 'var(--bg-page)',
                          border: '1px solid var(--border-color)',
                          borderRadius: '6px',
                          color: 'var(--text-main)',
                          padding: '6px 10px',
                          fontFamily: 'monospace',
                          fontSize: '0.8rem',
                          outline: 'none',
                        }}
                      />
                    </div>

                    <div>
                      <label
                        style={{
                          fontSize: '0.75rem',
                          fontWeight: 600,
                          color: 'var(--text-main)',
                          display: 'block',
                          marginBottom: '4px',
                        }}
                      >
                        {tUI('configTypeName')}
                      </label>
                      <input
                        type="text"
                        value={options.typeName}
                        onChange={(e) =>
                          setOptions((prev) => ({ ...prev, typeName: e.target.value }))
                        }
                        style={{
                          width: '100%',
                          backgroundColor: 'var(--bg-page)',
                          border: '1px solid var(--border-color)',
                          borderRadius: '6px',
                          color: 'var(--text-main)',
                          padding: '6px 10px',
                          fontFamily: 'monospace',
                          fontSize: '0.8rem',
                          outline: 'none',
                        }}
                      />
                    </div>
                  </div>

                  {/* Toggles */}
                  <div
                    style={{
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '10px',
                      backgroundColor: 'var(--bg-page)',
                      border: '1px solid var(--border-color)',
                      borderRadius: '8px',
                      padding: '12px',
                    }}
                  >
                    <label
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        fontSize: '0.8rem',
                        color: 'var(--text-main)',
                        cursor: 'pointer',
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <Sparkles size={14} color="#60a5fa" />
                        <span>{tUI('configSmartStrings')}</span>
                      </div>
                      <input
                        type="checkbox"
                        checked={options.smartStrings}
                        onChange={(e) =>
                          setOptions((prev) => ({ ...prev, smartStrings: e.target.checked }))
                        }
                        style={{ cursor: 'pointer' }}
                      />
                    </label>

                    <label
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        fontSize: '0.8rem',
                        color: 'var(--text-main)',
                        cursor: 'pointer',
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <Layers size={14} color="#c084fc" />
                        <span>{tUI('configModular')}</span>
                      </div>
                      <input
                        type="checkbox"
                        checked={options.modularSubSchemas}
                        onChange={(e) =>
                          setOptions((prev) => ({
                            ...prev,
                            modularSubSchemas: e.target.checked,
                          }))
                        }
                        style={{ cursor: 'pointer' }}
                      />
                    </label>

                    <label
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        fontSize: '0.8rem',
                        color: 'var(--text-main)',
                        cursor: 'pointer',
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <Zap size={14} color="#fbbf24" />
                        <span>{tUI('configCoerce')}</span>
                      </div>
                      <input
                        type="checkbox"
                        checked={options.coerce}
                        onChange={(e) =>
                          setOptions((prev) => ({ ...prev, coerce: e.target.checked }))
                        }
                        style={{ cursor: 'pointer' }}
                      />
                    </label>

                    <label
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        fontSize: '0.8rem',
                        color: 'var(--text-main)',
                        cursor: 'pointer',
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <FileCode size={14} color="#34d399" />
                        <span>{tUI('configExportType')}</span>
                      </div>
                      <input
                        type="checkbox"
                        checked={options.exportType}
                        onChange={(e) =>
                          setOptions((prev) => ({ ...prev, exportType: e.target.checked }))
                        }
                        style={{ cursor: 'pointer' }}
                      />
                    </label>
                  </div>

                  {/* Object Mode */}
                  <div>
                    <label
                      style={{
                        fontSize: '0.75rem',
                        fontWeight: 600,
                        color: 'var(--text-main)',
                        display: 'block',
                        marginBottom: '4px',
                      }}
                    >
                      {tUI('configObjectMode')}
                    </label>
                    <select
                      value={options.objectMode}
                      onChange={(e) =>
                        setOptions((prev) => ({
                          ...prev,
                          objectMode: e.target.value as 'strip' | 'strict' | 'passthrough',
                        }))
                      }
                      style={{
                        width: '100%',
                        backgroundColor: 'var(--bg-page)',
                        border: '1px solid var(--border-color)',
                        borderRadius: '6px',
                        color: 'var(--text-main)',
                        padding: '6px 10px',
                        fontSize: '0.8rem',
                        outline: 'none',
                        cursor: 'pointer',
                      }}
                    >
                      <option value="strip">Standard (strip unrecognized keys)</option>
                      <option value="strict">Strict (.strict() - error on extra keys)</option>
                      <option value="passthrough">
                        Passthrough (.passthrough() - preserve extra keys)
                      </option>
                    </select>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Tool SEO Content Section */}
          <ToolSeoContent
            toolSlug="json-to-zod-schema-generator"
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
