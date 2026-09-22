import type { ExecutionResult, RuntimeInput, RuntimeState, ToolRuntimeDefinition } from '../types';
import { toolResolver, toolRuntimeRegistry } from '../registry';
import { toolValidator } from './ToolValidator';
import { ExecutionPipeline } from './ExecutionPipeline';
import { ExecutionQueue } from './ExecutionQueue';
import { ExecutionStateStore } from './ExecutionState';

/**
 * Central runtime manager — every tool execution goes through here.
 */
export class RuntimeManager {
  private pipeline = new ExecutionPipeline();
  private queue = new ExecutionQueue();
  private store = new ExecutionStateStore();
  private abortController: AbortController | null = null;

  get state(): RuntimeState {
    return this.store.getState();
  }

  subscribe(listener: (s: RuntimeState) => void): () => void {
    return this.store.subscribe(listener);
  }

  register(definition: ToolRuntimeDefinition): void {
    toolValidator.assertValid(definition);
    toolRuntimeRegistry.register(definition);
  }

  unregister(idOrSlug: string): boolean {
    return toolRuntimeRegistry.unregister(idOrSlug);
  }

  execute(idOrSlug: string, input: RuntimeInput = {}): Promise<ExecutionResult> {
    return new Promise<ExecutionResult>((resolve, reject) => {
      void this.queue.enqueue(async () => {
        try {
          const result = await this.runInternal(idOrSlug, input);
          resolve(result);
        } catch (e) {
          reject(e);
        }
      });
    });
  }

  private async runInternal(idOrSlug: string, input: RuntimeInput): Promise<ExecutionResult> {
    this.abortController = new AbortController();
    const signal = this.abortController.signal;

    this.store.patch({
      status: 'loading',
      toolId: null,
      slug: idOrSlug,
      input,
      output: null,
      error: null,
      logs: [],
    });

    let definition: ToolRuntimeDefinition;
    try {
      this.store.setStatus('validating');
      definition = toolResolver.resolve(idOrSlug);
    } catch (e) {
      const message = e instanceof Error ? e.message : 'Tool not found';
      const result: ExecutionResult = {
        ok: false,
        status: 'failed',
        error: message,
        durationMs: 0,
        toolId: idOrSlug,
        slug: idOrSlug,
      };
      this.store.setResult(result);
      this.abortController = null;
      return result;
    }

    this.store.patch({
      status: 'executing',
      toolId: definition.id,
      slug: definition.slug,
    });

    const result = await this.pipeline.run(definition, input, signal);
    this.store.setResult(result);
    this.abortController = null;
    return result;
  }

  cancel(): void {
    this.abortController?.abort();
    this.store.setStatus('cancelled');
  }

  reset(): void {
    this.cancel();
    this.queue.clear();
    this.store.reset();
  }

  cleanup(): void {
    this.reset();
  }
}

export const runtimeManager = new RuntimeManager();
