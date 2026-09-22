"use client";

import { createContext, useContext, useMemo, type ReactNode } from "react";
import type { RuntimeConfig } from "../types";
import { environmentManager } from "../services/EnvironmentManager";

const Ctx = createContext<RuntimeConfig | null>(null);

export function ConfigurationProvider({ children }: { children: ReactNode }) {
  const value = useMemo(() => environmentManager.getConfig(), []);
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useRuntimeConfig(): RuntimeConfig {
  const ctx = useContext(Ctx);
  if (!ctx) return environmentManager.getConfig();
  return ctx;
}
