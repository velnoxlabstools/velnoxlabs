'use client';

import { useCallback, useMemo, useState } from 'react';
import type { ToolManifest, RegistrationResult, UnregisterResult } from '../types/registration';
import { toolRegistrar } from '../registry/ToolRegistrar';
import { toolRegistry } from '../registry/ToolRegistry';
import { toolDiscovery } from '../tool-loader';

export function useRegistry() {
  const [version, setVersion] = useState(0);

  const refresh = useCallback(() => setVersion((v) => v + 1), []);

  const register = useCallback(
    (manifest: ToolManifest): RegistrationResult => {
      const result = toolRegistrar.register(manifest);
      refresh();
      return result;
    },
    [refresh]
  );

  const unregister = useCallback(
    (idOrSlug: string): UnregisterResult => {
      const result = toolRegistrar.unregister(idOrSlug);
      refresh();
      return result;
    },
    [refresh]
  );

  const tools = useMemo(() => {
    void version;
    return toolRegistry.list();
  }, [version]);

  return {
    tools,
    register,
    unregister,
    update: toolRegistrar.update.bind(toolRegistrar),
    discover: toolDiscovery,
    refresh,
  };
}
