import type { DiagnosticReport } from "../types";
import { monId } from "../utils";
import { healthManager } from "../health";
import { metricsRegistry } from "../metrics";
import { alertManager } from "../alerts";

export class DiagnosticsManager {
  async capture(notes?: string[]): Promise<DiagnosticReport> {
    const health = await healthManager.check();
    alertManager.evaluate();
    return {
      id: monId("diag"),
      createdAt: Date.now(),
      health,
      metrics: metricsRegistry.list().slice(-50),
      alerts: alertManager.list().slice(0, 20),
      notes,
    };
  }
}

export const diagnosticsManager = new DiagnosticsManager();
