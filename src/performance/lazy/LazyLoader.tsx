'use client';

import {
  lazy,
  Suspense,
  type ComponentType,
  type ReactNode,
} from 'react';

interface LazyLoaderProps {
  factory: () => Promise<{ default: ComponentType<Record<string, unknown>> }>;
  fallback?: ReactNode;
  props?: Record<string, unknown>;
}

/**
 * Generic lazy boundary for heavy sections (tool UI, charts, editors).
 */
export function LazyLoader({ factory, fallback = null, props = {} }: LazyLoaderProps) {
  const Comp = lazy(factory);
  return (
    <Suspense fallback={fallback}>
      <Comp {...props} />
    </Suspense>
  );
}

export function createLazyComponent<P extends object>(
  factory: () => Promise<{ default: ComponentType<P> }>
) {
  return lazy(factory);
}
