export const SEOTestSuite = {
  name: 'seo',
  checks: ['metadata', 'schema-jsonld', 'canonical', 'sitemap', 'robots', 'open-graph'],
  routes: ['/', '/tools', '/categories', '/search'],
};
