import { SectionWrapper, GlobalContainer } from '@/components/layout';
import { SectionHeading, HomepageGrid, EmptyState } from '@/components/ui';
import { ToolCard } from '../components';
import type { Tool } from '@/types/tools';

interface TrendingToolsSectionProps {
  tools: Tool[];
}

export function TrendingToolsSection({ tools }: TrendingToolsSectionProps) {
  return (
    <SectionWrapper as="section" aria-labelledby="trending-tools-heading">
      <GlobalContainer maxWidth="2xl">
        <div style={{ paddingTop: 'var(--space-12)', paddingBottom: 'var(--space-12)' }}>
          <SectionHeading
            id="trending-tools-heading"
            title="Trending now"
            description="Tools gaining attention this week."
          />
          {tools.length === 0 ? (
            <EmptyState title="No trending data" description="Trending tools will appear here." />
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
