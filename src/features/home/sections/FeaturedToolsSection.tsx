import { SectionWrapper, GlobalContainer } from '@/components/layout';
import { SectionHeading, HomepageGrid, EmptyState } from '@/components/ui';
import { ToolCard } from '../components';
import type { Tool } from '@/types/tools';

interface FeaturedToolsSectionProps {
  tools: Tool[];
}

export function FeaturedToolsSection({ tools }: FeaturedToolsSectionProps) {
  return (
    <SectionWrapper as="section" aria-labelledby="featured-tools-heading">
      <GlobalContainer maxWidth="2xl">
        <div style={{ paddingTop: 'var(--space-12)', paddingBottom: 'var(--space-12)' }}>
          <SectionHeading
            id="featured-tools-heading"
            title="Featured tools"
            description="Hand-picked utilities our users open the most."
          />
          {tools.length === 0 ? (
            <EmptyState title="No featured tools yet" description="Featured tools will appear here." />
          ) : (
            <HomepageGrid columns={3}>
              {tools.map((tool) => (
                <ToolCard key={tool.id} tool={tool} />
              ))}
            </HomepageGrid>
          )}
        </div>
      </GlobalContainer>
    </SectionWrapper>
  );
}
