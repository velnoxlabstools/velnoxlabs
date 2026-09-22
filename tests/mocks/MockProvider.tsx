import type { ReactNode } from 'react';

/** Minimal wrapper for unit tests that need a provider tree without full app shell */
export function MockProvider({ children }: { children: ReactNode }) {
  return <>{children}</>;
}
