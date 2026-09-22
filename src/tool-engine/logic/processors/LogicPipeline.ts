import type { LogicInput, LogicPipelineResult, ToolLogicModule } from '../types';
import { normalizeInput, validateAgainstSchema } from '../utils';

export class LogicPipeline {
  async run(module: ToolLogicModule, raw: LogicInput): Promise<LogicPipelineResult> {
    const stages: string[] = [];
    const started = Date.now();
    try {
      stages.push('input');
      const input = normalizeInput(raw);
      stages.push('validation');
      const schemaError = validateAgainstSchema(input, module.inputSchema);
      if (schemaError) throw new Error(schemaError);
      const customError = module.validate(input);
      if (customError) throw new Error(customError);
      stages.push('normalization');
      stages.push('execution');
      let output = await module.process(input);
      stages.push('formatting');
      if (module.transform) output = module.transform(output);
      if (module.result) output = module.result(output);
      stages.push('output');
      stages.push('cleanup');
      return { ok: true, output, durationMs: Date.now() - started, stages };
    } catch (e) {
      return {
        ok: false,
        error: e instanceof Error ? e.message : 'Logic execution failed',
        durationMs: Date.now() - started,
        stages,
      };
    }
  }
}

export const logicPipeline = new LogicPipeline();
