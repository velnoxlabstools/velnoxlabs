import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { buildSecurityHeaders } from '@/security/headers';

export function middleware(_request: NextRequest) {
  const response = NextResponse.next();
  const headers = buildSecurityHeaders({
    isProduction: process.env.NODE_ENV === 'production',
  });
  for (const [key, value] of Object.entries(headers)) {
    response.headers.set(key, value);
  }
  return response;
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};
