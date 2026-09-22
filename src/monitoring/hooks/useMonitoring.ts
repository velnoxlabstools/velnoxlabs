"use client";

import { useCallback } from "react";
import { monitoringService } from "../services/MonitoringService";

export function useMonitoring() {
  const trackToolTiming = useCallback((ms: number, slug?: string) => {
    monitoringService.performance.toolExecution(ms, slug);
  }, []);

  const trackError = useCallback((tag?: string) => {
    monitoringService.errors.increment(tag);
    monitoringService.alerts.evaluate();
  }, []);

  const snapshot = useCallback(() => monitoringService.snapshot(), []);

  return {
    trackToolTiming,
    trackError,
    snapshot,
    health: () => monitoringService.health.check(),
  };
}
