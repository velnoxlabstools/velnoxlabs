'use client';

import { useCallback, useMemo, useState } from 'react';
import type { ToolConfiguration } from '../types';
import { toolConfigurationManager } from '../services/ToolConfigurationManager';

export function useToolConfiguration() {
  const [tick, setTick] = useState(0);
  const refresh = useCallback(() => setTick((t) => t + 1), []);

  const configs = useMemo(() => {
    void tick;
    return toolConfigurationManager.list();
  }, [tick]);

  const register = useCallback(
    (config: Partial<ToolConfiguration> & Pick<ToolConfiguration, 'id' | 'name' | 'slug' | 'description' | 'categoryId'>) => {
      const result = toolConfigurationManager.register(config);
      refresh();
      return result;
    },
    [refresh]
  );

  return {
    configs,
    register,
    unregister: (id: string) => {
      const ok = toolConfigurationManager.unregister(id);
      refresh();
      return ok;
    },
    get: toolConfigurationManager.get.bind(toolConfigurationManager),
    getInterfaceSchema: toolConfigurationManager.getInterfaceSchema.bind(toolConfigurationManager),
    refresh,
  };
}
