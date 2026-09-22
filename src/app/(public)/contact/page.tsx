import { GlobalContainer } from '@/components/layout';
import { SectionHeading } from '@/components/ui';

export const metadata = {
  title: 'Contact Us | VelnoxLabs',
  description: 'Get in touch with the VelnoxLabs team for support, queries, or feedback.',
};

export default function ContactPage() {
  return (
    <GlobalContainer maxWidth="2xl">
      <div style={{ paddingTop: 'var(--space-8)', paddingBottom: 'var(--space-16)' }}>
        <SectionHeading
          title="Contact Us"
          subtitle="Have questions, feedback, or need support? Reach out to our team."
        />
        <p style={{ color: 'var(--color-text-muted)', marginTop: 'var(--space-4)' }}>
          Contact options and forms are currently being set up. Stay tuned!
        </p>
      </div>
    </GlobalContainer>
  );
}
