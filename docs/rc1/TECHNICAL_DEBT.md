# Technical Debt Closure Report

## Closed in Part 39
- Empty middleware (no security headers) → fixed
- Minimal next.config → production options applied
- Runtime empty for seed tools → bootstrapSeedTools

## Accepted residual (non-blocking)
| Item | Priority | Plan |
|------|----------|------|
| Consolidate search feature vs engine | P2 | Batch 5 cleanup |
| CSP unsafe-inline until nonces | P2 | Security follow-up |
| Multi-instance rate limit store | P2 | Edge Redis adapter |
| Full tool seed → logic mapping | P2 | Expand bootstrap catalog |
| Playwright/Vitest full CI run | P1 | Requires network CI runners |
| Legal page copy | P3 | Marketing content |

## Dead code policy
No mass deletion of dual stacks to avoid breaking Parts 1–38 contracts. Prefer documentation + deprecation comments.
