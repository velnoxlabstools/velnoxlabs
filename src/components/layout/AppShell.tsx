import type { ReactNode } from 'react';
import { LAYOUT_IDS } from '@/constants/layout';
import { MainContent } from './MainContent';

interface AppShellProps {
  children: ReactNode;
}

export function AppShell({ children }: AppShellProps) {
  return (
    <div
      id={LAYOUT_IDS.appShell}
      className="app-shell"
      style={{
        display: 'flex',
        flexDirection: 'column',
        minHeight: '100vh',
        width: '100%',
      }}
    >
      <MainContent>{children}</MainContent>
      </div>
  );
}
