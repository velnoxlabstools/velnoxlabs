import { healthManager } from "../health";
import { metricsCollector, performanceMetrics, errorMetrics, runtimeMetrics } from "../metrics";
import { alertManager } from "../alerts";
import { diagnosticsManager } from "../diagnostics";
import { heartbeatService } from "../observability";
import { telemetryManager } from "../telemetry";
import { monitoringLogger } from "../logging";

export class MonitoringService {
  health = healthManager;
  metrics = metricsCollector;
  performance = performanceMetrics;
  errors = errorMetrics;
  runtime = runtimeMetrics;
  alerts = alertManager;
  diagnostics = diagnosticsManager;
  telemetry = telemetryManager;
  log = monitoringLogger;

  start(): void {
    heartbeatService.start();
    monitoringLogger.info("monitoring_started");
  }

  stop(): void {
    heartbeatService.stop();
  }

  async snapshot() {
    return diagnosticsManager.capture(["snapshot"]);
  }
}

export const monitoringService = new MonitoringService();
