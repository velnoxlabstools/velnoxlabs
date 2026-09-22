/** Static popular seeds — can be replaced by analytics later */
const POPULAR = [
  'json',
  'base64',
  'password',
  'color',
  'uuid',
  'hash',
  'url',
  'text',
];

export class PopularSearchManager {
  list(limit = 8): string[] {
    return POPULAR.slice(0, limit);
  }
}

export const popularSearchManager = new PopularSearchManager();
