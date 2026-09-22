export type AppEnvironment =
  | "local"
  | "development"
  | "qa"
  | "testing"
  | "staging"
  | "production"
  | "preview";

export interface FeatureFlags {
  betaTools: boolean;
  experimentalSearch: boolean;
  analytics: boolean;
  monitoring: boolean;
  maintenanceMode: boolean;
  [key: string]: boolean;
}

export interface RuntimeConfig {
  env: AppEnvironment;
  appUrl: string;
  apiBaseUrl: string;
  seo: {
    siteName: string;
    defaultLocale: string;
    allowIndexing: boolean;
  };
  analytics: {
    enabled: boolean;
    provider: "none" | "console" | "plausible" | "umami" | "ga4";
  };
  search: {
    debounceMs: number;
    maxResults: number;
  };
  performance: {
    cacheTtlMs: number;
    enablePrefetch: boolean;
  };
  monitoring: {
    enabled: boolean;
    heartbeat: boolean;
  };
  security: {
    strictValidation: boolean;
  };
  theme: {
    defaultTheme: "light" | "dark" | "system";
  };
  flags: FeatureFlags;
}

export interface EnvValidationResult {
  ok: boolean;
  errors: string[];
  warnings: string[];
  env: AppEnvironment;
}
