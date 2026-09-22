import type { HistoryEntry, HistoryKind } from '../types';
import { createId } from '../utils';

const MAX = 40;
const entries: HistoryEntry[] = [];

export class HistoryManager {
  push(kind: HistoryKind, label: string): HistoryEntry {
    const entry: HistoryEntry = {
      id: createId(),
      kind,
      label: label.slice(0, 120),
      timestamp: Date.now(),
    };
    entries.unshift(entry);
    if (entries.length > MAX) entries.length = MAX;
    return entry;
  }

  list(kind?: HistoryKind): HistoryEntry[] {
    return kind ? entries.filter((e) => e.kind === kind) : [...entries];
  }

  clear(): void {
    entries.length = 0;
  }
}

export const historyManager = new HistoryManager();
