/**
 * Batch 3 integration surface — discovers engine modules without redesign.
 */
import { dataEngine } from '@/data-engine';
import { exchangeManager } from '@/exchange-engine';
import { fileEngine } from '@/file-engine';
import { searchEngine } from '@/search/engine';
import { analyticsManager } from '@/analytics';
import { preferencesManager } from '@/preferences';
import { contentManager } from '@/content';
import { toolConfigurationManager } from '@/tool-engine/configuration';
import { toolLogicManager } from '@/tool-engine/logic';

export interface Batch3Health {
  dataEngine: boolean;
  exchange: boolean;
  fileEngine: boolean;
  search: boolean;
  analytics: boolean;
  preferences: boolean;
  content: boolean;
  configuration: boolean;
  logic: boolean;
}

export function validateBatch3Engines(): Batch3Health {
  return {
    dataEngine: typeof dataEngine.transform === 'function',
    exchange: typeof exchangeManager.export === 'function',
    fileEngine: typeof fileEngine.upload === 'function',
    search: typeof searchEngine.search === 'function',
    analytics: typeof analyticsManager.track === 'function',
    preferences: typeof preferencesManager.get === 'function',
    content: typeof contentManager.get === 'function',
    configuration: typeof toolConfigurationManager.register === 'function',
    logic: typeof toolLogicManager.execute === 'function',
  };
}

export function batch3Ready(): boolean {
  return Object.values(validateBatch3Engines()).every(Boolean);
}
