import type { Config } from 'tailwindcss';

const config: Config = {
  darkMode: 'class',
  content: [
    './src/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        page: 'var(--bg-page)',
        card: 'var(--bg-card)',
        main: 'var(--text-main)',
        muted: 'var(--text-muted)',
        border: 'var(--border-color)',
      },
    },
  },
  plugins: [],
};

export default config;
