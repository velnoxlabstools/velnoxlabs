export const sampleToolConfig = {
  id: 'tool-sample-json',
  name: 'JSON Formatter',
  slug: 'json-formatter',
  description: 'Format and minify JSON',
  categoryId: 'cat-text',
  template: 'formatter' as const,
  tags: ['json'],
};

export const sampleJsonInput = `{
  "hello": "world",
  "n": 1
}`;

export const sampleSearchQueries = ['json', 'base64', 'password', 'xyznonexistent'];

export class FixtureManager {
  toolConfig() {
    return { ...sampleToolConfig };
  }

  jsonInput() {
    return sampleJsonInput;
  }

  searchQueries() {
    return [...sampleSearchQueries];
  }
}

export const fixtureManager = new FixtureManager();
