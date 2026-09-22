import { asText, truncateForSafety } from '../utils';

export class InputNormalizer {
  normalize(input: string): string {
    return truncateForSafety(asText(input).replace(/^\uFEFF/, ''));
  }
}

export const inputNormalizer = new InputNormalizer();
