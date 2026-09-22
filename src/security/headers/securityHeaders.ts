/**
 * Central HTTP security header policy (apply in Next middleware / platform config).
 */
export function buildSecurityHeaders(options?: {
  isProduction?: boolean;
  csp?: string;
}): Record<string, string> {
  const isProd = options?.isProduction ?? process.env.NODE_ENV === 'production';
  const csp =
    options?.csp ??
    [
      "default-src 'self'",
      "script-src 'self' 'unsafe-inline' 'unsafe-eval'", // tighten when nonce pipeline lands
      "style-src 'self' 'unsafe-inline'",
      "img-src 'self' data: blob: https:",
      "font-src 'self' data:",
      "connect-src 'self' https:",
      "frame-ancestors 'none'",
      "base-uri 'self'",
      "form-action 'self'",
    ].join('; ');

  const headers: Record<string, string> = {
    'Content-Security-Policy': csp,
    'X-Content-Type-Options': 'nosniff',
    'X-Frame-Options': 'DENY',
    'Referrer-Policy': 'strict-origin-when-cross-origin',
    'Permissions-Policy': 'camera=(), microphone=(), geolocation=(), interest-cohort=()',
    'X-XSS-Protection': '0',
    'Cross-Origin-Opener-Policy': 'same-origin',
    'Cross-Origin-Resource-Policy': 'same-origin',
  };

  if (isProd) {
    headers['Strict-Transport-Security'] = 'max-age=31536000; includeSubDomains; preload';
  }

  return headers;
}

export const CSRF_READY = true;
export const rateLimitDefaults = {
  windowMs: 60_000,
  maxRequests: 120,
  toolExecuteMax: 30,
} as const;
