import type { ExportFormatPreference } from '../types';
import { preferencesManager } from '../services/PreferencesManager';

export class ExportPreferenceManager {
  getDefaultFormat(): ExportFormatPreference {
    return preferencesManager.get().defaultExportFormat;
  }

  setDefaultFormat(format: ExportFormatPreference): void {
    preferencesManager.set('defaultExportFormat', format);
  }
}

export const exportPreferenceManager = new ExportPreferenceManager();
