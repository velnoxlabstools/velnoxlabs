import { GlobalContainer } from '@/components/layout';
import { SectionHeading } from '@/components/ui';

export const metadata = {
  title: 'Pricing | VelnoxLabs',
  description: 'Explore affordable and transparent pricing plans for VelnoxLabs.',
};

export default function PricingPage() {
  return (
    <GlobalContainer maxWidth="2xl">
      <div style={{ paddingTop: 'var(--space-8)', paddingBottom: 'var(--space-16)' }}>
        <SectionHeading
          title="Pricing Plans"
          subtitle="Simple, transparent pricing designed for individuals and teams."
        />
        <p style={{ color: 'var(--color-text-muted)', marginTop: 'var(--space-4)' }}>
          Pricing details are currently being updated. Stay tuned!
        </p>
      </div>
    </GlobalContainer>
  );
}
