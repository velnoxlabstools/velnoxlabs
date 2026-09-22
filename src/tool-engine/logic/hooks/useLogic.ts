'use client';

import { useCallback, useState } from 'react';
import type { LogicInput, LogicPipelineResult } from '../types';
import { toolLogicManager } from '../ToolLogicManager';

export function useLogic(moduleId?: string) {
  const [result, setResult] = useState<LogicPipelineResult | null>(null);
  const [loading, setLoading] = useState(false);

  const execute = useCallback(
    async (input: LogicInput, id = moduleId) => {
      if (!id) throw new Error('moduleId required');
      setLoading(true);
      try {
        const res = await toolLogicManager.execute(id, input);
        setResult(res);
        return res;
      } finally {
        setLoading(false);
      }
    },
    [moduleId]
  );

  return { execute, result, loading };
}
