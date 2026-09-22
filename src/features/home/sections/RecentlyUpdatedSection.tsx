import { SectionWrapper, GlobalContainer } from '@/components/layout';
import { SectionHeading, HomepageGrid, EmptyState } from '@/components/ui';
import { ToolCard } from '../components';
import type { Tool } from '@/types/tools';

interface RecentlyUpdatedSectionProps {
  tools: Tool[];
}

export function RecentlyUpdatedSection({ tools }: RecentlyUpdatedSectionProps) {
  return (
    <SectionWrapper as="section" aria-labelledby="recently-updated-heading">
      <GlobalContainer maxWidth="2xl">
        <div style={{ paddingTop: 'var(--space-12)', paddingBottom: 'var(--space-12)' }}>
          <SectionHeading
            id="recently-updated-heading"
            title="Recently updated"
            description="Tools improved with the latest features and fixes."
          />
          {tools.length === 0 ? (
            <EmptyState title="No updates yet" description="Recently updated tools will list here." />
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
