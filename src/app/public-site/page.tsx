import type { Metadata } from 'next';
import { HomePage } from '@/features/home';
import { siteConfig } from '@/config';

export const metadata: Metadata = {
  title: 'Free Developer Tools',
  description: siteConfig.description,
  alternates: { canonical: '/' },
  openGraph: {
    title: `${siteConfig.name} — Free Developer Tools`,
    description: siteConfig.description,
    url: '/',
    type: 'website',
  },
};

export default function Page() {
  return <HomePage />;
}
