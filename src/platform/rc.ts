/**
 * Release Candidate validation surface.
 */
import { validateBatch3Engines, batch3Ready } from './batch3';
import { bootstrapSeedTools } from './bootstrap/seedTools';
import { environmentManager } from '@/environment';
import { buildSecurityHeaders } from '@/security/headers';
import { searchEngine } from '@/search/engine';

export interface RCReport {
  ready: boolean;
  seed: { ok: boolean; registered: string[] };
  engines: ReturnType<typeof validateBatch3Engines>;
  environment: { ok: boolean; errors: string[]; warnings: string[] };
  securityHeaders: boolean;
  search: boolean;
  checks: Record<string, boolean>;
}

export function runReleaseCandidateValidation(): RCReport {
  const seed = bootstrapSeedTools();
  const engines = validateBatch3Engines();
  const envValidation = environmentManager.validate();
  const headers = buildSecurityHeaders({ isProduction: true });
  const securityHeaders =
    Boolean(headers['Content-Security-Policy']) &&
    Boolean(headers['X-Content-Type-Options']);

  let searchOk = false;
  try {
    const res = searchEngine.search({ q: 'json' });
    searchOk = Array.isArray(res.hits);
  } catch {
    searchOk = false;
  }

  const checks: Record<string, boolean> = {
    seed: seed.ok,
    batch3: batch3Ready(),
    environment: envValidation.ok,
    securityHeaders,
    search: searchOk,
    dataEngine: engines.dataEngine,
    configuration: engines.configuration,
    logic: engines.logic,
    exchange: engines.exchange,
  };

  return {
    ready: Object.values(checks).every(Boolean),
    seed,
    engines,
    environment: {
      ok: envValidation.ok,
      errors: envValidation.errors,
      warnings: envValidation.warnings,
    },
    securityHeaders,
    search: searchOk,
    checks,
  };
}
