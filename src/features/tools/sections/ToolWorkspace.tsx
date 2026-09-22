'use client';

import {
  UniversalToolInterface,
  uuidSchema,
  base64Schema,
  hashSchema,
  passwordSchema,
  caseSchema,
  wordCounterSchema,
  jsonFormatterSchema,
  colorConverterSchema,
  loremIpsumSchema,
  imageResizerSchema,
  userAgentSchema,
} from '../interface';
import { useTool } from '../ToolProvider';
import type { ToolInterfaceSchema } from '@/types/tool-interface';

interface ToolWorkspaceProps {
  schema?: ToolInterfaceSchema;
}

export function ToolWorkspace({ schema }: ToolWorkspaceProps) {
  const { tool } = useTool();

  let activeSchema: ToolInterfaceSchema = schema ?? uuidSchema;

  if (!schema && tool?.slug) {
    if (tool.slug === 'user-agent-parser') {
      activeSchema = userAgentSchema;
    } else if (tool.slug === 'image-resizer') {
      activeSchema = imageResizerSchema;
    } else if (tool.slug === 'lorem-ipsum') {
      activeSchema = loremIpsumSchema;
    } else if (tool.slug === 'color-converter') {
      activeSchema = colorConverterSchema;
    } else if (tool.slug === 'json-formatter') {
      activeSchema = jsonFormatterSchema;
    } else if (tool.slug === 'word-counter') {
      activeSchema = wordCounterSchema;
    } else if (tool.slug === 'case-converter') {
      activeSchema = caseSchema;
    } else if (tool.slug === 'password-generator') {
      activeSchema = passwordSchema;
    } else if (tool.slug === 'hash-generator') {
      activeSchema = hashSchema;
    } else if (tool.slug === 'base64-encoder') {
      activeSchema = base64Schema;
    } else if (tool.slug === 'uuid-generator') {
      activeSchema = uuidSchema;
    }
  }

  return <UniversalToolInterface schema={activeSchema} />;
}