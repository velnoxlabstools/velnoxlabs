'use client';

import { useMemo } from 'react';
import type { SEOPageInput } from '../types';
import { metadataGenerator } from '../metadata';

export function useSEO(input: SEOPageInput) {
  return useMemo(() => {
    return {
      meta: metadataGenerator.generate(input),
      jsonLd: metadataGenerator.toJsonLd(input),
    };
  }, [input]);
}
