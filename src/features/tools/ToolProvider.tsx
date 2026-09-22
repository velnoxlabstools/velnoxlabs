'use client';

import {
  createContext,
  useContext,
  useMemo,
  type ReactNode,
} from 'react';
import type { ToolConfig } from '@/types/tool-engine';

interface ToolContextValue {
  tool: ToolConfig | null;
}

const ToolContext = createContext<ToolContextValue>({ tool: null });

interface ToolProviderProps {
  tool: ToolConfig | null;
  children: ReactNode;
}

/**
 * Client context for a single tool page (architecture).
 * Actual tool UI components consume this in later parts.
 */
export function ToolProvider({ tool, children }: ToolProviderProps) {
  const value = useMemo(() => ({ tool }), [tool]);
  return <ToolContext.Provider value={value}>{children}</ToolContext.Provider>;
}

export function useTool(): ToolContextValue {
  return useContext(ToolContext);
}
