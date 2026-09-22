export const complianceChecklist = {
  gdpr: ['consent', 'data-minimization', 'export-delete-ready', 'privacy-policy'],
  ccpa: ['do-not-sell-ready', 'privacy-policy'],
  security: ['headers', 'validation', 'sanitization', 'rate-limit-ready', 'safe-errors'],
} as const;
