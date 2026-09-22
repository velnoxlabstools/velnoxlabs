import type { ResultDisplayMode, ToolLayoutMode, ToolViewMode } from '../types';
import { preferencesManager } from '../services/PreferencesManager';

export class UILayoutManager {
  setToolView(mode: ToolViewMode) {
    preferencesManager.set('defaultToolView', mode);
  }

  setResultMode(mode: ResultDisplayMode) {
    preferencesManager.set('resultDisplayMode', mode);
  }

  setToolLayout(mode: ToolLayoutMode) {
    preferencesManager.set('toolLayout', mode);
  }

  applyCssVariables(): void {
    if (typeof document === 'undefined') return;
    const p = preferencesManager.get();
    document.documentElement.style.setProperty('--font-scale', String(p.fontScale));
    if (p.reducedMotion || p.animation === 'none' || p.animation === 'reduced') {
      document.documentElement.style.setProperty('--motion-scale', '0');
    } else {
      document.documentElement.style.setProperty('--motion-scale', '1');
    }
  }
}

export const uiLayoutManager = new UILayoutManager();
