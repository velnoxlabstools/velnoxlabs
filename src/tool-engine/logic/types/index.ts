import type { ToolKind } from '../../types';

export type LogicInput = Record<string, unknown>;
export type LogicOutput = Record<string, unknown>;

export interface LogicSchemaField {
  name: string;
  type: 'string' | 'number' | 'boolean' | 'array' | 'object' | 'file';
  required?: boolean;
  description?: string;
}

export interface ToolLogicModule {
  id: string;
  name: string;
  category: string;
  kind: ToolKind;
  inputSchema: LogicSchemaField[];
  outputSchema: LogicSchemaField[];
  validate(input: LogicInput): string | null;
  process(input: LogicInput): Promise<LogicOutput> | LogicOutput;
  transform?(raw: LogicOutput): LogicOutput;
  result?(output: LogicOutput): LogicOutput;
  metadata?(): Record<string, unknown>;
}

export interface LogicPipelineResult {
  ok: boolean;
  output?: LogicOutput;
  error?: string;
  durationMs: number;
  stages: string[];
}
