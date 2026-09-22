import { sanitizeTitle, truncate } from '../utils';
import { APP_NAME } from '@/constants';

export class DynamicTitleGenerator {
  generate(title: string, options?: { includeBrand?: boolean; maxLength?: number }): string {
    const clean = sanitizeTitle(title);
    const withBrand =
      options?.includeBrand === false || clean.includes(APP_NAME)
        ? clean
        : `${clean} | ${APP_NAME}`;
    return truncate(withBrand, options?.maxLength ?? 60);
  }
}

export const dynamicTitleGenerator = new DynamicTitleGenerator();
