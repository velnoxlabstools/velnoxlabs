import type { FAQItem } from '../types';

const store = new Map<string, FAQItem>();

export class FAQManager {
  set(item: FAQItem): void {
    store.set(item.id, item);
  }

  get(id: string): FAQItem | undefined {
    return store.get(id);
  }

  list(category?: string): FAQItem[] {
    const all = [...store.values()];
    if (!category) return all;
    return all.filter((f) => f.category === category);
  }

  fromBlocks(faqs: { question: string; answer: string }[]): FAQItem[] {
    return faqs.map((f, i) => ({
      id: `faq-${i}-${f.question.slice(0, 16)}`,
      question: f.question,
      answer: f.answer,
    }));
  }

  clear(): void {
    store.clear();
  }
}

export const faqManager = new FAQManager();
