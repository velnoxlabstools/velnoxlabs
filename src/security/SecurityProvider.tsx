'use client';

import { createContext, useContext, type ReactNode } from 'react';
import { ErrorBoundary } from './errors';
import { logger } from './logging';
import { validationManager } from './validators';
import { inputSanitizer, outputSanitizer } from './sanitizers';
import { globalErrorHandler } from './errors';
import { recoveryManager } from './errors';

const SecurityContext = createContext({
  logger,
  validation: validationManager,
  sanitizeInput: inputSanitizer,
  sanitizeOutput: outputSanitizer,
  handleError: globalErrorHandler.handle.bind(globalErrorHandler),
  recovery: recoveryManager,
});

export function SecurityProvider({ children }: { children: ReactNode }) {
  return (
    <SecurityContext.Provider
      value={{
        logger,
        validation: validationManager,
        sanitizeInput: inputSanitizer,
        sanitizeOutput: outputSanitizer,
        handleError: globalErrorHandler.handle.bind(globalErrorHandler),
        recovery: recoveryManager,
      }}
    >
      <ErrorBoundary>{children}</ErrorBoundary>
    </SecurityContext.Provider>
  );
}

export function useSecurity() {
  return useContext(SecurityContext);
}
