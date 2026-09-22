export type DataFormat =
  | 'text'
  | 'json'
  | 'xml'
  | 'yaml'
  | 'csv'
  | 'tsv'
  | 'html'
  | 'css'
  | 'javascript'
  | 'typescript'
  | 'markdown'
  | 'url'
  | 'base64'
  | 'hex'
  | 'binary'
  | 'color'
  | 'unicode'
  | 'unknown';

export type TransformOp =
  | 'parse'
  | 'validate'
  | 'normalize'
  | 'format'
  | 'beautify'
  | 'minify'
  | 'encode'
  | 'decode'
  | 'convert'
  | 'compare'
  | 'merge'
  | 'split'
  | 'clean'
  | 'transform';

export interface TransformRequest {
  input: string;
  format?: DataFormat;
  targetFormat?: DataFormat;
  operation: TransformOp;
  options?: Record<string, unknown>;
}

export interface TransformResult {
  ok: boolean;
  output?: string;
  data?: unknown;
  format?: DataFormat;
  error?: string;
  stages: string[];
  durationMs: number;
}

export type TransformerFn = (
  input: string,
  options?: Record<string, unknown>
) => string | unknown | Promise<string | unknown>;
