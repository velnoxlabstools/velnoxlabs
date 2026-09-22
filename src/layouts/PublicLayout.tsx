import type { ReactNode } from 'react';
import { AppShell } from '@/components/layout';

interface PublicLayoutProps {
  children: ReactNode;
}

export function PublicLayout({ children }: PublicLayoutProps) {
  return <AppShell>{children}</AppShell>;
}
