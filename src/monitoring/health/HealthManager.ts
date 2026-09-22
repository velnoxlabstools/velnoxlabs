import type { HealthReport, HealthStatus } from "../types";
import { healthCheckService } from "./HealthCheckService";

function aggregate(statuses: HealthStatus[]): HealthStatus {
  if (statuses.some((s) => s === "fail")) return "fail";
  if (statuses.some((s) => s === "degraded" || s === "unknown")) return "degraded";
  return "pass";
}

export class HealthManager {
  async check(): Promise<HealthReport> {
    const checks = await healthCheckService.runAll();
    return {
      status: aggregate(checks.map((c) => c.status)),
      checks,
      timestamp: Date.now(),
    };
  }
}

export const healthManager = new HealthManager();
