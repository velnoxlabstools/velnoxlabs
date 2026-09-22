'use client';

import { createContext, useContext, type ReactNode } from 'react';
import { toolLogicManager } from './ToolLogicManager';
import { logicRegistry } from './LogicRegistry';

const LogicContext = createContext({
  manager: toolLogicManager,
  registry: logicRegistry,
});

export function LogicProvider({ children }: { children: ReactNode }) {
  return (
    <LogicContext.Provider value={{ manager: toolLogicManager, registry: logicRegistry }}>
      {children}
    </LogicContext.Provider>
  );
}

export function useLogicContext() {
  return useContext(LogicContext);
}
