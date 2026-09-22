import type { ToolContentDocument } from '../types';

export function createDefaultToolContent(
  toolId: string,
  slug: string,
  name: string,
  description: string
): ToolContentDocument {
  return {
    toolId,
    slug,
    locale: 'en',
    blocks: [
      {
        type: 'introduction',
        title: `About ${name}`,
        body: description,
        order: 10,
      },
      {
        type: 'keyFeatures',
        title: 'Key features',
        items: [
          'Runs in your browser',
          'No account required',
          'Free to use',
        ],
        order: 20,
      },
      {
        type: 'howToUse',
        title: 'How to use',
        steps: [
          { title: 'Open the tool', body: 'You are on the tool page.' },
          { title: 'Enter input', body: 'Fill in the fields in the workspace.' },
          { title: 'Run', body: 'Click Run to process and view results.' },
        ],
        order: 40,
      },
      {
        type: 'faqs',
        title: 'FAQ',
        faqs: [
          {
            question: 'Is this tool free?',
            answer: 'Yes. Core VelnoxLabs tools are free to use.',
          },
        ],
        order: 90,
      },
      {
        type: 'disclaimer',
        title: 'Disclaimer',
        body: 'Use results at your own discretion. Always verify critical outputs.',
        order: 100,
      },
    ],
  };
}
