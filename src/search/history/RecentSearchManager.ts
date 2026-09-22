import { searchHistoryManager } from './SearchHistoryManager';

export class RecentSearchManager {
  list(limit = 8): string[] {
    return searchHistoryManager.list().slice(0, limit);
  }

  add(query: string): void {
    searchHistoryManager.add(query);
  }
}

export const recentSearchManager = new RecentSearchManager();
