export type EmojiCategory =
  | 'smileys'
  | 'people'
  | 'animals'
  | 'food'
  | 'travel'
  | 'activities'
  | 'objects'
  | 'symbols'
  | 'flags'
  | 'hieroglyphs'
  | 'kaomoji'
  | 'combos';

export interface EmojiItem {
  emoji: string;
  name: string;
  category: EmojiCategory;
  keywords: string[];
}
