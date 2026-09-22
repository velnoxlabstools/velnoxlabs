import { SectionDivider } from '@/components/ui';
import { loadHomepageData, getEnabledSections } from '@/services/home';
import type { HomepageSectionId } from '@/types/tools';
import {
  HeroSection,
  FeaturedToolsSection,
  PopularCategoriesSection,
  TrendingToolsSection,
  NewToolsSection,
  RecentlyUpdatedSection,
  ToolCollectionsSection,
  WhyChooseSection,
  FeaturesGridSection,
  BenefitsSection,
  HowItWorksSection,
  CategoriesPreviewSection,
  NewsletterSection,
  FaqPreviewSection,
  CtaBannerSection,
} from './sections';

/**
 * Dynamic homepage composition.
 * Sections render from config + live tool/category engines.
 * Reorder or disable sections via homepage.config.ts only.
 */
export function HomePage() {
  const data = loadHomepageData();
  const enabled = getEnabledSections();

  const sectionMap: Record<HomepageSectionId, React.ReactNode> = {
    hero: <HeroSection config={data.config.hero} stats={data.stats} />,
    featuredTools: <FeaturedToolsSection tools={data.featuredTools} />,
    popularCategories: (
      <PopularCategoriesSection categories={data.popularCategories} />
    ),
    trendingTools: <TrendingToolsSection tools={data.trendingTools} />,
    newTools: <NewToolsSection tools={data.newTools} />,
    recentlyUpdated: (
      <RecentlyUpdatedSection tools={data.recentlyUpdatedTools} />
    ),
    collections: <ToolCollectionsSection collections={data.collections} />,
    whyChoose: <WhyChooseSection />,
    features: <FeaturesGridSection />,
    benefits: <BenefitsSection />,
    howItWorks: <HowItWorksSection />,
    categoriesPreview: (
      <CategoriesPreviewSection categories={data.featuredCategories} />
    ),
    newsletter: <NewsletterSection />,
    faq: <FaqPreviewSection faqs={data.faqs} />,
    ctaBanner: <CtaBannerSection cta={data.config.cta} />,
  };

  return (
    <>
      {enabled.map((section, index) => (
        <div key={section.id}>
          {index > 0 && section.id !== 'ctaBanner' && <SectionDivider />}
          {sectionMap[section.id]}
        </div>
      ))}
    </>
  );
}
