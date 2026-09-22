'use client';

import { useCallback, useMemo, useState } from 'react';
import type { CategoryRegistrationInput } from '../types';
import { categoryService } from '../services/CategoryService';
import { categoryLoader } from '../registry/CategoryLoader';
import { categoryRelationshipEngine } from '../relationships';
import { categoryRegistry } from '../registry';
import { categoryStatistics } from '../registry/CategoryStatistics';

export function useCategoryEngine() {
  const [tick, setTick] = useState(0);
  const refresh = useCallback(() => setTick((t) => t + 1), []);

  const categories = useMemo(() => {
    void tick;
    return categoryRegistry.list();
  }, [tick]);

  const create = useCallback(
    (input: CategoryRegistrationInput) => {
      const result = categoryService.create(input);
      refresh();
      return result;
    },
    [refresh]
  );

  const remove = useCallback(
    (idOrSlug: string) => {
      const ok = categoryService.remove(idOrSlug);
      refresh();
      return ok;
    },
    [refresh]
  );

  const assignTool = useCallback(
    (toolId: string, categoryId: string) => {
      const ok = categoryService.assignTool(toolId, categoryId);
      refresh();
      return ok;
    },
    [refresh]
  );

  return {
    categories,
    create,
    update: categoryService.update.bind(categoryService),
    remove,
    assignTool,
    load: categoryLoader.load.bind(categoryLoader),
    loadPublic: categoryLoader.loadPublic.bind(categoryLoader),
    relations: categoryRelationshipEngine,
    stats: categoryStatistics,
    refresh,
  };
}
