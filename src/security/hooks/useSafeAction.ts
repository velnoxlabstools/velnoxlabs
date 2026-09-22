'use client';

import { useCallback, useState } from 'react';
import { globalErrorHandler, type HandledError } from '../errors';

export function useSafeAction<TArgs extends unknown[], TResult>(
  action: (...args: TArgs) => Promise<TResult> | TResult
) {
  const [error, setError] = useState<HandledError | null>(null);
  const [loading, setLoading] = useState(false);

  const run = useCallback(
    async (...args: TArgs): Promise<TResult | null> => {
      setLoading(true);
      setError(null);
      try {
        const result = await action(...args);
        setLoading(false);
        return result;
      } catch (e) {
        const handled = globalErrorHandler.handle(e);
        setError(handled);
        setLoading(false);
        return null;
      }
    },
    [action]
  );

  return { run, error, loading, clearError: () => setError(null) };
}
