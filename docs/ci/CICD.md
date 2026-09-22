# CI/CD Architecture

## Workflow diagram
```
PR / push
  → quality (lint, typecheck, unit+coverage)
      → build
      → e2e
Tag v*.*.* / manual
  → release validation (full gate + version + deploy check)
```

## Pipelines
| Pipeline | Trigger | Steps |
|----------|---------|-------|
| CI quality | PR/push | install, lint, typecheck, test:coverage |
| CI build | after quality | pnpm build, bundle report |
| CI e2e | after quality | playwright chromium |
| Release | tags v* | quality + build + validate-release + deployment-validator |

## Quality gates
- Lint fail → block
- Typecheck fail → block
- Unit tests fail → block
- Build fail → block
- Coverage artifact uploaded for review

## Local
```bash
pnpm quality
pnpm release:validate
pnpm version:patch && pnpm changelog
```

## Pre-commit
Husky runs lint-staged + typecheck via scripts/automation/pre-commit.sh
