import type { Metadata } from 'next';
import { CategoryIndexPage } from '@/features/categories';

export const metadata: Metadata = {
  title: 'Categories',
  description: 'Browse all VelnoxLabs tool categories. Dynamically generated from the category registry.',
};

export default function Page() {
  return <CategoryIndexPage />;
}
