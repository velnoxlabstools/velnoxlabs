import type {
  ExecutionContextSnapshot,
  RuntimeInput,
  RuntimeOutput,
  ToolRuntimeDefinition,
} from '../../types';

export class ToolExecutor {
  async execute(
    definition: ToolRuntimeDefinition,
    input: RuntimeInput,
    ctx: ExecutionContextSnapshot
  ): Promise<RuntimeOutput> {
    const timeoutMs = definition.timeoutMs ?? 30_000;

    const work = Promise.resolve(definition.execute(input, ctx));

    if (!timeoutMs || timeoutMs <= 0) {
      return work;
    }

    let timer: ReturnType<typeof setTimeout> | undefined;

    const timeout = new Promise<never>((_, reject) => {
      timer = setTimeout(() => {
        reject(new Error(`Tool execution timed out after ${timeoutMs}ms`));
      }, timeoutMs);
    });

    try {
      return await Promise.race([work, timeout]);
    } finally {
      if (timer) clearTimeout(timer);
    }
  }
}
