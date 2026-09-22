export class BundleOptimizer {
  /** Mark packages safe for optimizePackageImports in next.config */
  optimizePackageImports(): string[] {
    return ['lucide-react', 'date-fns', 'lodash-es'];
  }

  /** Heavy areas that should always be dynamically imported */
  dynamicImportTargets(): string[] {
    return [
      'tool workspace editors',
      'charts',
      'markdown preview',
      'code highlight',
      'pdf viewers',
    ];
  }
}

export const bundleOptimizer = new BundleOptimizer();
