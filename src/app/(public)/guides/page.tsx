import { GlobalContainer } from '@/components/layout';
import { SectionHeading } from '@/components/ui';

export const metadata = {
  title: 'Guides | VelnoxLabs',
  description: 'Explore comprehensive guides and tutorials.',
};

export default function GuidesPage() {
  return (
    <GlobalContainer maxWidth="2xl">
      <div style={{ paddingTop: 'var(--space-8)', paddingBottom: 'var(--space-16)' }}>
        <SectionHeading
          title="Guides & Tutorials"
          subtitle="Comprehensive guides to help you build and scale your workflow."
        />
        <p style={{ color: 'var(--color-text-muted)', marginTop: 'var(--space-4)' }}>
          New guides are currently being published. Stay tuned!
        </p>
      </div>
    </GlobalContainer>
  );
}