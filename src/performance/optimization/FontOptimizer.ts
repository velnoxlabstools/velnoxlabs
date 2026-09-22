/**
 * Font loading policy — prefer next/font, swap display, subset.
 */
export class FontOptimizer {
  display(): 'swap' | 'optional' | 'block' {
    return 'swap';
  }

  preload(): boolean {
    return true;
  }

  recommendations() {
    return {
      display: this.display(),
      preload: this.preload(),
      adjustFontFallback: true,
      subset: true,
    };
  }
}

export const fontOptimizer = new FontOptimizer();
