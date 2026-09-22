export interface OptimizedImageProps {
  src: string;
  alt: string;
  width?: number;
  height?: number;
  priority?: boolean;
  sizes?: string;
  quality?: number;
  className?: string;
}

/**
 * Defaults for next/image usage across the platform.
 * Prefer WebP/AVIF via Next image config; lazy by default unless priority.
 */
export class ImageOptimizer {
  defaults(input: OptimizedImageProps): OptimizedImageProps {
    return {
      quality: 75,
      sizes: '(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw',
      ...input,
      // next/image handles format negotiation when configured
    };
  }

  shouldPriority(path: string): boolean {
    return path === '/' || path.startsWith('/tools/') === false && path === '/';
  }
}

export const imageOptimizer = new ImageOptimizer();
