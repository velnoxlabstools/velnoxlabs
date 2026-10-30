# VelnoxLabs Permanent Development Rules

Refer to and strictly follow [DEVELOPMENT_RULES.md](file:///C:/Users/chouh/Downloads/velnoxlabs-v1.0.0-rc1/velnoxlabs/DEVELOPMENT_RULES.md) whenever creating, updating, or maintaining tools in this project.

1. **Every new tool MUST be translated into all 10 locales before pushing.**
   - All 10 locales: `en`, `zh`, `es`, `pt`, `de`, `fr`, `it`, `ja`, `ru`, `ko`.
   - Update both `messages/tools/<locale>.json` (under `ToolUI.<toolNamespace>`) and `messages/<locale>.json`.
   - Obey forbidden patterns (e.g. Italian avoids `Output`/`Download`/`Copy`, French avoids `Format`/`Download`/`Copy`/`Clear`, etc.).

2. **Every new tool MUST use the centralized `<ToolSeoContent>` component for Hidden SEO.**
   - Location: `src/features/tools/sections/ToolSeoContent.tsx`.
   - Handles Hreflang tags (all 10 locales + `x-default`), localized metadata, and dynamic JSON-LD schemas (`WebApplication` and `FAQPage`).
   - Do NOT add redundant hardcoded `<script type="application/ld+json">` tags to individual tool pages.

3. **Every new tool MUST have UNIQUE, technical SEO content.**
   - Never use generic fallback strings.
   - Always supply `customAbout`, `customFeatures` (4 items), `customSteps` (3 items with `title` and `body`), and `customFaqs` (4 items with `q` and `a`).
   - Include domain-specific technical depth (RFCs, NIST/W3C specifications, cryptographic standards, performance characteristics).

4. **Always run `scripts/verify-all-tools.js` and `pnpm build` before committing.**
   - Ensure 0 hardcoded English strings and 0 errors across all 486+ page permutations.
