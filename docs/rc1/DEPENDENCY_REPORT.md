# Dependency Report

## Runtime
- next ^15.3, react ^19, react-dom ^19

## Dev
- typescript, eslint, prettier, vitest, playwright, testing-library, husky, lint-staged

## Notes
- Stack docs mention Tailwind, Lucide, next-themes; implementation uses CSS variable theme tokens. Align packages only when UI layer migrates.
- No known duplicate package conflicts in package.json
- Run `pnpm audit` on CI with network for CVE scan
