import type { Metadata } from 'next';
import { ToolsIndexPage } from '@/features/tools/ToolsIndexPage';

export const metadata: Metadata = {
  title: 'Tools',
  description: 'Browse all free online tools on VelnoxLabs.',
};

export default function Page() {
  return <ToolsIndexPage />;
}
