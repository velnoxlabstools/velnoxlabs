import type { LogicInput, LogicPipelineResult, ToolLogicModule } from './types';
import { logicRegistry } from './LogicRegistry';
import { logicResolver } from './LogicResolver';
import { logicPipeline } from './processors';
import { runtimeManager } from '../runtime';

export class ToolLogicManager {
  register(logicModule: ToolLogicModule): void {
    logicRegistry.register(logicModule);
    runtimeManager.register({
      id: logicModule.id,
      slug: logicModule.id,
      kind: logicModule.kind,
      execute: async (input) => {
        const result = await logicPipeline.run(logicModule, input);
        if (!result.ok) throw new Error(result.error ?? 'Logic failed');
        return result.output ?? {};
      },
      validate: (input) => logicModule.validate(input),
    });
  }

  unregister(id: string): boolean {
    runtimeManager.unregister(id);
    return logicRegistry.unregister(id);
  }

  async execute(idOrSlug: string, input: LogicInput = {}): Promise<LogicPipelineResult> {
    const logicModule = logicResolver.resolve(idOrSlug);
    return logicPipeline.run(logicModule, input);
  }

  list(): ToolLogicModule[] {
    return logicRegistry.list();
  }
}

export const toolLogicManager = new ToolLogicManager();
