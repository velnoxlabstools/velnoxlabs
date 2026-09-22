/**
 * Asset optimization policy helpers (documented defaults for Next config).
 */
export class AssetOptimizer {
  /** Recommended next.config images settings */
  imageConfig() {
    return {
      formats: ['image/avif', 'image/webp'] as const,
      minimumCacheTTL: 60 * 60 * 24 * 30,
      deviceSizes: [640, 750, 828, 1080, 1200, 1920],
      imageSizes: [16, 32, 48, 64, 96, 128, 256],
    };
  }

  shouldInlineAsset(sizeKb: number): boolean {
    return sizeKb <= 4;
  }
}

export const assetOptimizer = new AssetOptimizer();
