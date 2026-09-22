import type { AppEnvironment, EnvValidationResult, RuntimeConfig } from "../types";

export class EnvironmentValidator {
  validateEnvName(env: AppEnvironment): string[] {
    const allowed: AppEnvironment[] = [
      "local",
      "development",
      "qa",
      "testing",
      "staging",
      "production",
      "preview",
    ];
    return allowed.includes(env) ? [] : ["Unknown environment: " + env];
  }

  validateConfig(config: RuntimeConfig): EnvValidationResult {
    const errors: string[] = [];
    const warnings: string[] = [];

    errors.push(...this.validateEnvName(config.env));

    if (!config.appUrl) errors.push("appUrl is required");
    if (config.appUrl && !/^https?:\/\//i.test(config.appUrl) && config.env === "production") {
      errors.push("production appUrl must be absolute http(s) URL");
    }
    if (config.env === "production" && config.seo.allowIndexing === false) {
      warnings.push("Production has indexing disabled");
    }
    if (config.env === "production" && config.flags.maintenanceMode) {
      warnings.push("Production maintenance mode enabled");
    }
    if (config.search.debounceMs < 0) errors.push("search.debounceMs must be >= 0");
    if (config.search.maxResults < 1) errors.push("search.maxResults must be >= 1");

    return {
      ok: errors.length === 0,
      errors,
      warnings,
      env: config.env,
    };
  }
}

export const environmentValidator = new EnvironmentValidator();
