import { GlobalContainer } from '@/components/layout';
import { SectionHeading } from '@/components/ui';

export const metadata = {
  title: 'Documentation | VelnoxLabs',
  description: 'Explore technical documentation and API guides.',
};

export default function DocsPage() {
  return (
    <GlobalContainer maxWidth="2xl">
      <div style={{ paddingTop: 'var(--space-8)', paddingBottom: 'var(--space-16)' }}>
        <SectionHeading
          title="Documentation"
          subtitle="Explore technical documentation, integration guides, and API references."
        />
        <p style={{ color: 'var(--color-text-muted)', marginTop: 'var(--space-4)' }}>
          Documentation pages are currently being prepared. Stay tuned!
        </p>
      </div>
    </GlobalContainer>
  );
}
