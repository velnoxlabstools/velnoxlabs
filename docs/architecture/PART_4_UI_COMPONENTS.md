# Part 4 — Reusable UI Component Library

Inserted between Part 3 (Layout) and Part 5 (Header/Navigation/Footer).

## Purpose
Central, design-token-driven primitives used across the platform.
No page-specific logic. No tool business logic.

## Components
| Component | Role |
|-----------|------|
| Button | Primary actions, variants & sizes |
| LinkButton | Next.js Link styled as button |
| Input | Text fields with label/error |
| Textarea | Multi-line input |
| Card | Surface container |
| Badge | Status / tags |
| Alert | Inline feedback |
| Spinner | Loading indicator |
| Stack | Flex layout helper |
| Container | Max-width content width |
| VisuallyHidden | a11y-only text |
| SectionHeading / Description / Divider | Section chrome (existing) |
| EmptyState / LoadingState / ErrorState | State UI (existing) |

## Rules
- Values from CSS design tokens only
- Accessible defaults (labels, aria-invalid, roles)
- No duplicate button/card implementations elsewhere

## Integration
Import from `@/components/ui` or `@/components`.
