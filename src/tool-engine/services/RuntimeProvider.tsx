'use client';

import {
  createContext,
  useContext,
  useMemo,
  type ReactNode,
} from 'react';
import type { ExecutionResult, RuntimeInput, RuntimeState } from '../types';
import { runtimeManager } from '../runtime';
import { useRuntime } from '../hooks';

interface RuntimeContextValue {
  state: RuntimeState;
  execute: (idOrSlug: string, input?: RuntimeInput) => Promise<ExecutionResult>;
  cancel: () => void;
  reset: () => void;
  register: typeof runtimeManager.register;
}

const RuntimeContext = createContext<RuntimeContextValue | null>(null);

export function RuntimeProvider({ children }: { children: ReactNode }) {
  const { state, execute, cancel, reset } = useRuntime();

  const value = useMemo(
    () => ({
      state,
      execute,
      cancel,
      reset,
      register: runtimeManager.register.bind(runtimeManager),
    }),
    [state, execute, cancel, reset]
  );

  return (
    <RuntimeContext.Provider value={value}>{children}</RuntimeContext.Provider>
  );
}

export function useRuntimeContext(): RuntimeContextValue {
  const ctx = useContext(RuntimeContext);
  if (!ctx) {
    throw new Error('useRuntimeContext must be used within RuntimeProvider');
  }
  return ctx;
}
