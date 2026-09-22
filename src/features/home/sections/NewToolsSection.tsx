import { SectionWrapper, GlobalContainer } from '@/components/layout';
import { SectionHeading, HomepageGrid, EmptyState } from '@/components/ui';
import { ToolCard } from '../components';
import type { Tool } from '@/types/tools';

interface NewToolsSectionProps {
  tools: Tool[];
}

export function NewToolsSection({ tools }: NewToolsSectionProps) {
  return (
    <SectionWrapper as="section" aria-labelledby="new-tools-heading">
      <GlobalContainer maxWidth="2xl">
        <div style={{ paddingTop: 'var(--space-12)', paddingBottom: 'var(--space-12)' }}>
          <SectionHeading
            id="new-tools-heading"
            title="New tools"
            description="Freshly added utilities ready to use."
          />
          {tools.length === 0 ? (
            <EmptyState title="No new tools" description="New tools will show up here first." />
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
