import { SectionWrapper, GlobalContainer } from '@/components/layout';
import { SectionHeading, HomepageGrid, EmptyState } from '@/components/ui';
import { CollectionCard } from '../components';
import type { ToolCollection } from '@/types/tools';

interface ToolCollectionsSectionProps {
  collections: ToolCollection[];
}

export function ToolCollectionsSection({ collections }: ToolCollectionsSectionProps) {
  return (
    <SectionWrapper as="section" aria-labelledby="collections-heading">
      <GlobalContainer maxWidth="2xl">
        <div style={{ paddingTop: 'var(--space-12)', paddingBottom: 'var(--space-12)' }}>
          <SectionHeading
            id="collections-heading"
            title="Tool collections"
            description="Curated sets of tools for common workflows."
          />
          {collections.length === 0 ? (
            <EmptyState title="Collections coming soon" description="Curated collections will appear here." />
          ) : (
            <HomepageGrid columns={2}>
              {collections.map((col) => (
                <CollectionCard key={col.id} collection={col} />
              ))}
            </HomepageGrid>
          )}
        </div>
      </GlobalContainer>
    </SectionWrapper>
  );
}
