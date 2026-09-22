import type { ContentBlock, GuideDocument } from '../types';

export class GuideGenerator {
  fromSteps(
    id: string,
    title: string,
    slug: string,
    steps: { title: string; body: string }[],
    relatedToolIds?: string[]
  ): GuideDocument {
    return { id, title, slug, steps, relatedToolIds };
  }

  toBlocks(guide: GuideDocument): ContentBlock[] {
    return [
      {
        type: 'stepByStep',
        title: guide.title,
        steps: guide.steps,
        order: 40,
      },
    ];
  }
}

export const guideGenerator = new GuideGenerator();
