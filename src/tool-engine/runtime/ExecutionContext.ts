import type { ExecutionContextSnapshot, ToolKind } from '../types';

export function createExecutionContext(
  toolId: string,
  slug: string,
  kind: ToolKind,
  signal?: AbortSignal
): ExecutionContextSnapshot {
  return {
    toolId,
    slug,
    kind,
    startedAt: Date.now(),
    signal,
  };
}
