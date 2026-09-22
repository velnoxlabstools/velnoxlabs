import type { ExecutionResult, RuntimeInput, ToolRuntimeDefinition } from '../types';
import { InputProcessor, OutputProcessor } from './processors';
import { ToolExecutor } from './executors';
import { createExecutionContext } from './ExecutionContext';
import { ExecutionLogger } from '../utils';

export class ExecutionPipeline {
  private inputProcessor = new InputProcessor();
  private outputProcessor = new OutputProcessor();
  private executor = new ToolExecutor();

  async run(
    definition: ToolRuntimeDefinition,
    rawInput: RuntimeInput,
    signal?: AbortSignal
  ): Promise<ExecutionResult> {
    const logger = new ExecutionLogger();
    const startedAt = Date.now();
    const ctx = createExecutionContext(definition.id, definition.slug, definition.kind, signal);

    try {
      logger.info('Validating input');
      if (signal?.aborted) {
        throw new Error('Cancelled');
      }

      const input = this.inputProcessor.process(rawInput, definition);
      logger.info('Executing tool', { slug: definition.slug });

      const rawOutput = await this.executor.execute(definition, input, ctx);

      if (signal?.aborted) {
        throw new Error('Cancelled');
      }

      const output = this.outputProcessor.process(rawOutput);
      logger.info('Completed');

      return {
        ok: true,
        status: 'completed',
        output,
        durationMs: Date.now() - startedAt,
        toolId: definition.id,
        slug: definition.slug,
      };
    } catch (e) {
      const message = e instanceof Error ? e.message : 'Execution failed';
      const cancelled = message === 'Cancelled' || signal?.aborted;
      logger.error(message);

      return {
        ok: false,
        status: cancelled ? 'cancelled' : 'failed',
        error: message,
        durationMs: Date.now() - startedAt,
        toolId: definition.id,
        slug: definition.slug,
      };
    }
  }
}
