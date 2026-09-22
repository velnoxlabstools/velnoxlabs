import type { SEOPageInput } from '../types';

export class RobotsGenerator {
  generate(input: Pick<SEOPageInput, 'noIndex' | 'noFollow'>): {
    index: boolean;
    follow: boolean;
  } {
    return {
      index: !input.noIndex,
      follow: !input.noFollow,
    };
  }
}

export const robotsMetaGenerator = new RobotsGenerator();
