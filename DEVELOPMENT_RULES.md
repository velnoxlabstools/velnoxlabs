# VelnoxLabs Permanent Development Rules

These rules govern the architecture, localization, technical SEO, and verification pipeline for all tools developed in VelnoxLabs. Every new tool created in the codebase must strictly adhere to these standards.

---

## 1. Full 10-Locale Localization

Every tool must support all 10 active locales before any commit or push to production:

- **Locales**: `en` (English), `zh` (Chinese), `es` (Spanish), `pt` (Portuguese), `de` (German), `fr` (French), `it` (Italian), `ja` (Japanese), `ru` (Russian), `ko` (Korean).
- **Files to Update**:
  - `messages/tools/<locale>.json` (under `ToolUI.<toolNamespace>`)
  - `messages/<locale>.json` (root synchronized copy)
- **Zero Fallbacks Allowed**: Never leave non-English locales falling back to English strings.
- **Language-Specific Conventions**:
  - **Italian (`it`)**: Avoid standalone `Output` (use `Risultato` or `valore generato`), avoid `Download` (use `Scarica`), avoid `Copy` (use `Copia`).
  - **Portuguese (`pt`)**: Avoid `Download` (use `Baixar` or `Descarregar`), avoid `Copy` (use `Copiar`).
  - **Spanish (`es`)**: Avoid `Download` (use `Descargar`), avoid `Copy` (use `Copiar`).
  - **French (`fr`)**: Avoid standalone `Format` (use `Formats` or `type de fichier`), avoid `Download` (use `Télécharger`), avoid `Copy` (use `Copier`), avoid `Clear` (use `Effacer`).
  - **German (`de`)**: Avoid `Download` (use `Herunterladen`), avoid `Copy` (use `Kopieren`).
  - **Russian (`ru`)**: Avoid `Download` (use `Скачать`), avoid `Copy` (use `Копировать`).

---

## 2. Centralized Technical SEO via `<ToolSeoContent>`

Every tool page (`src/app/[locale]/tools/<tool-slug>/page.tsx`) must integrate the centralized `<ToolSeoContent>` component:

- **Location**: `src/features/tools/sections/ToolSeoContent.tsx`
- **Responsibilities**:
  - Generates localized `<link rel="alternate" hreflang="..." />` tags for all 10 locales plus `x-default`.
  - Generates canonical metadata and OpenGraph / Twitter tags.
  - Automatically generates rich Google JSON-LD schema graphs (`WebApplication` and `FAQPage`) dynamically translated into the active locale.
- **No Redundant Schemas**: Never write inline `<script type="application/ld+json">` or hardcoded `const schemaData = { ... }` in individual tool pages. `<ToolSeoContent>` handles all structured data centrally.

---

## 3. Unique, Deep Technical SEO Content (Anti-Thin-Content)

To prevent Google penalties for duplicate or thin content, every tool must have unique, domain-specific SEO copy. Never rely on generic fallbacks.

Each tool must define and pass custom props to `<ToolSeoContent>`:

- `customAbout`: Technical overview detailing underlying algorithms, RFC/NIST/W3C specifications, and execution characteristics.
- `customFeatures`: Exactly 4 technical features highlighting precision, security boundaries, performance, and formatting capabilities.
- `customSteps`: Exactly 3 procedural steps with localized titles and bodies (`step1Title`, `step1Body`, `step2Title`, `step2Body`, `step3Title`, `step3Body`).
- `customFaqs`: Exactly 3 to 4 domain-specific FAQs (`faq1Q`/`faq1A` through `faq4Q`/`faq4A`) answering user security, performance, format, and specification questions.

### Standard Wiring Example:

```tsx
<ToolSeoContent
  toolSlug="tool-slug"
  toolName={tUI('title')}
  description={tUI('subtitle')}
  customAbout={tUI('aboutText')}
  customFeatures={[tUI('feature1'), tUI('feature2'), tUI('feature3'), tUI('feature4')]}
  customSteps={[
    { title: tUI('step1Title'), body: tUI('step1Body') },
    { title: tUI('step2Title'), body: tUI('step2Body') },
    { title: tUI('step3Title'), body: tUI('step3Body') },
  ]}
  customFaqs={[
    { q: tUI('faq1Q'), a: tUI('faq1A') },
    { q: tUI('faq2Q'), a: tUI('faq2A') },
    { q: tUI('faq3Q'), a: tUI('faq3A') },
    { q: tUI('faq4Q'), a: tUI('faq4A') },
  ]}
/>
```

---

## 4. Mandatory Verification Audit Before Commit

Before staging or committing any code:

1. **Production Build**: Run `pnpm build` to verify compilation, bundle generation, and zero TypeScript / Next.js errors.
2. **Automated Verification Audit**: Run `node scripts/verify-all-tools.js`.
   - Audits all tools across all 9 non-English locales (486+ permutations).
   - Verifies **0 Hardcoded English Strings** and **0 HTTP errors**.
   - Commits are strictly prohibited if any tool fails verification.

---

## 5. UI & Privacy Architectural Principles

- **100% Client-Side Execution**: All processing (parsing, conversion, cryptography, image processing) must execute in the browser using Web APIs (Web Crypto, Canvas, Web Workers). No user data may leave the client.
- **Design System Consistency**: Use standard layout components (`GlobalContainer`, `SectionHeading`) and design tokens via CSS variables (`var(--bg-card)`, `var(--text-main)`, `var(--border-color)`, `var(--space-*)`).
