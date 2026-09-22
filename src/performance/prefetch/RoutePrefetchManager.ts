/**
 * Route prefetch policy for App Router Link / router.prefetch.
 */
export class RoutePrefetchManager {
  /** High-priority routes to warm after idle */
  criticalRoutes(): string[] {
    return ['/', '/tools', '/categories', '/search'];
  }

  shouldPrefetch(href: string, viewport: 'mobile' | 'desktop' = 'desktop'): boolean {
    if (href.startsWith('http')) return false;
    if (viewport === 'mobile' && href.includes('/tools/')) return false;
    return true;
  }

  idlePrefetchList(extra: string[] = []): string[] {
    return [...new Set([...this.criticalRoutes(), ...extra])];
  }
}

export const routePrefetchManager = new RoutePrefetchManager();
