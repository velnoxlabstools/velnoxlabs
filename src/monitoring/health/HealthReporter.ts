import type { HealthReport } from "../types";
import { healthManager } from "./HealthManager";

export class HealthReporter {
  async report(): Promise<HealthReport> {
    return healthManager.check();
  }

  toJson(report: HealthReport): string {
    return JSON.stringify(report);
  }
}

export const healthReporter = new HealthReporter();
