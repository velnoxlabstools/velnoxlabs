export const siteConfig = {
  name: 'VelnoxLabs',
  shortName: 'Velnox',
  description:
    'Free browser-based developer tools — format JSON, encode Base64, generate UUIDs, passwords, and more. Fast, private, no signup.',
  url: process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000',
  locale: 'en_US',
  twitterHandle: process.env.NEXT_PUBLIC_TWITTER_HANDLE || '',
  keywords: [
    'developer tools',
    'JSON formatter',
    'Base64 encoder',
    'UUID generator',
    'password generator',
    'online tools',
    'VelnoxLabs',
  ],
} as const;
