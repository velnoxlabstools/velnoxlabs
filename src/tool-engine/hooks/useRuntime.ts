'use client';

import { useCallback, useEffect, useState } from 'react';
import type { ExecutionResult, RuntimeInput, RuntimeState } from '../types';
import { runtimeManager } from '../runtime';
import { createInitialRuntimeState } from '../runtime/ExecutionState';

export function useRuntime() {
  const [state, setState] = useState<RuntimeState>(createInitialRuntimeState);

  useEffect(() => {
    setState(runtimeManager.state);
    return runtimeManager.subscribe(setState);
  }, []);

  const execute = useCallback(async (idOrSlug: string, input?: RuntimeInput) => {
    return runtimeManager.execute(idOrSlug, input);
  }, []);

  const cancel = useCallback(() => {
    runtimeManager.cancel();
  }, []);

  const reset = useCallback(() => {
    runtimeManager.reset();
  }, []);

  return {
    state,
    status: state.status,
    output: state.output,
    error: state.error,
    execute,
    cancel,
    reset,
  };
}

export function useToolExecution(slug: string) {
  const runtime = useRuntime();

  const run = useCallback(
    async (input: RuntimeInput = {}): Promise<ExecutionResult> => {
      return runtime.execute(slug, input);
    },
    [runtime, slug]
  );

  return { ...runtime, run };
}
