import type { Metadata } from 'next';
import { SearchPage } from '@/features/search';

export const metadata: Metadata = {
  title: 'Search',
  description: 'Search tools, categories, and pages on VelnoxLabs.',
};

interface PageProps {
  searchParams: Promise<{ q?: string }>;
}

export default async function Page({ searchParams }: PageProps) {
  const { q } = await searchParams;
  return <SearchPage query={q ?? ''} />;
}
