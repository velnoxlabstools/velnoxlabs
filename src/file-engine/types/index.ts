export type SupportedExtension =
  | 'txt' | 'json' | 'csv' | 'xml' | 'html' | 'css'
  | 'js' | 'ts' | 'md' | 'svg'
  | 'png' | 'jpg' | 'jpeg' | 'gif' | 'webp' | 'avif'
  | 'pdf' | 'zip';

export type PreviewKind = 'image' | 'text' | 'json' | 'csv' | 'markdown' | 'pdf' | 'unknown';

export interface FileConstraints {
  maxBytes?: number;
  allowedExtensions?: SupportedExtension[];
  allowedMimeTypes?: string[];
  multiple?: boolean;
}

export interface FileMetadata {
  name: string;
  size: number;
  type: string;
  extension: string;
  lastModified?: number;
}

export interface ManagedFile {
  id: string;
  file: File;
  meta: FileMetadata;
  previewUrl?: string;
  textContent?: string;
  status: 'pending' | 'valid' | 'invalid' | 'processed';
  error?: string;
}

export interface ProcessResult {
  ok: boolean;
  files: ManagedFile[];
  error?: string;
  output?: Blob | string;
  outputName?: string;
  outputMime?: string;
}

export type FileProcessorFn = (files: ManagedFile[]) => Promise<ProcessResult> | ProcessResult;
