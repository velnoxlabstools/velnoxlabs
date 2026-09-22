'use client';

import { useCallback, useState } from 'react';
import type { DataFormat, TransformOp, TransformResult } from '../types';
import { dataEngine } from '../services/DataEngine';

export function useDataEngine() {
  const [result, setResult] = useState<TransformResult | null>(null);
  const [loading, setLoading] = useState(false);

  const run = useCallback(
    async (
      input: string,
      operation: TransformOp,
      format?: DataFormat,
      targetFormat?: DataFormat
    ) => {
      setLoading(true);
      const res = await dataEngine.run(input, operation, format, targetFormat);
      setResult(res);
      setLoading(false);
      return res;
    },
    []
  );

  return { run, result, loading, listTransformers: () => dataEngine.listTransformers() };
}
