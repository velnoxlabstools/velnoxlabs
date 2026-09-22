'use client';

import { useMemo } from 'react';
import { contentManager } from '../services/ContentManager';

export function useContent(idOrSlug: string) {
  return useMemo(() => contentManager.get(idOrSlug), [idOrSlug]);
}
