export type ToolKind =
  | 'calculator'
  | 'converter'
  | 'generator'
  | 'formatter'
  | 'validator'
  | 'encoder'
  | 'decoder'
  | 'parser'
  | 'editor'
  | 'analyzer'
  | 'custom';

export type RuntimeStatus =
  | 'idle'
  | 'loading'
  | 'validating'
  | 'executing'
  | 'completed'
  | 'cancelled'
  | 'failed';

export type RuntimeInput = Record<string, unknown>;
export type RuntimeOutput = Record<string, unknown>;

export interface ToolHandler {
  (input: RuntimeInput, ctx: ExecutionContextSnapshot): Promise<RuntimeOutput> | RuntimeOutput;
}

export interface ToolRuntimeDefinition {
  id: string;
  slug: string;
  kind: ToolKind;
  version?: string;
  execute: ToolHandler;
  validate?: (input: RuntimeInput) => string | null;
  timeoutMs?: number;
}

export interface ExecutionContextSnapshot {
  toolId: string;
  slug: string;
  kind: ToolKind;
  startedAt: number;
  signal?: AbortSignal;
}

export interface ExecutionResult {
  ok: boolean;
  status: RuntimeStatus;
  output?: RuntimeOutput;
  error?: string;
  durationMs: number;
  toolId: string;
  slug: string;
}

export interface ExecutionLogEntry {
  level: 'info' | 'warn' | 'error' | 'debug';
  message: string;
  timestamp: number;
  data?: unknown;
}

export interface RuntimeState {
  status: RuntimeStatus;
  toolId: string | null;
  slug: string | null;
  input: RuntimeInput;
  output: RuntimeOutput | null;
  error: string | null;
  logs: ExecutionLogEntry[];
  lastResult: ExecutionResult | null;
}

export type {
  ToolVisibility,
  ToolManifest,
  RegistrationResult,
  UnregisterResult,
} from './registration';
