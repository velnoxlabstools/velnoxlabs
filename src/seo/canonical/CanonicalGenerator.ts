import { absoluteUrl, isValidPath } from '../utils';

export class CanonicalGenerator {
  generate(path: string): string {
    if (!isValidPath(path) && path !== '/') {
      return absoluteUrl('/');
    }
    return absoluteUrl(path);
  }
}

export const canonicalGenerator = new CanonicalGenerator();
