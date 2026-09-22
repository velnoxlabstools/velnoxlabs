import type { SearchIndexDocument, ScoredSearchHit } from '../types';
import { tokenize } from '../utils';

export class SearchRankingEngine {
  score(doc: SearchIndexDocument, query: string): ScoredSearchHit | null {
    const terms = tokenize(query);
    if (!terms.length) return null;

    let score = 0;
    const matchedIn: string[] = [];
    const title = doc.title.toLowerCase();
    const desc = doc.description.toLowerCase();
    const href = doc.href.toLowerCase();
    const tags = doc.tags.map((t) => t.toLowerCase());
    const keywords = doc.keywords.map((k) => k.toLowerCase());

    for (const term of terms) {
      if (title === term) {
        score += 100;
        matchedIn.push('title-exact');
      } else if (title.startsWith(term)) {
        score += 60;
        matchedIn.push('title-prefix');
      } else if (title.includes(term)) {
        score += 40;
        matchedIn.push('title');
      }

      if (keywords.some((k) => k === term || k.startsWith(term))) {
        score += 25;
        matchedIn.push('keyword');
      }
      if (tags.some((t) => t.includes(term))) {
        score += 15;
        matchedIn.push('tag');
      }
      if (desc.includes(term)) {
        score += 8;
        matchedIn.push('description');
      }
      if (href.includes(term)) {
        score += 5;
        matchedIn.push('href');
      }
    }

    // Base quality boost
    score += Math.min(20, doc.popularity / 5000);
    if (doc.featured) score += 10;
    if (doc.type === 'tool') score += 5;

    if (score <= 0) return null;
    return { ...doc, score, matchedIn: [...new Set(matchedIn)] };
  }

  rank(docs: SearchIndexDocument[], query: string): ScoredSearchHit[] {
    return docs
      .map((d) => this.score(d, query))
      .filter((h): h is ScoredSearchHit => h != null)
      .sort((a, b) => b.score - a.score || a.title.localeCompare(b.title));
  }
}

export const searchRankingEngine = new SearchRankingEngine();
