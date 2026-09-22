import type { ExecutionResult, RuntimeInput, RuntimeOutput, RuntimeState, RuntimeStatus } from '../types';
import type { ExecutionLogEntry } from '../types';

export function createInitialRuntimeState(): RuntimeState {
  return {
    status: 'idle',
    toolId: null,
    slug: null,
    input: {},
    output: null,
    error: null,
    logs: [],
    lastResult: null,
  };
}

export class ExecutionStateStore {
  private state: RuntimeState = createInitialRuntimeState();
  private listeners = new Set<(s: RuntimeState) => void>();

  getState(): RuntimeState {
    return this.state;
  }

  setStatus(status: RuntimeStatus): void {
    this.patch({ status });
  }

  patch(partial: Partial<RuntimeState>): void {
    this.state = { ...this.state, ...partial };
    this.emit();
  }

  setInput(input: RuntimeInput): void {
    this.patch({ input });
  }

  setOutput(output: RuntimeOutput | null): void {
    this.patch({ output });
  }

  setError(error: string | null): void {
    this.patch({ error, status: error ? 'failed' : this.state.status });
  }

  appendLogs(logs: ExecutionLogEntry[]): void {
    this.patch({ logs: [...this.state.logs, ...logs] });
  }

  setResult(result: ExecutionResult): void {
    this.patch({
      lastResult: result,
      status: result.status,
      output: result.output ?? null,
      error: result.error ?? null,
    });
  }

  reset(): void {
    this.state = createInitialRuntimeState();
    this.emit();
  }

  subscribe(listener: (s: RuntimeState) => void): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  private emit(): void {
    for (const l of this.listeners) l(this.state);
  }
}
