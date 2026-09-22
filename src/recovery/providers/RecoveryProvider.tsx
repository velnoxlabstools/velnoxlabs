"use client";

import { createContext, useContext, type ReactNode } from "react";
import { recoveryManager } from "../services/RecoveryManager";

const Ctx = createContext(recoveryManager);

export function RecoveryProvider({ children }: { children: ReactNode }) {
  return <Ctx.Provider value={recoveryManager}>{children}</Ctx.Provider>;
}

export function useRecoveryManager() {
  return useContext(Ctx);
}
