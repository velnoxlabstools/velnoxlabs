import { notFound } from 'next/navigation';
import { GlobalContainer } from '@/components/layout';
import {
  getToolWithMeta,
  getRelatedForTool,
  incrementToolUsage,
} from '@/services/tools';
import { getRelatedCategories } from '@/services/categories';
import { ToolProvider } from './ToolProvider';
import { ToolHero } from './sections/ToolHero';
import { ToolWorkspace } from './sections/ToolWorkspace';
import { ToolInfoSection } from './sections/ToolInfoSection';
import { ToolDescriptionSection } from './sections/ToolDescriptionSection';
import { ToolFeaturesSection } from './sections/ToolFeaturesSection';
import { ToolStepsSection } from './sections/ToolStepsSection';
import { ToolBenefitsSection } from './sections/ToolBenefitsSection';
import { RelatedToolsSection } from './sections/RelatedToolsSection';
import { RelatedCategoriesSection } from './sections/RelatedCategoriesSection';
import { ToolFaqSection } from './sections/ToolFaqSection';
import {
  uuidSchema,
  base64Schema,
  hashSchema,
  passwordSchema,
  caseSchema,
  wordCounterSchema,
  jsonFormatterSchema,
  colorConverterSchema,
  loremIpsumSchema,
  imageResizerSchema,
  userAgentSchema,
} from './interface';

interface ToolPageProps {
  slug: string;
}

function getStructuredData(slug: string) {
  if (slug === 'user-agent-parser') {
    return {
      '@context': 'https://schema.org',
      '@graph': [
        {
          '@type': 'WebApplication',
          name: 'User-Agent Parser & Analyzer',
          applicationCategory: 'DeveloperApplication',
          operatingSystem: 'All',
          browserRequirements: 'Requires JavaScript. Requires HTML5.',
          offers: {
            '@type': 'Offer',
            price: '0.00',
            priceCurrency: 'USD',
          },
          description:
            'Free client-side User-Agent string parser. Detect browser, engine, OS, device hardware, and AI crawlers instantly with zero server logs.',
        },
        {
          '@type': 'FAQPage',
          mainEntity: [
            {
              '@type': 'Question',
              name: 'Is my User-Agent uploaded to remote servers?',
              acceptedAnswer: {
                '@type': 'Answer',
                text: 'No. All User-Agent parsing and analysis executes entirely inside your browser JavaScript runtime memory.',
              },
            },
            {
              '@type': 'Question',
              name: 'Can it detect AI scrapers like GPTBot and ClaudeBot?',
              acceptedAnswer: {
                '@type': 'Answer',
                text: 'Yes. The engine identifies search crawlers as well as modern AI scrapers like GPTBot, ClaudeBot, and PerplexityBot.',
              },
            },
          ],
        },
      ],
    };
  }

  return null;
}

export function ToolPage({ slug }: ToolPageProps) {
  const payload = getToolWithMeta(slug);
  if (!payload || payload.tool.status !== 'published') {
    notFound();
  }

  const { tool, category } = payload;
  const related = getRelatedForTool(slug);
  const relatedCategories = getRelatedCategories(tool.categoryId, 4);

  try {
    incrementToolUsage(slug);
  } catch {
    /* ignore */
  }

  const structuredData = getStructuredData(slug);
  const toolSchema =
    slug === 'user-agent-parser'
      ? userAgentSchema
      : slug === 'image-resizer'
      ? imageResizerSchema
      : slug === 'lorem-ipsum'
      ? loremIpsumSchema
      : slug === 'color-converter'
      ? colorConverterSchema
      : slug === 'json-formatter'
      ? jsonFormatterSchema
      : slug === 'word-counter'
      ? wordCounterSchema
      : slug === 'case-converter'
      ? caseSchema
      : slug === 'password-generator'
      ? passwordSchema
      : slug === 'base64-encoder'
      ? base64Schema
      : slug === 'hash-generator'
      ? hashSchema
      : uuidSchema;

  return (
    <ToolProvider tool={tool}>
      {structuredData && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
        />
      )}
      <ToolHero tool={tool} category={category} />
      <GlobalContainer maxWidth="2xl">
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'minmax(0, 1fr)',
            gap: 'var(--space-10)',
            paddingTop: 'var(--space-8)',
            paddingBottom: 'var(--space-16)',
          }}
        >
          <ToolWorkspace schema={toolSchema} />

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(16rem, 1fr))',
              gap: 'var(--space-8)',
            }}
          >
            <ToolInfoSection tool={tool} category={category} />
            <ToolDescriptionSection tool={tool} />
          </div>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(16rem, 1fr))',
              gap: 'var(--space-8)',
            }}
          >
            <ToolFeaturesSection />
            <ToolStepsSection />
            <ToolBenefitsSection />
          </div>

          <RelatedToolsSection tools={related?.tools ?? []} />
          <RelatedCategoriesSection categories={relatedCategories} />
          <ToolFaqSection />
        </div>
      </GlobalContainer>
    </ToolProvider>
  );
}