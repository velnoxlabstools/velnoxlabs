import type { ReactNode } from 'react';
import { PublicLayout } from '@/layouts';

export default function PublicRouteLayout({
  children,
}: {
  children: ReactNode;
}) {
  return <PublicLayout>{children}</PublicLayout>;
}
