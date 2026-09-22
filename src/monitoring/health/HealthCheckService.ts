import type { HealthCheckResult } from "../types";

export type HealthProbe = () => Promise<boolean> | boolean;

const probes = new Map<string, HealthProbe>();

function registerDefaults() {
  if (probes.size) return;
  probes.set("application", () => true);
  probes.set("homepage", () => true);
  probes.set("category", () => true);
  probes.set("tool-engine", () => true);
  probes.set("search-engine", () => true);
  probes.set("registry", () => true);
  probes.set("seo-engine", () => true);
  probes.set("analytics", () => true);
  probes.set("file-engine", () => true);
  probes.set("runtime", () => true);
}

export class HealthCheckService {
  register(id: string, probe: HealthProbe): void {
    probes.set(id, probe);
  }

  async runOne(id: string): Promise<HealthCheckResult> {
    registerDefaults();
    const start = Date.now();
    const probe = probes.get(id);
    if (!probe) {
      return {
        id,
        status: "unknown",
        message: "No probe registered",
        durationMs: 0,
        timestamp: Date.now(),
      };
    }
    try {
      const ok = await probe();
      return {
        id,
        status: ok ? "pass" : "fail",
        durationMs: Date.now() - start,
        timestamp: Date.now(),
      };
    } catch (e) {
      return {
        id,
        status: "fail",
        message: e instanceof Error ? e.message : "Probe error",
        durationMs: Date.now() - start,
        timestamp: Date.now(),
      };
    }
  }

  async runAll(): Promise<HealthCheckResult[]> {
    registerDefaults();
    const ids = [...probes.keys()];
    return Promise.all(ids.map((id) => this.runOne(id)));
  }

  list(): string[] {
    registerDefaults();
    return [...probes.keys()];
  }
}

export const healthCheckService = new HealthCheckService();
