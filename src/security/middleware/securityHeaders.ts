export {
  buildSecurityHeaders,
  CSRF_READY,
  rateLimitDefaults,
} from '../headers/securityHeaders';

import { buildSecurityHeaders as build } from '../headers/securityHeaders';

/** @deprecated use buildSecurityHeaders */
export function securityHeaders(): Record<string, string> {
  return build();
}
