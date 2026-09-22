import type { RuntimeConfig } from "../types";
import { parseEnvName, readProcessEnv, boolEnv } from "../utils";
import { featureFlagManager } from "../configuration";

function buildConfig(): RuntimeConfig {
  const env = parseEnvName(readProcessEnv("NEXT_PUBLIC_APP_ENV") ?? readProcessEnv("NODE_ENV"));
  const appUrl =
    readProcessEnv("NEXT_PUBLIC_APP_URL") ??
    (env === "production" ? "https://velnoxlabs.com" : "http://localhost:3000");

  const flags = featureFlagManager.load({
    betaTools: boolEnv("NEXT_PUBLIC_FLAG_BETA_TOOLS", false),
    experimentalSearch: boolEnv("NEXT_PUBLIC_FLAG_EXPERIMENTAL_SEARCH", false),
    analytics: boolEnv("NEXT_PUBLIC_FLAG_ANALYTICS", env !== "local"),
    monitoring: boolEnv("NEXT_PUBLIC_FLAG_MONITORING", true),
    maintenanceMode: boolEnv("NEXT_PUBLIC_FLAG_MAINTENANCE", false),
  });

  return {
    env,
    appUrl,
    apiBaseUrl: readProcessEnv("NEXT_PUBLIC_API_BASE_URL") ?? appUrl,
    seo: {
      siteName: readProcessEnv("NEXT_PUBLIC_SITE_NAME") ?? "VelnoxLabs",
      defaultLocale: readProcessEnv("NEXT_PUBLIC_DEFAULT_LOCALE") ?? "en",
      allowIndexing: boolEnv("NEXT_PUBLIC_ALLOW_INDEXING", env === "production"),
    },
    analytics: {
      enabled: flags.analytics,
      provider: (readProcessEnv("NEXT_PUBLIC_ANALYTICS_PROVIDER") as RuntimeConfig["analytics"]["provider"]) ?? "console",
    },
    search: {
      debounceMs: Number(readProcessEnv("NEXT_PUBLIC_SEARCH_DEBOUNCE_MS") ?? 150),
      maxResults: Number(readProcessEnv("NEXT_PUBLIC_SEARCH_MAX_RESULTS") ?? 20),
    },
    performance: {
      cacheTtlMs: Number(readProcessEnv("NEXT_PUBLIC_CACHE_TTL_MS") ?? 60_000),
      enablePrefetch: boolEnv("NEXT_PUBLIC_ENABLE_PREFETCH", true),
    },
    monitoring: {
      enabled: flags.monitoring,
      heartbeat: boolEnv("NEXT_PUBLIC_MONITORING_HEARTBEAT", false),
    },
    security: {
      strictValidation: boolEnv("NEXT_PUBLIC_STRICT_VALIDATION", env === "production"),
    },
    theme: {
      defaultTheme:
        (readProcessEnv("NEXT_PUBLIC_DEFAULT_THEME") as RuntimeConfig["theme"]["defaultTheme"]) ??
        "system",
    },
    flags,
  };
}

let cached: RuntimeConfig | null = null;

export class RuntimeConfiguration {
  get(): RuntimeConfig {
    if (!cached) cached = buildConfig();
    return cached;
  }

  reload(): RuntimeConfig {
    cached = null;
    return this.get();
  }
}

export const runtimeConfiguration = new RuntimeConfiguration();
