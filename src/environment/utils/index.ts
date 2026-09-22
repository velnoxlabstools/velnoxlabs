import type { AppEnvironment } from "../types";

export function parseEnvName(raw?: string | null): AppEnvironment {
  const v = (raw ?? "local").toLowerCase().trim();
  if (v === "prod" || v === "production") return "production";
  if (v === "stage" || v === "staging") return "staging";
  if (v === "dev" || v === "development") return "development";
  if (v === "test" || v === "testing") return "testing";
  if (v === "qa") return "qa";
  if (v === "preview") return "preview";
  if (v === "local") return "local";
  return "local";
}

export function readProcessEnv(key: string): string | undefined {
  if (typeof process === "undefined" || !process.env) return undefined;
  return process.env[key];
}

export function boolEnv(key: string, fallback = false): boolean {
  const v = readProcessEnv(key);
  if (v == null) return fallback;
  return ["1", "true", "yes", "on"].includes(v.toLowerCase());
}
