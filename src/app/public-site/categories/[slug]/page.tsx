import type { Metadata } from 'next';
import { CategoryDetailPage } from '@/features/categories';
import { findCategoryBySlug, getCategorySlugs } from '@/services/categories';
import { siteConfig } from '@/config';

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  return getCategorySlugs().map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const category = findCategoryBySlug(slug);
  if (!category) {
    return { title: 'Category not found', robots: { index: false, follow: false } };
  }
  const path = `/categories/${category.slug}`;
  return {
    title: category.name,
    description: category.description,
    alternates: { canonical: path },
    openGraph: {
      title: `${category.name} | ${siteConfig.name}`,
      description: category.description,
      url: path,
      type: 'website',
    },
  };
}

export default async function Page({ params }: PageProps) {
  const { slug } = await params;
  return <CategoryDetailPage slug={slug} />;
}
