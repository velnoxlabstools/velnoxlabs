import { GlobalContainer } from '@/components/layout';
import { SectionHeading } from '@/components/ui';

export const metadata = {
  title: 'Blog | VelnoxLabs',
  description: 'Read the latest articles, updates, and insights from VelnoxLabs.',
};

export default function BlogPage() {
  return (
    <GlobalContainer maxWidth="2xl">
      <div style={{ paddingTop: 'var(--space-8)', paddingBottom: 'var(--space-16)' }}>
        <SectionHeading
          title="Blog & Insights"
          subtitle="Discover the latest articles, engineering updates, and product announcements."
        />
        <p style={{ color: 'var(--color-text-muted)', marginTop: 'var(--space-4)' }}>
          Blog posts are currently being prepared. Stay tuned!
        </p>
      </div>
    </GlobalContainer>
  );
}
