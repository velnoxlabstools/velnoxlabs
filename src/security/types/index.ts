export type LogLevel = 'debug' | 'info' | 'warn' | 'error' | 'security';

export type ErrorCode =
  | 'VALIDATION'
  | 'NOT_FOUND'
  | 'FORBIDDEN'
  | 'RATE_LIMIT'
  | 'RUNTIME'
  | 'NETWORK'
  | 'UNKNOWN';

export interface LogEntry {
  id: string;
  level: LogLevel;
  message: string;
  code?: ErrorCode;
  context?: Record<string, unknown>;
  timestamp: number;
  path?: string;
}

export interface AppErrorOptions {
  code?: ErrorCode;
  status?: number;
  cause?: unknown;
  publicMessage?: string;
  context?: Record<string, unknown>;
}

export interface ValidationResult {
  valid: boolean;
  errors: string[];
}
