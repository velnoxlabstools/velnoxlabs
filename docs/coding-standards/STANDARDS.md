# Coding Standards

## Naming
- Folders: kebab-case or domain folders (tool-engine)
- Files: PascalCase for components/classes, camelCase for utils
- Hooks: useX
- Types: PascalCase interfaces/types
- Constants: UPPER_SNAKE or exported const camelCase

## Imports / Exports
- Prefer path alias @/
- Barrel index.ts per module
- No default exports for engines (named exports)

## TypeScript
- Strict mode
- Avoid any; prefer unknown + narrowing
- Exhaustive unions for status enums

## Comments
- No noise comments
- Document non-obvious constraints only

## Errors
- Use AppError / domain results { ok, error }
- Never expose stacks to users
- Log via security/monitoring loggers
