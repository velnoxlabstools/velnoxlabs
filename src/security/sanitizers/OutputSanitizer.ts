import { inputSanitizer } from './InputSanitizer';

export class OutputSanitizer {
  /** Escape user-derived text before injecting into HTML contexts */
  text(value: unknown): string {
    return inputSanitizer.html(value);
  }

  /** Safe JSON for embedding */
  json(value: unknown): string {
    return JSON.stringify(value)
      .replace(/</g, '\\u003c')
      .replace(/>/g, '\\u003e')
      .replace(/&/g, '\\u0026')
      .replace(/\u2028/g, '\\u2028')
      .replace(/\u2029/g, '\\u2029');
  }
}

export const outputSanitizer = new OutputSanitizer();
