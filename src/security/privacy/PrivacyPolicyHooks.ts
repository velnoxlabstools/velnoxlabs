/** Structural checklist for legal pages (content lives in marketing routes later). */
export const privacyArchitecture = {
  pages: ['/privacy', '/terms', '/cookies', '/disclaimer'] as const,
  gdprReady: true,
  ccpaReady: true,
  notes: [
    'Analytics disabled until consent.analytics is true',
    'No PII in analytics event payloads by design',
    'Local preference storage is device-local only',
  ],
};
