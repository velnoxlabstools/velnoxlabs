import type { ToolInterfaceSchema } from '@/types/tool-interface';

export const uuidSchema: ToolInterfaceSchema = {
  layout: 'split',
  inputs: [
    {
      id: 'count',
      type: 'number',
      label: 'Quantity (1 - 1000)',
      placeholder: '1',
      defaultValue: 1,
    },
    {
      id: 'version',
      type: 'select',
      label: 'UUID Version',
      defaultValue: 'v4',
      options: [
        { label: 'UUID v4 (Random)', value: 'v4' },
        { label: 'UUID v7 (Time-Ordered)', value: 'v7' },
        { label: 'UUID v1 (Timestamp)', value: 'v1' },
      ],
    },
    {
      id: 'casing',
      type: 'select',
      label: 'Letter Case',
      defaultValue: 'lower',
      options: [
        { label: 'Lowercase (abc)', value: 'lower' },
        { label: 'Uppercase (ABC)', value: 'upper' },
      ],
    },
    {
      id: 'hyphens',
      type: 'checkbox',
      label: 'Include Hyphens (-)',
      defaultValue: true,
    },
  ],
  outputs: [
    {
      id: 'output',
      type: 'formatted',
      label: 'Generated UUIDs',
    },
  ],
  actions: [
    { id: 'run', label: 'Generate', variant: 'primary', role: 'submit' },
    { id: 'copy', label: 'Copy All', variant: 'secondary', role: 'copy' },
    { id: 'download', label: 'Download .txt', variant: 'secondary', role: 'download' },
    { id: 'reset', label: 'Reset', variant: 'ghost', role: 'reset' },
  ],
};

export const base64Schema: ToolInterfaceSchema = {
  layout: 'split',
  inputs: [
    {
      id: 'mode',
      type: 'select',
      label: 'Operation Mode',
      defaultValue: 'encode',
      options: [
        { label: 'Encode (Text to Base64)', value: 'encode' },
        { label: 'Decode (Base64 to Text)', value: 'decode' },
      ],
    },
    {
      id: 'input',
      type: 'textarea',
      label: 'Input String',
      placeholder: 'Enter text or Base64 string here...',
      defaultValue: '',
      rows: 8,
    },
  ],
  outputs: [
    {
      id: 'output',
      type: 'formatted',
      label: 'Result Output',
    },
  ],
  actions: [
    { id: 'run', label: 'Convert', variant: 'primary', role: 'submit' },
    { id: 'copy', label: 'Copy Result', variant: 'secondary', role: 'copy' },
    { id: 'download', label: 'Download .txt', variant: 'secondary', role: 'download' },
    { id: 'reset', label: 'Clear All', variant: 'ghost', role: 'reset' },
  ],
};

export const hashSchema: ToolInterfaceSchema = {
  layout: 'split',
  inputs: [
    {
      id: 'algorithm',
      type: 'select',
      label: 'Hash Algorithm',
      defaultValue: 'SHA-256',
      options: [
        { label: 'SHA-256 (Secure & Recommended)', value: 'SHA-256' },
        { label: 'SHA-512 (High Security)', value: 'SHA-512' },
        { label: 'SHA-384', value: 'SHA-384' },
        { label: 'SHA-1 (Legacy / Checksums)', value: 'SHA-1' },
      ],
    },
    {
      id: 'input',
      type: 'textarea',
      label: 'Input Plaintext',
      placeholder: 'Type or paste plaintext string here to hash...',
      defaultValue: '',
      rows: 8,
    },
  ],
  outputs: [
    {
      id: 'output',
      type: 'formatted',
      label: 'Generated Hash Digest (Hex)',
    },
  ],
  actions: [
    { id: 'run', label: 'Generate Hash', variant: 'primary', role: 'submit' },
    { id: 'copy', label: 'Copy Hash', variant: 'secondary', role: 'copy' },
    { id: 'download', label: 'Download .txt', variant: 'secondary', role: 'download' },
    { id: 'reset', label: 'Reset', variant: 'ghost', role: 'reset' },
  ],
};

export const passwordSchema: ToolInterfaceSchema = {
  layout: 'split',
  inputs: [
    {
      id: 'length',
      type: 'number',
      label: 'Password Length (8 - 128)',
      placeholder: '16',
      defaultValue: 16,
    },
    {
      id: 'count',
      type: 'number',
      label: 'Quantity (1 - 50)',
      placeholder: '1',
      defaultValue: 1,
    },
    {
      id: 'includeUppercase',
      type: 'checkbox',
      label: 'Uppercase Letters (A-Z)',
      defaultValue: true,
    },
    {
      id: 'includeLowercase',
      type: 'checkbox',
      label: 'Lowercase Letters (a-z)',
      defaultValue: true,
    },
    {
      id: 'includeNumbers',
      type: 'checkbox',
      label: 'Numbers (0-9)',
      defaultValue: true,
    },
    {
      id: 'includeSymbols',
      type: 'checkbox',
      label: 'Symbols (!@#$%^&*()_+)',
      defaultValue: true,
    },
  ],
  outputs: [
    {
      id: 'output',
      type: 'formatted',
      label: 'Generated Passwords',
    },
  ],
  actions: [
    { id: 'run', label: 'Generate Passwords', variant: 'primary', role: 'submit' },
    { id: 'copy', label: 'Copy All', variant: 'secondary', role: 'copy' },
    { id: 'download', label: 'Download .txt', variant: 'secondary', role: 'download' },
    { id: 'reset', label: 'Reset Defaults', variant: 'ghost', role: 'reset' },
  ],
};

export const caseSchema: ToolInterfaceSchema = {
  layout: 'split',
  inputs: [
    {
      id: 'targetCase',
      type: 'select',
      label: 'Target Text Format',
      defaultValue: 'camelCase',
      options: [
        { label: 'camelCase (e.g. helloWorld)', value: 'camelCase' },
        { label: 'PascalCase (e.g. HelloWorld)', value: 'pascalCase' },
        { label: 'snake_case (e.g. hello_world)', value: 'snakeCase' },
        { label: 'kebab-case (e.g. hello-world)', value: 'kebabCase' },
        { label: 'CONSTANT_CASE (e.g. HELLO_WORLD)', value: 'constantCase' },
        { label: 'Title Case (e.g. Hello World)', value: 'titleCase' },
        { label: 'Sentence case (e.g. Hello world)', value: 'sentenceCase' },
        { label: 'UPPERCASE (e.g. HELLO WORLD)', value: 'upperCase' },
        { label: 'lowercase (e.g. hello world)', value: 'lowerCase' },
      ],
    },
    {
      id: 'input',
      type: 'textarea',
      label: 'Input String or Code Identifier',
      placeholder: 'Enter text, variable name, or multi-line paragraphs to convert...',
      defaultValue: '',
      rows: 8,
    },
  ],
  outputs: [
    {
      id: 'output',
      type: 'formatted',
      label: 'Converted Output',
    },
  ],
  actions: [
    { id: 'run', label: 'Convert Case', variant: 'primary', role: 'submit' },
    { id: 'copy', label: 'Copy Result', variant: 'secondary', role: 'copy' },
    { id: 'download', label: 'Download .txt', variant: 'secondary', role: 'download' },
    { id: 'reset', label: 'Reset', variant: 'ghost', role: 'reset' },
  ],
};

export const wordCounterSchema: ToolInterfaceSchema = {
  layout: 'split',
  inputs: [
    {
      id: 'input',
      type: 'textarea',
      label: 'Input Text / Article',
      placeholder: 'Paste or type your content, article, or document here to analyze metrics...',
      defaultValue: '',
      rows: 12,
    },
  ],
  outputs: [
    {
      id: 'output',
      type: 'formatted',
      label: 'Text Analysis & Metrics Breakdown',
    },
  ],
  actions: [
    { id: 'run', label: 'Analyze Text', variant: 'primary', role: 'submit' },
    { id: 'copy', label: 'Copy Analysis', variant: 'secondary', role: 'copy' },
    { id: 'download', label: 'Download Report', variant: 'secondary', role: 'download' },
    { id: 'reset', label: 'Clear Text', variant: 'ghost', role: 'reset' },
  ],
};

export const jsonFormatterSchema: ToolInterfaceSchema = {
  layout: 'split',
  inputs: [
    {
      id: 'indent',
      type: 'select',
      label: 'Format Mode / Indentation',
      defaultValue: '2',
      options: [
        { label: '2 Spaces (Standard Pretty)', value: '2' },
        { label: '4 Spaces (Clean Indent)', value: '4' },
        { label: 'Minified (Compact JSON)', value: 'minified' },
      ],
    },
    {
      id: 'input',
      type: 'textarea',
      label: 'Input Raw JSON',
      placeholder: 'Paste raw, minified, or unformatted JSON here...',
      defaultValue: '',
      rows: 12,
    },
  ],
  outputs: [
    {
      id: 'output',
      type: 'json',
      label: 'Formatted & Validated JSON Output',
    },
  ],
  actions: [
    { id: 'run', label: 'Format & Validate', variant: 'primary', role: 'submit' },
    { id: 'copy', label: 'Copy JSON', variant: 'secondary', role: 'copy' },
    { id: 'download', label: 'Download .json', variant: 'secondary', role: 'download' },
    { id: 'reset', label: 'Clear', variant: 'ghost', role: 'reset' },
  ],
};

export const colorConverterSchema: ToolInterfaceSchema = {
  layout: 'split',
  inputs: [
    {
      id: 'color',
      type: 'text',
      label: 'Input Color (HEX, RGB, or HSL)',
      placeholder: 'e.g. #0284c7, rgb(2, 132, 199), or hsl(199, 98%, 39%)',
      defaultValue: '#0284c7',
    },
  ],
  outputs: [
    {
      id: 'output',
      type: 'formatted',
      label: 'All Converted Color Formats & CSS Syntax',
    },
  ],
  actions: [
    { id: 'run', label: 'Convert Color', variant: 'primary', role: 'submit' },
    { id: 'copy', label: 'Copy Formats', variant: 'secondary', role: 'copy' },
    { id: 'download', label: 'Download .txt', variant: 'secondary', role: 'download' },
    { id: 'reset', label: 'Reset', variant: 'ghost', role: 'reset' },
  ],
};

export const loremIpsumSchema: ToolInterfaceSchema = {
  layout: 'split',
  inputs: [
    {
      id: 'type',
      type: 'select',
      label: 'Generation Unit',
      defaultValue: 'paragraphs',
      options: [
        { label: 'Paragraphs', value: 'paragraphs' },
        { label: 'Sentences', value: 'sentences' },
        { label: 'Words', value: 'words' },
      ],
    },
    {
      id: 'count',
      type: 'number',
      label: 'Count (1 - 50)',
      placeholder: '3',
      defaultValue: 3,
    },
    {
      id: 'startWithLorem',
      type: 'checkbox',
      label: 'Start with "Lorem ipsum dolor sit amet..."',
      defaultValue: true,
    },
    {
      id: 'asHtml',
      type: 'checkbox',
      label: 'Wrap output in HTML <p> tags',
      defaultValue: false,
    },
  ],
  outputs: [
    {
      id: 'output',
      type: 'formatted',
      label: 'Generated Placeholder Text',
    },
  ],
  actions: [
    { id: 'run', label: 'Generate Lorem Ipsum', variant: 'primary', role: 'submit' },
    { id: 'copy', label: 'Copy Text', variant: 'secondary', role: 'copy' },
    { id: 'download', label: 'Download .txt', variant: 'secondary', role: 'download' },
    { id: 'reset', label: 'Reset', variant: 'ghost', role: 'reset' },
  ],
};

export const imageResizerSchema: ToolInterfaceSchema = {
  layout: 'split',
  inputs: [
    {
      id: 'width',
      type: 'number',
      label: 'Target Width (px)',
      placeholder: '800',
      defaultValue: 800,
    },
    {
      id: 'height',
      type: 'number',
      label: 'Target Height (px)',
      placeholder: '600',
      defaultValue: 600,
    },
    {
      id: 'format',
      type: 'select',
      label: 'Output Format',
      defaultValue: 'image/webp',
      options: [
        { label: 'WebP (Modern, High Compression)', value: 'image/webp' },
        { label: 'PNG (Lossless Quality)', value: 'image/png' },
        { label: 'JPEG (Standard Photo)', value: 'image/jpeg' },
      ],
    },
    {
      id: 'quality',
      type: 'select',
      label: 'Quality / Compression Level',
      defaultValue: '0.9',
      options: [
        { label: 'Maximum Quality (90%)', value: '0.9' },
        { label: 'Balanced (80%)', value: '0.8' },
        { label: 'High Compression (60%)', value: '0.6' },
      ],
    },
  ],
  outputs: [
    {
      id: 'output',
      type: 'image',
      label: 'Image Processing Status & Download Info',
    },
  ],
  actions: [
    { id: 'run', label: 'Process & Download Image', variant: 'primary', role: 'submit' },
    { id: 'copy', label: 'Copy Status', variant: 'secondary', role: 'copy' },
    { id: 'download', label: 'Save Image', variant: 'secondary', role: 'download' },
    { id: 'reset', label: 'Reset', variant: 'ghost', role: 'reset' },
  ],
};

export const userAgentSchema: ToolInterfaceSchema = {
  layout: 'split',
  inputs: [
    {
      id: 'ua',
      type: 'textarea',
      label: 'User-Agent String',
      placeholder: 'Paste or type any User-Agent string to parse...',
      defaultValue: '',
      rows: 8,
    },
  ],
  outputs: [
    {
      id: 'output',
      type: 'formatted',
      label: 'User-Agent Analysis & Hardware Diagnostics',
    },
  ],
  actions: [
    { id: 'run', label: 'Parse User-Agent', variant: 'primary', role: 'submit' },
    { id: 'copy', label: 'Copy Report', variant: 'secondary', role: 'copy' },
    { id: 'download', label: 'Download .txt', variant: 'secondary', role: 'download' },
    { id: 'reset', label: 'Reset', variant: 'ghost', role: 'reset' },
  ],
};

export const defaultToolSchema: ToolInterfaceSchema = uuidSchema;