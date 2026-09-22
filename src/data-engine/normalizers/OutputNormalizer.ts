export class OutputNormalizer {
  normalize(output: unknown): string {
    if (typeof output === 'string') return output;
    if (output == null) return '';
    try {
      return JSON.stringify(output, null, 2);
    } catch {
      return String(output);
    }
  }
}

export const outputNormalizer = new OutputNormalizer();
