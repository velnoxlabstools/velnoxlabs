import { truncate } from '../utils';

export class MetaDescriptionGenerator {
  generate(description: string, maxLength = 160): string {
    return truncate(description || '', maxLength);
  }
}

export const metaDescriptionGenerator = new MetaDescriptionGenerator();
