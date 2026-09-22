import { describe, it, expect } from 'vitest';
import { buildSecurityHeaders } from '@/security/headers';
import { globalRateLimiter, toolRateLimiter } from '@/security/rate-limit';
import { slugValidator, routeValidator } from '@/security/validators';
import { inputSanitizer, outputSanitizer } from '@/security/sanitizers';
import { consentManager } from '@/security/privacy';
import { AppError, globalErrorHandler } from '@/security/errors';

describe('Security hardening', () => {
  it('emits CSP and nosniff headers', () => {
    const h = buildSecurityHeaders({ isProduction: true });
    expect(h['Content-Security-Policy']).toContain("default-src 'self'");
    expect(h['X-Content-Type-Options']).toBe('nosniff');
    expect(h['X-Frame-Options']).toBe('DENY');
    expect(h['Strict-Transport-Security']).toContain('max-age');
  });

  it('rate limits repeated keys', () => {
    globalRateLimiter.reset('test-key');
    let lastAllowed = true;
    for (let i = 0; i < 130; i++) {
      lastAllowed = globalRateLimiter.check('test-key', 120).allowed;
    }
    expect(lastAllowed).toBe(false);
  });

  it('tool limiter is stricter', () => {
    toolRateLimiter.reset('tool-a');
    for (let i = 0; i < 30; i++) toolRateLimiter.check('tool-a');
    expect(toolRateLimiter.check('tool-a').allowed).toBe(false);
  });

  it('rejects unsafe routes and slugs', () => {
    expect(routeValidator.validate('https://evil.com').valid).toBe(false);
    expect(routeValidator.validate('/tools/json').valid).toBe(true);
    expect(slugValidator.validate('../etc').valid).toBe(false);
  });

  it('sanitizes HTML and JSON embedding', () => {
    expect(inputSanitizer.html('<img onerror=alert(1)>')).not.toContain('<img');
    expect(outputSanitizer.json({ a: '</script>' })).toContain('\\u003c');
  });

  it('does not leak stack traces in public errors', () => {
    const handled = globalErrorHandler.handle(new Error('ECONNREFUSED at Module.load'));
    expect(handled.message.toLowerCase()).not.toContain('econnrefused');
  });

  it('AppError validation is client-safe', () => {
    const err = AppError.validation('Invalid input');
    expect(err.status).toBe(400);
    expect(err.publicMessage).toBe('Invalid input');
  });

  it('consent defaults analytics off', () => {
    const c = consentManager.get();
    expect(c.necessary).toBe(true);
    expect(c.analytics).toBe(false);
  });
});
