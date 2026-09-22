"use client";

import { createContext, useContext, useEffect, type ReactNode } from "react";
import { monitoringService } from "../services/MonitoringService";

const Ctx = createContext(monitoringService);

export function MonitoringProvider({
  children,
  enableHeartbeat = false,
}: {
  children: ReactNode;
  enableHeartbeat?: boolean;
}) {
  useEffect(() => {
    if (enableHeartbeat) monitoringService.start();
    return () => monitoringService.stop();
  }, [enableHeartbeat]);

  return <Ctx.Provider value={monitoringService}>{children}</Ctx.Provider>;
}

export function useMonitoringService() {
  return useContext(Ctx);
}
