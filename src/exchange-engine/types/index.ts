export type ExportFormat = 'text' | 'json' | 'csv' | 'txt' | 'html' | 'markdown' | 'png' | 'svg' | 'pdf';

export type ImportSource = 'clipboard' | 'text' | 'json' | 'csv' | 'txt' | 'file' | 'drop' | 'paste';

export interface ExportRequest {
  data: string | unknown;
  format: ExportFormat;
  filename?: string;
}

export interface ExportResult {
  ok: boolean;
  blob?: Blob;
  text?: string;
  filename: string;
  mime: string;
  error?: string;
}

export interface ImportResult {
  ok: boolean;
  text?: string;
  data?: unknown;
  source: ImportSource;
  error?: string;
}

export interface ShareRequest {
  title?: string;
  text?: string;
  url?: string;
}

export interface ShareResult {
  ok: boolean;
  method: 'native' | 'clipboard' | 'none';
  error?: string;
}

export type HistoryKind = 'export' | 'import' | 'share';

export interface HistoryEntry {
  id: string;
  kind: HistoryKind;
  label: string;
  timestamp: number;
}
